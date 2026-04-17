export interface AraraApiErrorOptions {
  method: string;
  url: string;
  status: number;
  statusText: string;
  body?: unknown;
}

export class AraraApiError extends Error {
  readonly method: string;
  readonly url: string;
  readonly status: number;
  readonly statusText: string;
  readonly body?: unknown;

  constructor(options: AraraApiErrorOptions) {
    super(`${options.method} ${options.url} failed with ${options.status} ${options.statusText}`);
    this.name = "AraraApiError";
    this.method = options.method;
    this.url = options.url;
    this.status = options.status;
    this.statusText = options.statusText;
    this.body = options.body;
  }
}
