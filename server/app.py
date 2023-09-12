from flask import Flask, request, jsonify
from flask_cors import cross_origin, CORS
import openai
import spotipy

from dotenv import dotenv_values
import json

config = dotenv_values('.env')
openai.api_key  = config["OPENAI_KEY"]

app = Flask(__name__)

sp = spotipy.Spotify(
        auth_manager=spotipy.SpotifyOAuth(
            client_id=config["SPOTIFY_CLIENT_ID"],
            client_secret=config["SPOTIFY_CLIENT_SECRET"],
            redirect_uri=config["SPOTIFY_REDIRECT_URI"],
            scope="playlist-modify-private"
        )
    )

current_user = sp.current_user()
CORS(app)
track_ids = []
assert current_user is not None

@app.route('/get_playlist', methods=["POST"])
@cross_origin()
def get_playlist():
    sample = """
        [
            {"song": "Life is a Highway", "artist": "Tom Cochrane"},
            {"song": "On the Road Again", "artist": "Willie Nelson"},
            {"song": "Born to Run", "artist": "Bruce Springsteen"},
            {"song": "Sweet Home Alabama", "artist": "Lynyrd Skynyrd"},
            {"song": "Take Me Home, Country Roads", "artist": "John Denver"},
            {"song": "Ramble On", "artist": "Led Zeppelin"},
            {"song": "Go Your Own Way", "artist": "Fleetwood Mac"},
        ]
    """
    data = request.get_json(silent=True)
    prompt = data.get('prompt')
    count = data.get('count')
    print(prompt, count)
    messages = [
        {"role": "system", "content": """ You are a helpful playlist-generatign assistant. 
        I will provide you with a text prompt, and based on it, you should generate a list of songs and their artists.
        You should return a JSON array, where each element follows the following format: {"song": <song_title", "artist": <artist_name>}
        """},
        {"role": "user", "content": "Generate a playlist of 7 songs based on this prompt: 'Songs for the road'"},
        {"role": "assistant", "content": sample},
        {"role": "user", "content": f"Generate a playlist of {count} songs based on this prompt: {prompt}"},
    ]

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=messages,
        max_tokens=400
    )

    playlist = json.loads(response["choices"][0]["message"]["content"])

    for i in range(len(playlist)):
        artist, song = playlist[i]["artist"], playlist[i]["song"]
        query = f"{song} {artist}"
        search_results = sp.search(q=query, type="track", limit=10)
        playlist[i]["track_id"] = search_results["tracks"]["items"][0]["id"]
        playlist[i]["image"] = search_results["tracks"]["items"][0]["album"]["images"][0]["url"]
    return playlist


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