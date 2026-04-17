import { AraraHttpClient } from "../http-client";
import type {
  DeleteDkimResponse,
  ListDomainsResponse,
  RegisterDkimRequest,
  RegisterDkimResponse,
  UpdateDkimRequest,
  UpdateDkimResponse,
} from "../types/domain";

export class DomainApi {
  constructor(private readonly http: AraraHttpClient) {}

  async registerDkim(payload: RegisterDkimRequest): Promise<RegisterDkimResponse> {
    return this.http.request<RegisterDkimResponse>({
      method: "POST",
      path: "/domain/dkim",
      body: payload,
    });
  }

  async listDomains(domain?: string): Promise<ListDomainsResponse> {
    return this.http.request<ListDomainsResponse>({
      method: "GET",
      path: "/domain",
      query: {
        d: domain,
      },
    });
  }

  async updateDkim(signDomain: string, selector: string, payload: UpdateDkimRequest): Promise<UpdateDkimResponse> {
    const encodedSignDomain = this.http.buildPath(signDomain);
    const encodedSelector = this.http.buildPath(selector);
    return this.http.request<UpdateDkimResponse>({
      method: "PUT",
      path: `/domain/dkim/${encodedSignDomain}/${encodedSelector}`,
      body: payload,
    });
  }

  async deleteDkim(signDomain: string, selector: string): Promise<DeleteDkimResponse> {
    const encodedSignDomain = this.http.buildPath(signDomain);
    const encodedSelector = this.http.buildPath(selector);
    return this.http.request<DeleteDkimResponse>({
      method: "DELETE",
      path: `/domain/dkim/${encodedSignDomain}/${encodedSelector}`,
    });
  }
}
