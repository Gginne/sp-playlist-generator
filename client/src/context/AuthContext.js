
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

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
  const [refreshToken, setRefreshToken] = useState(
    getSessionStorage("refresh_token", null)
  );
  const [expiresIn, setExpiresIn] = useState(
    getSessionStorage("expires_in", null)
  );

  const login = () => {
    const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
    const redirectUri = encodeURIComponent(
      process.env.REACT_APP_SPOTIFY_REDIRECT_URI
    );
    const scopes = "playlist-modify-private playlist-modify-public"; // Specify required scopes
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes}&response_type=code`;

    window.location.href = authUrl;
  };

  const logout = () => {
    try {
      window.open("https://accounts.spotify.com/logout", "_blank");
      setAccessToken(null);
      setRefreshToken(null);
      setExpiresIn(null)
      window.sessionStorage.clear();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  useEffect(() => {

    const code = new URLSearchParams(window.location.search).get("code");

    if (code) {
      axios
        .post(`${process.env.REACT_APP_FLASK_API_URL}/login`, {
          code,
        })
        .then((res) => {
          setAccessToken(res.data.accessToken);
          setRefreshToken(res.data.refreshToken);
          setExpiresIn(Number(res.data.expiresIn));
          window.history.pushState({}, null, "/");
        })
        .catch(() => {
          window.location = "/";
        });
    }
  }, []);

  useEffect(() => {
    if (!refreshToken || !expiresIn) return;
    const interval = setInterval(() => {
      axios
        .post(`${process.env.REACT_APP_FLASK_API_URL}/refresh`, {
          refreshToken,
        })
        .then((res) => {
          setAccessToken(res.data.accessToken);
          setExpiresIn(res.data.expiresIn);
        })
        .catch(() => {
          window.location = "/";
        });
    }, (expiresIn - 60) * 1000);

    return () => clearInterval(interval);
  }, [refreshToken, expiresIn]);

  return (
    <AuthContext.Provider value={{ login, logout, accessToken }}>
      {children}
    </AuthContext.Provider>
  );
};
