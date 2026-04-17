import { AraraHttpClient } from "../http-client";
import type {
  ErrorFilterLookupRequest,
  ErrorFilterLookupResponse,
  ErrorFilterUpdateRequest,
  ErrorFilterUpdateResponse,
} from "../types/error-filter";

export class ErrorFilterApi {
  constructor(private readonly http: AraraHttpClient) {}

  async lookup(payload: ErrorFilterLookupRequest): Promise<ErrorFilterLookupResponse> {
    return this.http.request<ErrorFilterLookupResponse>({
      method: "POST",
      path: "/errorfilter",
      body: payload,
    });
  }

  async update(payload: ErrorFilterUpdateRequest): Promise<ErrorFilterUpdateResponse> {
    return this.http.request<ErrorFilterUpdateResponse>({
      method: "PUT",
      path: "/errorfilter",
      body: payload,
    });
  }
}
