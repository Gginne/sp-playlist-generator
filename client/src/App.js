import { useState, useMemo } from "react";
import axios from "axios";
import "./App.css";
import TrackCard from "./components/TrackCard";
import { useAuth } from "./context/AuthContext";
import useRequest from "./hooks/useRequest";
import Spinner from "./components/Spinner";

function App() {
  const [prompt, setPrompt] = useState("");
  const [name, setName] = useState("");
  const [count, setCount] = useState(0);

  const { login, logout, accessToken } = useAuth();
  const getPlaylistRequest = useRequest("/api/get_playlist");

  // Function to create playlist
  const createPlaylist = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/create_playlist",
        {
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
      // Add visual feedback for successful playlist creation
      // Example: Set a success message or change UI accordingly
    } catch (err) {
      console.log(err);
      // Display an error message if playlist creation fails
    }
  };

  const handleFetchPlaylist = (e) => {
    e.preventDefault();
    getPlaylistRequest.clear();
    getPlaylistRequest.request({ prompt, count });
    setName(name);
  };

  const playlist = useMemo(
    () => getPlaylistRequest.data,
    [getPlaylistRequest.data]
  );

  return (
    <div className="h-screen bg-dark">
      {/* Header */}
      <header className="bg-black shadow-lg pt-5 pb-6 flex justify-between items-center">
        <div>
          <h1 className="text-white text-2xl font-bold ml-6">Playlist Generator</h1>
        </div>
        <div className="mr-6">
          {!accessToken ? (
            <button
              className="bg-emerald-500 text-white py-1 px-3 rounded-xl text-sm hover:bg-emerald-700"
              onClick={login}
            >
              Connect To Spotify
            </button>
          ) : (
            <button
              className="bg-red-500 text-white py-1 px-3 rounded-xl text-sm hover:bg-red-700"
              onClick={logout}
            >
              Logout From Spotify
            </button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="mt-5 px-8">
        {/* Form */}
        <form
          className="flex flex-col md:flex-row items-center justify-center mb-8 md:w-3/5 mx-auto w-full"
          onSubmit={handleFetchPlaylist}
        >
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="bg-black p-4 text-gray-300 rounded-l-md mb-2 md:mb-0 md:mr-2 sm:w-full md:w-2/3 text-lg focus:outline-none"
            placeholder="Enter Playlist Prompt"
          />
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="bg-black p-4 text-gray-300 text-lg sm:w-full md:w-1/3 focus:outline-none"
            placeholder="Number of Tracks"
            min={0}
            max={10}
          />
          <button className="bg-emerald-500 text-white p-4 rounded text-lg hover:bg-emerald-700 sm:w-full md:w-auto mt-2 md:mt-0">
            Generate
          </button>
        </form>

        {/* Loading indicator */}
        {getPlaylistRequest.loading && <Spinner />}

        {/* Error message display */}
        {getPlaylistRequest.error && <p>{getPlaylistRequest.error}</p>}

        {playlist && (
          <>
            {/* Save Playlist section */}
            {accessToken && (
              <div className="flex justify-center mb-4">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-black px-2 py-3 shadow-sm text-gray-800 rounded-l-md focus:outline-none"
                  placeholder="Enter Playlist Name"
                />
                <button
                  className="bg-emerald-500 text-white px-2 py-3 text-md rounded-r-md hover:bg-emerald-700 focus:outline-none"
                  onClick={createPlaylist}
                >
                  Save Playlist
                </button>
              </div>
            )}

            {/* Track cards section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {playlist.map((track, index) => (
                <div key={index} className="">
                  <TrackCard data={track} />
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
