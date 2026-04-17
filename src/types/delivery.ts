import type { ApiCountResponse, ApiMessageResponse, IsoDateTimeString } from "./common";

export type DeviceType = 0 | 1 | 2 | 3 | 4 | number;

export type DeliveryStatus =
  | "reserved"
  | "processing"
  | "processed"
  | "sending"
  | "r_sending"
  | "sent"
  | "failed"
  | "deleted"
  | (string & {});

export type DestinationType = "To" | "Cc" | "Bcc" | (string & {});

export type DeliveryResultStatus = 0 | 1 | 2 | 3 | number;

export interface SendAttachment {
  filename: string;
  mimetype: string;
  data: string;
}

export interface SendBody {
  text?: string;
  html?: string;
}

export interface SendContents {
  subject: string;
  body: SendBody;
  encode?: 0 | 1 | number;
  "attachments-list"?: SendAttachment[];
  cc?: string;
  bcc?: string;
}

export interface SendRecipient {
  address: string;
  device?: DeviceType;
}

export interface SendMailingListItem {
  to: SendRecipient;
  substitutions?: Record<string, string>;
  unsubscribe_url?: string;
}

export interface SendStopOption {
  timemin: string;
  timemax: string;
}

export interface SendTcOption {
  stop_send?: SendStopOption;
  lifetime?: number;
  retry_interval?: number;
}

export interface SendFromAddress {
  name?: string;
  address: string;
}

export interface SendReplyToAddress {
  address: string;
}

export interface SendSettings {
  send_time: IsoDateTimeString | "now";
  request_id?: string;
  from: SendFromAddress;
  reply_to?: SendReplyToAddress;
  tc_option?: SendTcOption;
  throttle?: number;
  error_count?: number;
  ignore_attachments_size?: boolean;
}

export interface SendDelivery {
  "mailing-list": SendMailingListItem[];
  contents: SendContents;
  settings: SendSettings;
}

export interface SendRequest {
  delivery: SendDelivery[];
}

export interface SendResultCode {
  code: string;
  message: string;
}

export interface SendResponseItem {
  result?: SendResultCode;
  delivery_id?: string;
  request_id?: string;
}

export interface SendResponse extends ApiCountResponse, ApiMessageResponse {
  items?: SendResponseItem[];
}

export interface CancelSendResponseItem {
  delivery_id: string;
}

export interface CancelSendResponse extends ApiMessageResponse {
  items?: CancelSendResponseItem[];
}

export interface SendResultCount {
  success?: number;
  error?: number;
}

export interface SendStatusItem {
  delivery_id?: string;
  deliver_id?: string;
  status?: DeliveryStatus;
  settings?: SendSettings;
  sendresult_count?: SendResultCount;
}

export interface SendStatusResponse extends ApiCountResponse, ApiMessageResponse {
  items?: SendStatusItem[];
}

export interface SendResultFromAddress {
  address?: string;
  name?: string;
}

export interface SendResultItem {
  mail_id?: string;
  destination_type?: DestinationType;
  to?: string;
  from?: string | SendResultFromAddress;
  status?: DeliveryResultStatus;
  message?: string;
  timestamp?: IsoDateTimeString;
}

export interface SendResultResponse extends ApiCountResponse, ApiMessageResponse {
  items?: SendResultItem[];
}

export interface TimeRangeQuery {
  timemin: IsoDateTimeString;
  timemax: IsoDateTimeString;
}
