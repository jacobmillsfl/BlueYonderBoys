const TOKEN_KEY = "byb_jwt";

export function setAuthToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function decodePayload(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    let b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4;
    if (pad) b64 += "=".repeat(4 - pad);
    return JSON.parse(atob(b64));
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  const token = getAuthToken();
  if (!token) return false;
  const payload = decodePayload(token);
  if (!payload) {
    clearAuthToken();
    return false;
  }
  if (typeof payload.exp === "number" && Date.now() / 1000 >= payload.exp) {
    clearAuthToken();
    return false;
  }
  return true;
}

export function authHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
