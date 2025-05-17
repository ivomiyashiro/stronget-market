import { useEffect, useState } from "react";
import { testService, type RootResponse } from "@/services/test.service";

export const useTestService = () => {
  const [data, setData] = useState<RootResponse>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    testService
      .getServerInfo()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
};
