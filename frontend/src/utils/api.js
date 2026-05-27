import { authHeaders, clearAuthToken } from "./auth";

const API_BASE = import.meta.env.VITE_API_URL || "";

/** Normalize FastAPI error bodies for display in the UI. */
export function formatApiError(err) {
  if (!err) return "Request failed";
  if (typeof err === "string") return err;
  const message = err.message;
  if (message && typeof message === "string") return message;
  return "Request failed";
}

function formatErrorDetail(detail) {
  if (!detail) return null;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item?.msg && item?.loc) return `${item.loc.filter((p) => p !== "body").join(".")}: ${item.msg}`;
        if (item?.msg) return item.msg;
        return JSON.stringify(item);
      })
      .join(" ");
  }
  if (typeof detail === "object" && detail.msg) return detail.msg;
  return String(detail);
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...authHeaders(),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    clearAuthToken();
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = formatErrorDetail(err.detail) || res.statusText || "Request failed";
    console.error(`[API] ${options.method || "GET"} ${path} → ${res.status}`, message);
    throw new Error(message);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  getBio: () => request("/api/bio"),
  updateBio: (content) => request("/api/bio", { method: "PUT", body: JSON.stringify({ content }) }),
  getMotto: () => request("/api/motto"),
  updateMotto: (content) =>
    request("/api/motto", { method: "PUT", body: JSON.stringify({ content }) }),
  getShows: () => request("/api/shows"),
  createShow: (data) => request("/api/shows", { method: "POST", body: JSON.stringify(data) }),
  updateShow: (id, data) => request(`/api/shows/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteShow: (id) => request(`/api/shows/${id}`, { method: "DELETE" }),
  getLinks: () => request("/api/links"),
  updateLink: (id, data) => request(`/api/links/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  updateLinksBatch: (links) =>
    request("/api/links/batch", { method: "PUT", body: JSON.stringify({ links }) }),
  getPhotos: () => request("/api/photos"),
  uploadPhoto: (file, caption) => {
    const form = new FormData();
    form.append("file", file);
    if (caption) form.append("caption", caption);
    return request("/api/photos", { method: "POST", body: form });
  },
  deletePhoto: (id) => request(`/api/photos/${id}`, { method: "DELETE" }),
  login: (username, password) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
};
