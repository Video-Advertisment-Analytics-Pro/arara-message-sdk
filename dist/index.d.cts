//#region src/types/common.d.ts
interface ApiMessageResponse {
  message?: string;
}
interface ApiCountResponse {
  count?: number;
  total?: number;
}
type QueryValue = string | number | boolean;
type IsoDateTimeString = string;
//#endregion
//#region src/http-client.d.ts
interface AraraMessageClientOptions {
  host: string;
  authHost?: string;
  accessToken?: string;
  timeoutMs?: number;
  fetch?: typeof fetch;
  defaultHeaders?: Record<string, string>;
}
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
type HostType = "api" | "auth";
type BodyType = "json" | "form";
interface RequestOptions {
  method: HttpMethod;
  path: string;
  query?: Record<string, QueryValue | QueryValue[] | undefined>;
  body?: unknown;
  bodyType?: BodyType;
  headers?: Record<string, string>;
  host?: HostType;
  auth?: boolean;
}
declare class AraraHttpClient {
  private readonly apiBase;
  private readonly authBase;
  private readonly timeoutMs;
  private readonly fetchImpl;
  private readonly defaultHeaders;
  private accessToken?;
  constructor(options: AraraMessageClientOptions);
  get token(): string | undefined;
  setAccessToken(token: string): void;
  clearAccessToken(): void;
  buildPath(...segments: string[]): string;
  request<T>(options: RequestOptions): Promise<T>;
}
//#endregion
//#region src/types/auth.d.ts
interface AccessTokenResponse extends ApiMessageResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
  error?: string;
  [key: string]: unknown;
}
interface IssueAccessTokenParams {
  clientId: string;
  clientSecret: string;
}
//#endregion
//#region src/apis/auth.d.ts
declare class AuthApi {
  private readonly http;
  constructor(http: AraraHttpClient);
  issueAccessToken(params: IssueAccessTokenParams): Promise<AccessTokenResponse>;
}
//#endregion
//#region src/types/contract.d.ts
interface PlanResponse extends ApiMessageResponse {
  delivery_count: number;
  unit_price: number;
}
interface DeliveryRecordDate {
  date: string;
  count: number;
}
interface DeliveryRecordUser {
  user_id: string;
  dates: DeliveryRecordDate[];
}
interface DeliveryRecordResponse extends ApiMessageResponse {
  total: number;
  users: DeliveryRecordUser[];
}
//#endregion
//#region src/apis/contract.d.ts
declare class ContractApi {
  private readonly http;
  constructor(http: AraraHttpClient);
  getPlan(): Promise<PlanResponse>;
  getDeliveryRecord(yearmonth?: string): Promise<DeliveryRecordResponse>;
}
//#endregion
//#region src/types/delivery.d.ts
type DeviceType = 0 | 1 | 2 | 3 | 4 | number;
type DeliveryStatus = "reserved" | "processing" | "processed" | "sending" | "r_sending" | "sent" | "failed" | "deleted" | (string & {});
type DestinationType = "To" | "Cc" | "Bcc" | (string & {});
type DeliveryResultStatus = 0 | 1 | 2 | 3 | number;
interface SendAttachment {
  filename: string;
  mimetype: string;
  data: string;
}
interface SendBody {
  text?: string;
  html?: string;
}
interface SendContents {
  subject: string;
  body: SendBody;
  encode?: 0 | 1 | number;
  "attachments-list"?: SendAttachment[];
  cc?: string;
  bcc?: string;
}
interface SendRecipient {
  address: string;
  device?: DeviceType;
}
interface SendMailingListItem {
  to: SendRecipient;
  substitutions?: Record<string, string>;
  unsubscribe_url?: string;
}
interface SendStopOption {
  timemin: string;
  timemax: string;
}
interface SendTcOption {
  stop_send?: SendStopOption;
  lifetime?: number;
  retry_interval?: number;
}
interface SendFromAddress {
  name?: string;
  address: string;
}
interface SendReplyToAddress {
  address: string;
}
interface SendSettings {
  send_time: IsoDateTimeString | "now";
  request_id?: string;
  from: SendFromAddress;
  reply_to?: SendReplyToAddress;
  tc_option?: SendTcOption;
  throttle?: number;
  error_count?: number;
  ignore_attachments_size?: boolean;
}
interface SendDelivery {
  "mailing-list": SendMailingListItem[];
  contents: SendContents;
  settings: SendSettings;
}
interface SendRequest {
  delivery: SendDelivery[];
}
interface SendResultCode {
  code: string;
  message: string;
}
interface SendResponseItem {
  result?: SendResultCode;
  delivery_id?: string;
  request_id?: string;
}
interface SendResponse extends ApiCountResponse, ApiMessageResponse {
  items?: SendResponseItem[];
}
interface CancelSendResponseItem {
  delivery_id: string;
}
interface CancelSendResponse extends ApiMessageResponse {
  items?: CancelSendResponseItem[];
}
interface SendResultCount {
  success?: number;
  error?: number;
}
interface SendStatusItem {
  delivery_id?: string;
  deliver_id?: string;
  status?: DeliveryStatus;
  settings?: SendSettings;
  sendresult_count?: SendResultCount;
}
interface SendStatusResponse extends ApiCountResponse, ApiMessageResponse {
  items?: SendStatusItem[];
}
interface SendResultFromAddress {
  address?: string;
  name?: string;
}
interface SendResultItem {
  mail_id?: string;
  destination_type?: DestinationType;
  to?: string;
  from?: string | SendResultFromAddress;
  status?: DeliveryResultStatus;
  message?: string;
  timestamp?: IsoDateTimeString;
}
interface SendResultResponse extends ApiCountResponse, ApiMessageResponse {
  items?: SendResultItem[];
}
interface TimeRangeQuery {
  timemin: IsoDateTimeString;
  timemax: IsoDateTimeString;
}
//#endregion
//#region src/apis/delivery.d.ts
declare class DeliveryApi {
  private readonly http;
  constructor(http: AraraHttpClient);
  reserve(payload: SendRequest): Promise<SendResponse>;
  cancel(deliveryId: string): Promise<CancelSendResponse>;
  getStatusByDeliveryId(deliveryId: string): Promise<SendStatusResponse>;
  getStatusByRequestId(requestId: string): Promise<SendStatusResponse>;
  getStatusByTimeRange(range: TimeRangeQuery): Promise<SendStatusResponse>;
  getResultByDeliveryId(deliveryId: string): Promise<SendResultResponse>;
  getResultByTimeRange(range: TimeRangeQuery): Promise<SendResultResponse>;
}
//#endregion
//#region src/types/domain.d.ts
interface DkimSettingValues {
  fqdn: string;
  type: string;
  value: string;
}
interface DkimDomainInput {
  sign_domain: string;
  selector?: string;
  key_len?: 1024 | 2048 | number;
  start_date?: IsoDateTimeString;
  default?: 0 | 1 | number;
  enable?: boolean;
}
interface RegisterDkimRequest {
  domains: DkimDomainInput[];
}
interface UpdateDkimDomainValue {
  start_date?: IsoDateTimeString;
  default?: 0 | 1 | number;
  enable?: boolean;
}
interface UpdateDkimRequest {
  domains: UpdateDkimDomainValue[];
}
interface DkimResult {
  code: string;
  message: string;
}
interface DkimDomainRecord {
  result?: DkimResult;
  sign_domain?: string;
  selector?: string;
  key_len?: number;
  start_date?: IsoDateTimeString;
  default?: number;
  enable?: boolean;
  setting_values?: DkimSettingValues;
  regist_date?: IsoDateTimeString;
}
interface RegisterDkimResponse extends ApiCountResponse, ApiMessageResponse {
  items?: DkimDomainRecord[];
}
interface DomainDnsStatus {
  status?: string;
}
interface DomainSpfStatus {
  status?: string;
  record?: string;
}
interface DomainDkimStatus {
  selector?: string;
  status?: string;
  key_len?: number;
  start_date?: IsoDateTimeString;
  default?: number;
  enable?: boolean;
  setting_values?: DkimSettingValues;
  regist_date?: IsoDateTimeString;
}
interface DomainItem {
  domain?: string;
  dns?: DomainDnsStatus;
  spf?: DomainSpfStatus;
  dkim?: DomainDkimStatus[];
}
interface ListDomainsResponse extends ApiCountResponse, ApiMessageResponse {
  items?: DomainItem[];
}
interface UpdateDkimResponse extends ApiMessageResponse {
  items?: DkimDomainRecord[];
}
interface DeleteDkimItem {
  sign_domain?: string;
  selector?: string;
}
interface DeleteDkimResponse extends ApiMessageResponse {
  items?: DeleteDkimItem[];
}
//#endregion
//#region src/apis/domain.d.ts
declare class DomainApi {
  private readonly http;
  constructor(http: AraraHttpClient);
  registerDkim(payload: RegisterDkimRequest): Promise<RegisterDkimResponse>;
  listDomains(domain?: string): Promise<ListDomainsResponse>;
  updateDkim(signDomain: string, selector: string, payload: UpdateDkimRequest): Promise<UpdateDkimResponse>;
  deleteDkim(signDomain: string, selector: string): Promise<DeleteDkimResponse>;
}
//#endregion
//#region src/types/error-filter.d.ts
interface ErrorFilterLookupItem {
  address: string;
}
interface ErrorFilterUpdateItem {
  address: string;
  count?: number;
}
interface ErrorFilterLookupRequest {
  items: ErrorFilterLookupItem[];
}
interface ErrorFilterUpdateRequest {
  items: ErrorFilterUpdateItem[];
}
interface ErrorFilterItem {
  address: string;
  count: number;
  registered_date?: IsoDateTimeString;
  update_date?: IsoDateTimeString;
}
interface ErrorFilterLookupResponse extends ApiCountResponse, ApiMessageResponse {
  items?: ErrorFilterItem[];
}
interface ErrorFilterUpdateResponse extends ApiCountResponse, ApiMessageResponse {
  items?: ErrorFilterItem[];
}
//#endregion
//#region src/apis/error-filter.d.ts
declare class ErrorFilterApi {
  private readonly http;
  constructor(http: AraraHttpClient);
  lookup(payload: ErrorFilterLookupRequest): Promise<ErrorFilterLookupResponse>;
  update(payload: ErrorFilterUpdateRequest): Promise<ErrorFilterUpdateResponse>;
}
//#endregion
//#region src/types/unsubscribe.d.ts
interface SetUnsubscribeReceiverRequest {
  "header-from": string;
}
interface SetUnsubscribeReceiverResponse extends ApiMessageResponse {
  base_url?: string;
}
interface UnsubscribeListQuery {
  headerFrom: string;
  date: string;
}
interface AutoAssignedUnsubscriber {
  message_id?: string;
  message_to?: string;
  datetime?: IsoDateTimeString;
  filtered?: boolean | string;
}
interface ListAutoAssignedResponse extends ApiMessageResponse {
  header_from?: string;
  unsubscribers?: AutoAssignedUnsubscriber[];
}
interface ClientAssignedUnsubscriber {
  opaque_part?: string;
  datetime?: IsoDateTimeString;
}
interface ListClientAssignedResponse extends ApiMessageResponse {
  header_from?: string;
  unsubscribers?: ClientAssignedUnsubscriber[];
}
interface ResubscribeRequest {
  "header-from": string;
  "to-addresses": string[];
}
//#endregion
//#region src/apis/unsubscribe.d.ts
declare class UnsubscribeApi {
  private readonly http;
  constructor(http: AraraHttpClient);
  setReceiver(payload: SetUnsubscribeReceiverRequest): Promise<SetUnsubscribeReceiverResponse>;
  listAutoAssigned(query: UnsubscribeListQuery): Promise<ListAutoAssignedResponse>;
  listClientAssigned(query: UnsubscribeListQuery): Promise<ListClientAssignedResponse>;
  resubscribe(payload: ResubscribeRequest): Promise<void>;
}
//#endregion
//#region src/client.d.ts
declare class AraraMessageClient {
  readonly auth: AuthApi;
  readonly delivery: DeliveryApi;
  readonly unsubscribe: UnsubscribeApi;
  readonly errorFilter: ErrorFilterApi;
  readonly domain: DomainApi;
  readonly contract: ContractApi;
  private readonly http;
  constructor(options: AraraMessageClientOptions);
  get accessToken(): string | undefined;
  setAccessToken(token: string): void;
  clearAccessToken(): void;
  issueAccessToken(params: IssueAccessTokenParams): Promise<AccessTokenResponse>;
}
//#endregion
//#region src/errors.d.ts
interface AraraApiErrorOptions {
  method: string;
  url: string;
  status: number;
  statusText: string;
  body?: unknown;
}
declare class AraraApiError extends Error {
  readonly method: string;
  readonly url: string;
  readonly status: number;
  readonly statusText: string;
  readonly body?: unknown;
  constructor(options: AraraApiErrorOptions);
}
//#endregion
export { AccessTokenResponse, ApiCountResponse, ApiMessageResponse, AraraApiError, AraraMessageClient, type AraraMessageClientOptions, AuthApi, AutoAssignedUnsubscriber, CancelSendResponse, CancelSendResponseItem, ClientAssignedUnsubscriber, ContractApi, DeleteDkimItem, DeleteDkimResponse, DeliveryApi, DeliveryRecordDate, DeliveryRecordResponse, DeliveryRecordUser, DeliveryResultStatus, DeliveryStatus, DestinationType, DeviceType, DkimDomainInput, DkimDomainRecord, DkimResult, DkimSettingValues, DomainApi, DomainDkimStatus, DomainDnsStatus, DomainItem, DomainSpfStatus, ErrorFilterApi, ErrorFilterItem, ErrorFilterLookupItem, ErrorFilterLookupRequest, ErrorFilterLookupResponse, ErrorFilterUpdateItem, ErrorFilterUpdateRequest, ErrorFilterUpdateResponse, IsoDateTimeString, IssueAccessTokenParams, ListAutoAssignedResponse, ListClientAssignedResponse, ListDomainsResponse, PlanResponse, QueryValue, RegisterDkimRequest, RegisterDkimResponse, ResubscribeRequest, SendAttachment, SendBody, SendContents, SendDelivery, SendFromAddress, SendMailingListItem, SendRecipient, SendReplyToAddress, SendRequest, SendResponse, SendResponseItem, SendResultCode, SendResultCount, SendResultFromAddress, SendResultItem, SendResultResponse, SendSettings, SendStatusItem, SendStatusResponse, SendStopOption, SendTcOption, SetUnsubscribeReceiverRequest, SetUnsubscribeReceiverResponse, TimeRangeQuery, UnsubscribeApi, UnsubscribeListQuery, UpdateDkimDomainValue, UpdateDkimRequest, UpdateDkimResponse };