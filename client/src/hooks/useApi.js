import { useState, useEffect } from 'react';
import { postService, categoryService, authService } from '../services/api.js';

const useApi = (service, method, ...args) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (...callArgs) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service[method](...callArgs);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (args.length > 0) {
      execute(...args);
    }
  }, []);

  return { data, loading, error, execute };
};

export default useApi;