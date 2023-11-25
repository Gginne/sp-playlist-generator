from flask import Flask, request, jsonify
from flask_cors import cross_origin, CORS
import openai
import spotipy

import requests
import base64
from dotenv import load_dotenv
import json

import os #provides ways to access the Operating System and allows us to read the environment variables

load_dotenv()

openai.api_key  = os.getenv("OPENAI_API_KEY")

client_id = os.getenv("SPOTIFY_CLIENT_ID")
client_secret = os.getenv("SPOTIFY_CLIENT_SECRET")

client_credentials = f"{client_id}:{client_secret}"
base64_credentials = base64.b64encode(client_credentials.encode()).decode()
auth_url = 'https://accounts.spotify.com/api/token'
auth_headers = {
    'Authorization': f'Basic {base64_credentials}'
}
auth_data = {
    'grant_type': 'client_credentials'
}
response = requests.post(auth_url, headers=auth_headers, data=auth_data)
if response.status_code == 200:
    token = response.json().get('access_token')
    sp = spotipy.Spotify(auth=token)
else:
    print('Failed to retrieve token')

app = Flask(__name__)

CORS(app)


@app.route('/login', methods=["POST"])
@cross_origin()
def login():
    oauth_payload = {
    'grant_type': 'authorization_code',
    'code': request.json.get("code"),
    'redirect_uri': 'http://localhost:3000',
    'client_id': os.getenv("SPOTIFY_CLIENT_ID"),
    'client_secret': os.getenv("SPOTIFY_CLIENT_SECRET")
}

    response = requests.post('https://accounts.spotify.com/api/token', data=oauth_payload)

    if response.status_code == 200:
    
        token_info = response.json()
        access_token = token_info['access_token']
        token_type = token_info['token_type']
        expires_in = token_info['expires_in']
        
        return jsonify({
            "accessToken": access_token,
            "tokenType": token_type,
            "expiresIn": expires_in
        }), 200
  
    return jsonify({"error": response.json()}), 400

@app.route("/refresh", methods=["POST"])
@cross_origin()
def refresh():
    

    if not refresh_token:
        return jsonify({"error": "Refresh token is required"}), 400
    
    refresh_token = request.json.get("refreshToken")

    payload = {
        'refresh_token': refresh_token,
    }

    headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }

    response = requests.post('https://example.com/v1/refresh', data=payload, headers=headers)

    if response.status_code == 200:
        # Handle successful response here
        token_info = response.json()
        
        if "access_token" in token_info:
            access_token = token_info["access_token"]
            expires_in = token_info["expires_in"]
            return jsonify({"accessToken": access_token, "expiresIn": expires_in}), 200
    
    return jsonify({"error": "Refresh failed"}), 400

@app.route('/get_playlist', methods=["POST"])
@cross_origin()
def get_playlist():
    sample = """[
    {"song": "Chicken Fried", "artist": "Zac Brown Band"},
    {"song": "Dirt Road Anthem", "artist": "Jason Aldean"},
    {"song": "Country Roads", "artist": "John Denver"},
    {"song": "Farmers Daughter", "artist": "Rodney Atkins"}
]"""
    data = request.get_json(silent=True)
    prompt = data.get('prompt')
    count = data.get('count')

    messages = [
        {"role": "system", "content": """ You are a helpful playlist-generatign assistant. 
        I will provide you with a text prompt, from which you should generate a list of songs and their artists.
        You should only respond with a RFC8259 compliant JSON array, where each element has the format: {"song": <song_title", "artist": <artist_name>}.
        """},
        {"role": "user", "content": "Generate a playlist of 4 songs based on this prompt: 'Food Songs'"},
        {"role": "assistant", "content": sample},
        {"role": "user", "content": f"Generate a playlist of {count} songs based on this prompt: '{prompt}'"},
    ]

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=messages,
        max_tokens=400
    )

    print(response["choices"][0]["message"]["content"].strip())

    playlist = json.loads(response["choices"][0]["message"]["content"].strip())
    
    # Gather search queries for all songs and artists
    search_queries = [f"{song['song']} {song['artist']}" for song in playlist]

    # Use Spotify's search API to get track details for all search queries at once

    tracks_info = []
    for query in search_queries:
        search_results = sp.search(q=query, type="track", limit=1)
        if search_results['tracks']['items']:
            track_info = {
                "track_id": search_results['tracks']['items'][0]['id'],
                "image": search_results['tracks']['items'][0]['album']['images'][0]['url']
            }
            tracks_info.append(track_info)

    # Combine track details with the playlist data
    for i, track_info in enumerate(tracks_info):
        playlist[i].update(track_info)

    return jsonify(playlist)


@app.route("/create_playlist", methods=["POST"])
@cross_origin()
def create_playlist():
    access_token = request.headers.get("Authorization").split(" ")[1]
    sp = spotipy.Spotify(auth=access_token)
    
    data = request.get_json(silent=True)
    tracks = data.get('tracks')
    name = data.get('name')

    user = sp.current_user()
    playlist = sp.user_playlist_create(
        user["id"],
        name=name,
        public=False
    )

    sp.user_playlist_add_tracks(user["id"], playlist["id"], tracks)
    
    return jsonify({"playlist_id": playlist["id"]})



if __name__ == '__main__':
    app.run(debug=True)