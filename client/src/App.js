import { useState } from "react";
import axios from "axios";
import "./App.css";
import TrackCard from "./components/TrackCard";
import { useAuth } from "./context/AuthContext";

function App() {
  const [prompt, setPrompt] = useState("");
  const [name, setName] = useState("");
  const [count, setCount] = useState(0);
  const [playlist, setPlaylist] = useState([]);

  const { login, logout, accessToken } = useAuth();
  const get_playlist = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/get_playlist", {
        prompt,
        count,
      });
      setPlaylist(res.data);
      setName(prompt);
      console.log(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const create_playlist = async (e) => {
    try {
      const res = await axios.post("http://localhost:5000/create_playlist", {
        name,
        tracks: playlist.map((p) => p["track_id"]),
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
      );
     
      console.log(res.data);
    } catch (err) {
      console.log(err);
    }
  }
  return (
    <div className="h-screen">
      <header className="bg-black h-1/6 shadow-lg">
        <form
          className="h-full flex items-center my-auto justify-center"
          onSubmit={get_playlist}
        >
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="bg-dark p-4 text-white rounded-l-md w-1/3 text-lg"
            placeholder="Enter Playlist Prompt"
          />
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="bg-dark p-4 text-white text-lg"
            min={0}
            max={10}
          />

          <button className="bg-emerald-500 text-white p-4 rounded-r-md text-lg hover:bg-emerald-700">
            Generate
          </button>
        </form>
      </header>
      <main className="mt-3 px-16 ">
        {playlist.length > 0 && (
          <div className="flex justify-between">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-black border-2 border-black p-2 py-3 shadow-sm text-white rounded-md text-md"
              placeholder="Enter Playlist Name"
            />

            {accessToken ? (
              <div className="flex">
              <button className="mx-2 bg-emerald-500 text-white p-2 rounded-md text-sm hover:bg-emerald-700" onClick={create_playlist}>
                Save to Spotify Playlist
              </button>
              <button className="bg-red-500 text-white p-2 rounded-md text-sm hover:bg-red-700" onClick={logout}>
                Disconnect Account
              </button>
              </div>
            ) : (
              
              <button className="bg-emerald-500 text-white p-2 rounded-md text-lg hover:bg-emerald-700" onClick={login}>
                Connect To Spotify to Save 
              </button>
              
            )}
          </div>
        )}
        <div className="mt-4 grid xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {playlist.map((track) => (
            <div className="">
              <TrackCard data={track} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
