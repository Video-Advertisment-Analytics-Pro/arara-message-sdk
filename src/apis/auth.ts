import { AraraHttpClient } from "../http-client";
import type { AccessTokenResponse, IssueAccessTokenParams } from "../types/auth";

const encodeBasicCredential = (clientId: string, clientSecret: string): string => {
  const raw = `${clientId}:${clientSecret}`;
  if (typeof globalThis.btoa === "function") {
    return globalThis.btoa(raw);
  }
  if (typeof Buffer !== "undefined") {
    return Buffer.from(raw, "utf-8").toString("base64");
  }
  throw new Error("No base64 encoder is available in this runtime.");
};

export class AuthApi {
  constructor(private readonly http: AraraHttpClient) {}

  async issueAccessToken(params: IssueAccessTokenParams): Promise<AccessTokenResponse> {
    const encoded = encodeBasicCredential(params.clientId, params.clientSecret);
    return this.http.request<AccessTokenResponse>({
      method: "POST",
      host: "auth",
      path: "/oauth2/token",
      auth: false,
      bodyType: "form",
      headers: {
        Authorization: `Basic ${encoded}`,
      },
      body: {
        grant_type: "client_credentials",
      },
    });
  }
}
