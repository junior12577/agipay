export const API_BASE: string = (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE)
  || (typeof window !== "undefined" && (window as any).__API_BASE__)
  || "/api";

export async function apiFetch(path: string, init?: RequestInit) {
  const url = `${API_BASE}${path}`;
  return fetch(url, init);
}
