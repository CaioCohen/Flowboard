const LOCAL_API_BASE_URL = "http://localhost:3000";

export function resolveApiBaseUrl(configuredUrl: string | undefined): string {
  return configuredUrl?.trim().replace(/\/+$/, "") || LOCAL_API_BASE_URL;
}

export const apiBaseUrl = resolveApiBaseUrl(import.meta.env.VITE_API_BASE_URL);
