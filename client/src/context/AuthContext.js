// SoundContext.tsx
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useSound must be used within a SoundProvider");
  }
  return context;
};

const getSessionStorage = (key, initialValue) => {
  try {
    const value = window.sessionStorage.getItem(key);
    return value ? JSON.parse(value) : initialValue;
  } catch (e) {
    // if error, return initial value
    return initialValue;
  }
};

function setSessionStorage(key, value) {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.log(e);
  }
}

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(
    getSessionStorage("access_token", null)
  );

  const login = () => {
    const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
    const redirectUri = encodeURIComponent(
      process.env.REACT_APP_SPOTIFY_REDIRECT_URI
    );
    const scopes = "playlist-modify-private playlist-modify-public"; // Specify required scopes
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes}&response_type=token`;

    window.location.href = authUrl;
  };

  const logout = () => {
    try {
      window.open('https://accounts.spotify.com/logout', '_blank');
      setAccessToken(null);
      window.sessionStorage.clear()
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const token = hashParams.get("access_token");
    if (token) {
      setSessionStorage("access_token", token);
      setAccessToken(token);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ login, logout, accessToken }}>
      {children}
    </AuthContext.Provider>
  );
};
