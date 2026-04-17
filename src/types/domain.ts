import type { ApiCountResponse, ApiMessageResponse, IsoDateTimeString } from "./common";

export interface DkimSettingValues {
  fqdn: string;
  type: string;
  value: string;
}

export interface DkimDomainInput {
  sign_domain: string;
  selector?: string;
  key_len?: 1024 | 2048 | number;
  start_date?: IsoDateTimeString;
  default?: 0 | 1 | number;
  enable?: boolean;
}

export interface RegisterDkimRequest {
  domains: DkimDomainInput[];
}

export interface UpdateDkimDomainValue {
  start_date?: IsoDateTimeString;
  default?: 0 | 1 | number;
  enable?: boolean;
}

export interface UpdateDkimRequest {
  domains: UpdateDkimDomainValue[];
}

export interface DkimResult {
  code: string;
  message: string;
}

export interface DkimDomainRecord {
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

export interface RegisterDkimResponse extends ApiCountResponse, ApiMessageResponse {
  items?: DkimDomainRecord[];
}

export interface DomainDnsStatus {
  status?: string;
}

export interface DomainSpfStatus {
  status?: string;
  record?: string;
}

export interface DomainDkimStatus {
  selector?: string;
  status?: string;
  key_len?: number;
  start_date?: IsoDateTimeString;
  default?: number;
  enable?: boolean;
  setting_values?: DkimSettingValues;
  regist_date?: IsoDateTimeString;
}

export interface DomainItem {
  domain?: string;
  dns?: DomainDnsStatus;
  spf?: DomainSpfStatus;
  dkim?: DomainDkimStatus[];
}

export interface ListDomainsResponse extends ApiCountResponse, ApiMessageResponse {
  items?: DomainItem[];
}

export interface UpdateDkimResponse extends ApiMessageResponse {
  items?: DkimDomainRecord[];
}

export interface DeleteDkimItem {
  sign_domain?: string;
  selector?: string;
}

export interface DeleteDkimResponse extends ApiMessageResponse {
  items?: DeleteDkimItem[];
}
