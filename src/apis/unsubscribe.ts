import { AraraHttpClient } from "../http-client";
import type {
  ListAutoAssignedResponse,
  ListClientAssignedResponse,
  ResubscribeRequest,
  SetUnsubscribeReceiverRequest,
  SetUnsubscribeReceiverResponse,
  UnsubscribeListQuery,
} from "../types/unsubscribe";

export class UnsubscribeApi {
  constructor(private readonly http: AraraHttpClient) {}

  async setReceiver(payload: SetUnsubscribeReceiverRequest): Promise<SetUnsubscribeReceiverResponse> {
    return this.http.request<SetUnsubscribeReceiverResponse>({
      method: "POST",
      path: "/unsubscribe-receivers",
      body: payload,
    });
  }

  async listAutoAssigned(query: UnsubscribeListQuery): Promise<ListAutoAssignedResponse> {
    return this.http.request<ListAutoAssignedResponse>({
      method: "GET",
      path: "/unsubscribers/auto-assigned",
      query: {
        "header-from": query.headerFrom,
        date: query.date,
      },
    });
  }

  async listClientAssigned(query: UnsubscribeListQuery): Promise<ListClientAssignedResponse> {
    return this.http.request<ListClientAssignedResponse>({
      method: "GET",
      path: "/unsubscribers/client-assigned",
      query: {
        "header-from": query.headerFrom,
        date: query.date,
      },
    });
  }

  async resubscribe(payload: ResubscribeRequest): Promise<void> {
    await this.http.request<void>({
      method: "PUT",
      path: "/re-subscribers",
      body: payload,
    });
  }
}
