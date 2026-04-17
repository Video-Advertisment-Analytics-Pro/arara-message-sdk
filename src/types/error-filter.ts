import type { ApiCountResponse, ApiMessageResponse, IsoDateTimeString } from "./common";

export interface ErrorFilterLookupItem {
  address: string;
}

export interface ErrorFilterUpdateItem {
  address: string;
  count?: number;
}

export interface ErrorFilterLookupRequest {
  items: ErrorFilterLookupItem[];
}

export interface ErrorFilterUpdateRequest {
  items: ErrorFilterUpdateItem[];
}

export interface ErrorFilterItem {
  address: string;
  count: number;
  registered_date?: IsoDateTimeString;
  update_date?: IsoDateTimeString;
}

export interface ErrorFilterLookupResponse extends ApiCountResponse, ApiMessageResponse {
  items?: ErrorFilterItem[];
}

export interface ErrorFilterUpdateResponse extends ApiCountResponse, ApiMessageResponse {
  items?: ErrorFilterItem[];
}
