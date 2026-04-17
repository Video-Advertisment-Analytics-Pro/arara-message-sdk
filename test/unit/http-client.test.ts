import { describe, expect, it, vi } from "vitest";
import { AraraApiError } from "../../src/errors";
import { AraraHttpClient } from "../../src/http-client";

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
    },
  });

describe("AraraHttpClient", () => {
  it("adds Bearer token for api requests and appends query values", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }));

    const client = new AraraHttpClient({
      host: "https://api.example.com",
      accessToken: "token-123",
      fetch: fetchMock,
    });

    const result = await client.request<{ ok: boolean }>({
      method: "GET",
      path: "/send",
      query: {
        request_id: "abc",
        page: 2,
      },
    });

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [requestUrl, requestInit] = fetchMock.mock.calls[0]!;
    const headers = requestInit?.headers as Headers;

    expect(requestUrl.toString()).toBe("https://api.example.com/send?request_id=abc&page=2");
    expect(headers.get("Authorization")).toBe("Bearer token-123");
  });

  it("builds form requests for auth host without auto bearer token", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValueOnce(jsonResponse({ access_token: "x" }));

    const client = new AraraHttpClient({
      host: "https://api.example.com",
      accessToken: "will-not-be-used",
      fetch: fetchMock,
    });

    await client.request<{ access_token: string }>({
      method: "POST",
      host: "auth",
      auth: false,
      path: "/oauth2/token",
      bodyType: "form",
      body: { grant_type: "client_credentials" },
    });

    const [requestUrl, requestInit] = fetchMock.mock.calls[0]!;
    const headers = requestInit?.headers as Headers;
    const body = requestInit?.body as URLSearchParams;

    expect(requestUrl.toString()).toBe("https://auth.api.example.com/oauth2/token");
    expect(headers.get("Authorization")).toBeNull();
    expect(headers.get("Content-Type")).toBe("application/x-www-form-urlencoded");
    expect(body.toString()).toBe("grant_type=client_credentials");
  });

  it("throws AraraApiError with parsed json body when response is not ok", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: "Too Many Requests" }, 429));

    const client = new AraraHttpClient({
      host: "https://api.example.com",
      fetch: fetchMock,
    });

    await expect(
      client.request({
        method: "GET",
        path: "/plan",
      }),
    ).rejects.toMatchObject({
      name: "AraraApiError",
      status: 429,
      body: { message: "Too Many Requests" },
    } satisfies Partial<AraraApiError>);
  });

  it("returns undefined for 204 no content", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));

    const client = new AraraHttpClient({
      host: "https://api.example.com",
      fetch: fetchMock,
    });

    const result = await client.request<void>({
      method: "PUT",
      path: "/re-subscribers",
      body: {
        "header-from": "sender@example.com",
        "to-addresses": ["a@example.com"],
      },
    });

    expect(result).toBeUndefined();
  });
});
