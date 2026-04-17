import type { ApiMessageResponse } from "./common";

export interface PlanResponse extends ApiMessageResponse {
  delivery_count: number;
  unit_price: number;
}

export interface DeliveryRecordDate {
  date: string;
  count: number;
}

export interface DeliveryRecordUser {
  user_id: string;
  dates: DeliveryRecordDate[];
}

export interface DeliveryRecordResponse extends ApiMessageResponse {
  total: number;
  users: DeliveryRecordUser[];
}
