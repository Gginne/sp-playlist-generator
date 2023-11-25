import axios from "axios";
import { useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

export default function useRequest(endpoint) {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const { accessToken } = useAuth();

    const request = useCallback(async (body) => {
      try {
        setLoading(true)
        const response = await axios.post(endpoint, body, {

            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          
        });
        setData(response.data)
  
      } catch (error) {
        setError(error)
      } finally {
        setLoading(false)
      }
    }, [endpoint]);

    const clear = useCallback(() => {
      setData(null)
      setError(null)
    }, [])
  
    return { request, clear, data, loading, error };
  }