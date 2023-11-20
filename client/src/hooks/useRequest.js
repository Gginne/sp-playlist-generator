import axios from "axios";
import { useState, useCallback } from "react";

export default function useRequest(endpoint) {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const request = useCallback(async (body) => {
      try {
        setLoading(true)
        const response = await axios.post(endpoint, body);
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