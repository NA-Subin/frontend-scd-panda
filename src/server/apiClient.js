import Cookies from "js-cookie";

const API_BASE = process.env.REACT_APP_API_URL;

if (!API_BASE) {
  console.error(
    "REACT_APP_API_URL is not set. Copy .env.local.example to .env.local and restart the dev server."
  );
}

async function request(method, path, body) {
  const token = Cookies.get("token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const error = new Error(data?.error || `Request failed: ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

export const apiGet = (path) => request("GET", path);
export const apiPost = (path, body) => request("POST", path, body);
export const apiPut = (path, body) => request("PUT", path, body);
export const apiDelete = (path) => request("DELETE", path);
