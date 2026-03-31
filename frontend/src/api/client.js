import axios from "axios";


function resolveApiBaseUrl() {
  const runtimeApiBaseUrl = globalThis.window?.electronAPI?.runtimeConfig?.apiBaseUrl;
  const configuredApiBaseUrl =
    runtimeApiBaseUrl || process.env.REACT_APP_API_BASE || "http://localhost:8000/api";

  return configuredApiBaseUrl.replace(/\/+$/, "");
}

const client = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 10000
});

export default client;
