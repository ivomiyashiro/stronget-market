import { useTestService } from "@/hooks/use-test-service";

const Landing = () => {
  const { data, loading, error } = useTestService();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{JSON.stringify(data)}</div>;
};

export default Landing;
