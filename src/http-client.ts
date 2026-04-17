import { AraraApiError } from "./errors";
import type { QueryValue } from "./types/common";

export interface AraraMessageClientOptions {
  host: string;
  authHost?: string;
  accessToken?: string;
  timeoutMs?: number;
  fetch?: typeof fetch;
  defaultHeaders?: Record<string, string>;
}

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

type HostType = "api" | "auth";

type BodyType = "json" | "form";

interface RequestOptions {
  method: HttpMethod;
  path: string;
  query?: Record<string, QueryValue | QueryValue[] | undefined>;
  body?: unknown;
  bodyType?: BodyType;
  headers?: Record<string, string>;
  host?: HostType;
  auth?: boolean;
}

const normalizeHost = (value: string): URL => {
  const trimmed = value.trim().replace(/\/+$/, "");
  const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return new URL(normalized);
};

const encodePathSegment = (value: string): string => encodeURIComponent(value);

const appendQuery = (
  url: URL,
  query: Record<string, QueryValue | QueryValue[] | undefined>,
): void => {
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) {
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        url.searchParams.append(key, String(item));
      }
      continue;
    }
    url.searchParams.append(key, String(value));
  }
};

const toFormBody = (body: unknown): URLSearchParams => {
  if (body instanceof URLSearchParams) {
    return body;
  }
  const form = new URLSearchParams();
  if (body && typeof body === "object") {
    for (const [key, value] of Object.entries(body)) {
      if (value === undefined || value === null) {
        continue;
      }
      form.append(key, String(value));
    }
  }
  return form;
};

export class AraraHttpClient {
  private readonly apiBase: URL;
  private readonly authBase: URL;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;
  private readonly defaultHeaders: Record<string, string>;
  private accessToken?: string;

  constructor(options: AraraMessageClientOptions) {
    this.apiBase = normalizeHost(options.host);
    this.authBase = options.authHost
      ? normalizeHost(options.authHost)
      : new URL(`${this.apiBase.protocol}//auth.${this.apiBase.host}`);
    this.timeoutMs = options.timeoutMs ?? 30_000;
    this.fetchImpl = options.fetch ?? globalThis.fetch;
    this.defaultHeaders = { ...(options.defaultHeaders ?? {}) };
    this.accessToken = options.accessToken;
  }

  get token(): string | undefined {
    return this.accessToken;
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  clearAccessToken(): void {
    this.accessToken = undefined;
  }

  buildPath(...segments: string[]): string {
    return segments.map(encodePathSegment).join("/");
  }

  async request<T>(options: RequestOptions): Promise<T> {
    const hostType = options.host ?? "api";
    const useAuth = options.auth ?? hostType === "api";
    const base = hostType === "auth" ? this.authBase : this.apiBase;
    const sanitizedPath = options.path.replace(/^\/+/, "");
    const url = new URL(sanitizedPath, `${base.toString().replace(/\/+$/, "")}/`);

    if (options.query) {
      appendQuery(url, options.query);
    }

    const headers = new Headers(this.defaultHeaders);
    for (const [key, value] of Object.entries(options.headers ?? {})) {
      headers.set(key, value);
    }

    if (useAuth && this.accessToken) {
      headers.set("Authorization", `Bearer ${this.accessToken}`);
    }

    let body: string | URLSearchParams | undefined;
    if (options.body !== undefined) {
      if (options.bodyType === "form") {
        body = toFormBody(options.body);
        if (!headers.has("Content-Type")) {
          headers.set("Content-Type", "application/x-www-form-urlencoded");
        }
      } else if (typeof options.body === "string") {
        body = options.body;
      } else {
        body = JSON.stringify(options.body);
        if (!headers.has("Content-Type")) {
          headers.set("Content-Type", "application/json");
        }
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchImpl(url, {
        method: options.method,
        headers,
        body,
        signal: controller.signal,
      });

      const rawBody = await response.text();
      let parsedBody: unknown = undefined;
      if (rawBody.length > 0) {
        const responseContentType = response.headers.get("content-type") ?? "";
        if (responseContentType.includes("application/json")) {
          try {
            parsedBody = JSON.parse(rawBody);
          } catch {
            parsedBody = rawBody;
          }
        } else {
          parsedBody = rawBody;
        }
      }

      if (!response.ok) {
        throw new AraraApiError({
          method: options.method,
          url: url.toString(),
          status: response.status,
          statusText: response.statusText,
          body: parsedBody,
        });
      }

      if (response.status === 204 || parsedBody === undefined) {
        return undefined as T;
      }

      return parsedBody as T;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
