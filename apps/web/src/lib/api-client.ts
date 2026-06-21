import type { ApiResponse, AuthResponse, LoginRequest } from "@bookpie/shared";

import { useAuthStore } from "@/stores/auth-store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000/api/v1";
let refreshPromise: Promise<AuthResponse> | null = null;

type ApiClientOptions = Omit<RequestInit, "body"> & {
  token?: string | null;
  body?: unknown;
};

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export async function apiRequest<T>(path: string, options: ApiClientOptions = {}): Promise<T> {
  return executeRequest<T>(path, options);
}

async function executeRequest<T>(path: string, options: ApiClientOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    headers,
  });

  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !payload?.success) {
    throw new ApiClientError(
      payload?.error?.message ?? response.statusText ?? "Request failed",
      response.status,
      payload?.error?.code,
    );
  }

  if (payload.data === null) {
    return undefined as T;
  }

  return payload.data;
}

export async function adminRequest<T>(token: string | null | undefined, path: string, options: ApiClientOptions = {}) {
  try {
    return await executeRequest<T>(path, { ...options, token });
  } catch (error) {
    if (!isAuthError(error)) {
      throw error;
    }

    const refreshed = await refreshAdminSession();
    return executeRequest<T>(path, { ...options, token: refreshed.tokens.accessToken });
  }
}

export function login(payload: LoginRequest) {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

async function refreshAdminSession() {
  const { tokens, setAuth, logout } = useAuthStore.getState();

  if (!tokens?.refreshToken) {
    logout();
    throw new ApiClientError("Admin session expired. Please sign in again.", 401, "UNAUTHORIZED");
  }

  refreshPromise ??= executeRequest<AuthResponse>("/auth/refresh", {
    method: "POST",
    body: { refreshToken: tokens.refreshToken },
  }).finally(() => {
    refreshPromise = null;
  });

  try {
    const response = await refreshPromise;
    setAuth(response);
    return response;
  } catch {
    logout();
    throw new ApiClientError("Admin session expired. Please sign in again.", 401, "UNAUTHORIZED");
  }
}

function isAuthError(error: unknown) {
  return error instanceof ApiClientError && (error.status === 401 || error.code === "UNAUTHORIZED");
}
