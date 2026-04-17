import type { ApiMessageResponse } from "./common";

export interface AccessTokenResponse extends ApiMessageResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
  error?: string;
  [key: string]: unknown;
}

export interface IssueAccessTokenParams {
  clientId: string;
  clientSecret: string;
}
