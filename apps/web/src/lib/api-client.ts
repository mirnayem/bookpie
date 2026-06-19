import type { ApiResponse, AuthResponse, LoginRequest } from "@bookpie/shared";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000/api/v1";

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

export function adminRequest<T>(token: string | null | undefined, path: string, options: ApiClientOptions = {}) {
  return apiRequest<T>(path, { ...options, token });
}

export function login(payload: LoginRequest) {
  return apiRequest<AuthResponse>("/login", {
    method: "POST",
    body: payload,
  });
}
