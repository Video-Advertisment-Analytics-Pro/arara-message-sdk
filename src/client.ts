import { AuthApi } from "./apis/auth";
import { ContractApi } from "./apis/contract";
import { DeliveryApi } from "./apis/delivery";
import { DomainApi } from "./apis/domain";
import { ErrorFilterApi } from "./apis/error-filter";
import { UnsubscribeApi } from "./apis/unsubscribe";
import { AraraHttpClient } from "./http-client";
import type { AraraMessageClientOptions } from "./http-client";
import type { AccessTokenResponse, IssueAccessTokenParams } from "./types/auth";

export class AraraMessageClient {
  readonly auth: AuthApi;
  readonly delivery: DeliveryApi;
  readonly unsubscribe: UnsubscribeApi;
  readonly errorFilter: ErrorFilterApi;
  readonly domain: DomainApi;
  readonly contract: ContractApi;

  private readonly http: AraraHttpClient;

  constructor(options: AraraMessageClientOptions) {
    this.http = new AraraHttpClient(options);
    this.auth = new AuthApi(this.http);
    this.delivery = new DeliveryApi(this.http);
    this.unsubscribe = new UnsubscribeApi(this.http);
    this.errorFilter = new ErrorFilterApi(this.http);
    this.domain = new DomainApi(this.http);
    this.contract = new ContractApi(this.http);
  }

  get accessToken(): string | undefined {
    return this.http.token;
  }

  setAccessToken(token: string): void {
    this.http.setAccessToken(token);
  }

  clearAccessToken(): void {
    this.http.clearAccessToken();
  }

  async issueAccessToken(params: IssueAccessTokenParams): Promise<AccessTokenResponse> {
    const response = await this.auth.issueAccessToken(params);
    this.http.setAccessToken(response.access_token);
    return response;
  }
}
