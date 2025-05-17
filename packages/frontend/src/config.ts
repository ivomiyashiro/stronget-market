export const config = {
  baseUrl: import.meta.env.VITE_BASE_URL || "http://localhost:3030",
  apiVersion: import.meta.env.VITE_API_VERSION || "v1",
  apiUrl: `${import.meta.env.VITE_BASE_URL || "http://localhost:3030"}/api/${
    import.meta.env.VITE_API_VERSION || "v1"
  }`,
};
