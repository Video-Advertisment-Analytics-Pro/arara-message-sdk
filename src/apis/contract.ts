import { AraraHttpClient } from "../http-client";
import type { DeliveryRecordResponse, PlanResponse } from "../types/contract";

export class ContractApi {
  constructor(private readonly http: AraraHttpClient) {}

  async getPlan(): Promise<PlanResponse> {
    return this.http.request<PlanResponse>({
      method: "GET",
      path: "/plan",
    });
  }

  async getDeliveryRecord(yearmonth?: string): Promise<DeliveryRecordResponse> {
    return this.http.request<DeliveryRecordResponse>({
      method: "GET",
      path: "/delivery_record",
      query: {
        yearmonth,
      },
    });
  }
}
