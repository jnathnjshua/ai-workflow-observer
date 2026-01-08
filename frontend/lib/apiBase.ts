const STORAGE_KEY = "apiBaseUrl";

export function getDefaultApiBase() {
  return process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
}

export function getApiBaseUrl() {
  if (typeof window === "undefined") {
    return getDefaultApiBase();
  }
  return window.localStorage.getItem(STORAGE_KEY) || getDefaultApiBase();
}

export function setApiBaseUrl(next: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, next);
}

export function resetApiBaseUrl() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
