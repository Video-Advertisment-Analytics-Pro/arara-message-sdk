import { describe, expect, it, vi } from "vitest";
import { AuthApi } from "../../src/apis/auth";
import { AraraHttpClient } from "../../src/http-client";

describe("AuthApi", () => {
  it("issues access token with Basic auth and form body", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          access_token: "token-value",
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
    );

    const http = new AraraHttpClient({
      host: "https://api.example.com",
      fetch: fetchMock,
    });
    const authApi = new AuthApi(http);

    const response = await authApi.issueAccessToken({
      clientId: "client",
      clientSecret: "secret",
    });

    expect(response.access_token).toBe("token-value");

    const [requestUrl, requestInit] = fetchMock.mock.calls[0]!;
    const headers = requestInit?.headers as Headers;
    const body = requestInit?.body as URLSearchParams;

    expect(requestUrl.toString()).toBe("https://auth.api.example.com/oauth2/token");
    expect(headers.get("Authorization")).toBe("Basic Y2xpZW50OnNlY3JldA==");
    expect(headers.get("Content-Type")).toBe("application/x-www-form-urlencoded");
    expect(body.toString()).toBe("grant_type=client_credentials");
  });
});
