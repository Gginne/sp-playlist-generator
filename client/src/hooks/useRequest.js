import axios from "axios";
import { useState } from "react";

export default function useRequest(endpoint) {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(n)


  
    const doRequest = useCallback(async (body) => {
      try {
        setLoading(true)
        const response = await axios.post(endpoint, body);
        setData(response.data)
        console.log(response)
      } catch (error) {
        setError(error)
      } finally {
        setLoading(false)
      }
    }, [options]);
  
    return { doRequest, data, loading, error };
  }