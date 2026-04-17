import { describe, expect, it, vi } from "vitest";
import { AraraMessageClient } from "../../src/client";

describe("AraraMessageClient", () => {
  it("stores token from issueAccessToken and reuses it for authenticated api calls", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: "issued-token" }), {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            delivery_count: 100000,
            unit_price: 0.01,
          }),
          {
            status: 200,
            headers: {
              "content-type": "application/json",
            },
          },
        ),
      );

    const client = new AraraMessageClient({
      host: "https://api.example.com",
      fetch: fetchMock,
    });

    await client.issueAccessToken({
      clientId: "client",
      clientSecret: "secret",
    });
    expect(client.accessToken).toBe("issued-token");

    const plan = await client.contract.getPlan();
    expect(plan.delivery_count).toBe(100000);

    const secondCallInit = fetchMock.mock.calls[1]![1];
    const headers = secondCallInit?.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer issued-token");
  });

  it("can set and clear access token manually", () => {
    const client = new AraraMessageClient({
      host: "https://api.example.com",
      fetch: vi.fn<typeof fetch>(),
    });

    client.setAccessToken("manual-token");
    expect(client.accessToken).toBe("manual-token");

    client.clearAccessToken();
    expect(client.accessToken).toBeUndefined();
  });
});
