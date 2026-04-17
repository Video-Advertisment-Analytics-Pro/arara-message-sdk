import type { ApiMessageResponse, IsoDateTimeString } from "./common";

export interface SetUnsubscribeReceiverRequest {
  "header-from": string;
}

export interface SetUnsubscribeReceiverResponse extends ApiMessageResponse {
  base_url?: string;
}

export interface UnsubscribeListQuery {
  headerFrom: string;
  date: string;
}

export interface AutoAssignedUnsubscriber {
  message_id?: string;
  message_to?: string;
  datetime?: IsoDateTimeString;
  filtered?: boolean | string;
}

export interface ListAutoAssignedResponse extends ApiMessageResponse {
  header_from?: string;
  unsubscribers?: AutoAssignedUnsubscriber[];
}

export interface ClientAssignedUnsubscriber {
  opaque_part?: string;
  datetime?: IsoDateTimeString;
}

export interface ListClientAssignedResponse extends ApiMessageResponse {
  header_from?: string;
  unsubscribers?: ClientAssignedUnsubscriber[];
}

export interface ResubscribeRequest {
  "header-from": string;
  "to-addresses": string[];
}
