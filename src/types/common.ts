export interface ApiMessageResponse {
  message?: string;
}

export interface ApiCountResponse {
  count?: number;
  total?: number;
}

export type QueryValue = string | number | boolean;

export type IsoDateTimeString = string;
