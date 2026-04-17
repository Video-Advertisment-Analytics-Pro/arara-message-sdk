//#region src/errors.ts
var AraraApiError = class extends Error {
	method;
	url;
	status;
	statusText;
	body;
	constructor(options) {
		super(`${options.method} ${options.url} failed with ${options.status} ${options.statusText}`);
		this.name = "AraraApiError";
		this.method = options.method;
		this.url = options.url;
		this.status = options.status;
		this.statusText = options.statusText;
		this.body = options.body;
	}
};
//#endregion
//#region src/http-client.ts
const normalizeHost = (value) => {
	const trimmed = value.trim().replace(/\/+$/, "");
	const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
	return new URL(normalized);
};
const encodePathSegment = (value) => encodeURIComponent(value);
const appendQuery = (url, query) => {
	for (const [key, value] of Object.entries(query)) {
		if (value === void 0) continue;
		if (Array.isArray(value)) {
			for (const item of value) url.searchParams.append(key, String(item));
			continue;
		}
		url.searchParams.append(key, String(value));
	}
};
const toFormBody = (body) => {
	if (body instanceof URLSearchParams) return body;
	const form = new URLSearchParams();
	if (body && typeof body === "object") for (const [key, value] of Object.entries(body)) {
		if (value === void 0 || value === null) continue;
		form.append(key, String(value));
	}
	return form;
};
var AraraHttpClient = class {
	apiBase;
	authBase;
	timeoutMs;
	fetchImpl;
	defaultHeaders;
	accessToken;
	constructor(options) {
		this.apiBase = normalizeHost(options.host);
		this.authBase = options.authHost ? normalizeHost(options.authHost) : new URL(`${this.apiBase.protocol}//auth.${this.apiBase.host}`);
		this.timeoutMs = options.timeoutMs ?? 3e4;
		this.fetchImpl = options.fetch ?? globalThis.fetch;
		this.defaultHeaders = { ...options.defaultHeaders ?? {} };
		this.accessToken = options.accessToken;
	}
	get token() {
		return this.accessToken;
	}
	setAccessToken(token) {
		this.accessToken = token;
	}
	clearAccessToken() {
		this.accessToken = void 0;
	}
	buildPath(...segments) {
		return segments.map(encodePathSegment).join("/");
	}
	async request(options) {
		const hostType = options.host ?? "api";
		const useAuth = options.auth ?? hostType === "api";
		const base = hostType === "auth" ? this.authBase : this.apiBase;
		const sanitizedPath = options.path.replace(/^\/+/, "");
		const url = new URL(sanitizedPath, `${base.toString().replace(/\/+$/, "")}/`);
		if (options.query) appendQuery(url, options.query);
		const headers = new Headers(this.defaultHeaders);
		for (const [key, value] of Object.entries(options.headers ?? {})) headers.set(key, value);
		if (useAuth && this.accessToken) headers.set("Authorization", `Bearer ${this.accessToken}`);
		let body;
		if (options.body !== void 0) if (options.bodyType === "form") {
			body = toFormBody(options.body);
			if (!headers.has("Content-Type")) headers.set("Content-Type", "application/x-www-form-urlencoded");
		} else if (typeof options.body === "string") body = options.body;
		else {
			body = JSON.stringify(options.body);
			if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
		}
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);
		try {
			const response = await this.fetchImpl(url, {
				method: options.method,
				headers,
				body,
				signal: controller.signal
			});
			const rawBody = await response.text();
			let parsedBody = void 0;
			if (rawBody.length > 0) if ((response.headers.get("content-type") ?? "").includes("application/json")) try {
				parsedBody = JSON.parse(rawBody);
			} catch {
				parsedBody = rawBody;
			}
			else parsedBody = rawBody;
			if (!response.ok) throw new AraraApiError({
				method: options.method,
				url: url.toString(),
				status: response.status,
				statusText: response.statusText,
				body: parsedBody
			});
			if (response.status === 204 || parsedBody === void 0) return;
			return parsedBody;
		} finally {
			clearTimeout(timeoutId);
		}
	}
};
//#endregion
//#region src/apis/auth.ts
const encodeBasicCredential = (clientId, clientSecret) => {
	const raw = `${clientId}:${clientSecret}`;
	if (typeof globalThis.btoa === "function") return globalThis.btoa(raw);
	if (typeof Buffer !== "undefined") return Buffer.from(raw, "utf-8").toString("base64");
	throw new Error("No base64 encoder is available in this runtime.");
};
var AuthApi = class {
	constructor(http) {
		this.http = http;
	}
	async issueAccessToken(params) {
		const encoded = encodeBasicCredential(params.clientId, params.clientSecret);
		return this.http.request({
			method: "POST",
			host: "auth",
			path: "/oauth2/token",
			auth: false,
			bodyType: "form",
			headers: { Authorization: `Basic ${encoded}` },
			body: { grant_type: "client_credentials" }
		});
	}
};
//#endregion
//#region src/apis/contract.ts
var ContractApi = class {
	constructor(http) {
		this.http = http;
	}
	async getPlan() {
		return this.http.request({
			method: "GET",
			path: "/plan"
		});
	}
	async getDeliveryRecord(yearmonth) {
		return this.http.request({
			method: "GET",
			path: "/delivery_record",
			query: { yearmonth }
		});
	}
};
//#endregion
//#region src/apis/delivery.ts
var DeliveryApi = class {
	constructor(http) {
		this.http = http;
	}
	async reserve(payload) {
		return this.http.request({
			method: "POST",
			path: "/send",
			body: payload
		});
	}
	async cancel(deliveryId) {
		const id = this.http.buildPath(deliveryId);
		return this.http.request({
			method: "DELETE",
			path: `/send/${id}`
		});
	}
	async getStatusByDeliveryId(deliveryId) {
		const id = this.http.buildPath(deliveryId);
		return this.http.request({
			method: "GET",
			path: `/send/${id}`
		});
	}
	async getStatusByRequestId(requestId) {
		return this.http.request({
			method: "GET",
			path: "/send",
			query: { request_id: requestId }
		});
	}
	async getStatusByTimeRange(range) {
		return this.http.request({
			method: "GET",
			path: "/send",
			query: {
				timemin: range.timemin,
				timemax: range.timemax
			}
		});
	}
	async getResultByDeliveryId(deliveryId) {
		const id = this.http.buildPath(deliveryId);
		return this.http.request({
			method: "GET",
			path: `/mailing-list/${id}`
		});
	}
	async getResultByTimeRange(range) {
		return this.http.request({
			method: "GET",
			path: "/mailing-list",
			query: {
				timemin: range.timemin,
				timemax: range.timemax
			}
		});
	}
};
//#endregion
//#region src/apis/domain.ts
var DomainApi = class {
	constructor(http) {
		this.http = http;
	}
	async registerDkim(payload) {
		return this.http.request({
			method: "POST",
			path: "/domain/dkim",
			body: payload
		});
	}
	async listDomains(domain) {
		return this.http.request({
			method: "GET",
			path: "/domain",
			query: { d: domain }
		});
	}
	async updateDkim(signDomain, selector, payload) {
		const encodedSignDomain = this.http.buildPath(signDomain);
		const encodedSelector = this.http.buildPath(selector);
		return this.http.request({
			method: "PUT",
			path: `/domain/dkim/${encodedSignDomain}/${encodedSelector}`,
			body: payload
		});
	}
	async deleteDkim(signDomain, selector) {
		const encodedSignDomain = this.http.buildPath(signDomain);
		const encodedSelector = this.http.buildPath(selector);
		return this.http.request({
			method: "DELETE",
			path: `/domain/dkim/${encodedSignDomain}/${encodedSelector}`
		});
	}
};
//#endregion
//#region src/apis/error-filter.ts
var ErrorFilterApi = class {
	constructor(http) {
		this.http = http;
	}
	async lookup(payload) {
		return this.http.request({
			method: "POST",
			path: "/errorfilter",
			body: payload
		});
	}
	async update(payload) {
		return this.http.request({
			method: "PUT",
			path: "/errorfilter",
			body: payload
		});
	}
};
//#endregion
//#region src/apis/unsubscribe.ts
var UnsubscribeApi = class {
	constructor(http) {
		this.http = http;
	}
	async setReceiver(payload) {
		return this.http.request({
			method: "POST",
			path: "/unsubscribe-receivers",
			body: payload
		});
	}
	async listAutoAssigned(query) {
		return this.http.request({
			method: "GET",
			path: "/unsubscribers/auto-assigned",
			query: {
				"header-from": query.headerFrom,
				date: query.date
			}
		});
	}
	async listClientAssigned(query) {
		return this.http.request({
			method: "GET",
			path: "/unsubscribers/client-assigned",
			query: {
				"header-from": query.headerFrom,
				date: query.date
			}
		});
	}
	async resubscribe(payload) {
		await this.http.request({
			method: "PUT",
			path: "/re-subscribers",
			body: payload
		});
	}
};
//#endregion
//#region src/client.ts
var AraraMessageClient = class {
	auth;
	delivery;
	unsubscribe;
	errorFilter;
	domain;
	contract;
	http;
	constructor(options) {
		this.http = new AraraHttpClient(options);
		this.auth = new AuthApi(this.http);
		this.delivery = new DeliveryApi(this.http);
		this.unsubscribe = new UnsubscribeApi(this.http);
		this.errorFilter = new ErrorFilterApi(this.http);
		this.domain = new DomainApi(this.http);
		this.contract = new ContractApi(this.http);
	}
	get accessToken() {
		return this.http.token;
	}
	setAccessToken(token) {
		this.http.setAccessToken(token);
	}
	clearAccessToken() {
		this.http.clearAccessToken();
	}
	async issueAccessToken(params) {
		const response = await this.auth.issueAccessToken(params);
		this.http.setAccessToken(response.access_token);
		return response;
	}
};
//#endregion
export { AraraApiError, AraraMessageClient, AuthApi, ContractApi, DeliveryApi, DomainApi, ErrorFilterApi, UnsubscribeApi };
