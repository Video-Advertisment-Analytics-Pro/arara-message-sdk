import { AraraHttpClient } from "../http-client";
import type {
  CancelSendResponse,
  SendRequest,
  SendResponse,
  SendResultResponse,
  SendStatusResponse,
  TimeRangeQuery,
} from "../types/delivery";

export class DeliveryApi {
  constructor(private readonly http: AraraHttpClient) {}

  async reserve(payload: SendRequest): Promise<SendResponse> {
    return this.http.request<SendResponse>({
      method: "POST",
      path: "/send",
      body: payload,
    });
  }

  async cancel(deliveryId: string): Promise<CancelSendResponse> {
    const id = this.http.buildPath(deliveryId);
    return this.http.request<CancelSendResponse>({
      method: "DELETE",
      path: `/send/${id}`,
    });
  }

  async getStatusByDeliveryId(deliveryId: string): Promise<SendStatusResponse> {
    const id = this.http.buildPath(deliveryId);
    return this.http.request<SendStatusResponse>({
      method: "GET",
      path: `/send/${id}`,
    });
  }

  async getStatusByRequestId(requestId: string): Promise<SendStatusResponse> {
    return this.http.request<SendStatusResponse>({
      method: "GET",
      path: "/send",
      query: {
        request_id: requestId,
      },
    });
  }

  async getStatusByTimeRange(range: TimeRangeQuery): Promise<SendStatusResponse> {
    return this.http.request<SendStatusResponse>({
      method: "GET",
      path: "/send",
      query: {
        timemin: range.timemin,
        timemax: range.timemax,
      },
    });
  }

  async getResultByDeliveryId(deliveryId: string): Promise<SendResultResponse> {
    const id = this.http.buildPath(deliveryId);
    return this.http.request<SendResultResponse>({
      method: "GET",
      path: `/mailing-list/${id}`,
    });
  }

  async getResultByTimeRange(range: TimeRangeQuery): Promise<SendResultResponse> {
    return this.http.request<SendResultResponse>({
      method: "GET",
      path: "/mailing-list",
      query: {
        timemin: range.timemin,
        timemax: range.timemax,
      },
    });
  }
}
