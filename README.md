# arara-message-sdk

arara Message API v2 向けの TypeScript SDK です。  
認証トークン発行、配信、配信結果取得、配信停止管理、エラーフィルタ、ドメイン管理、契約情報参照を型付きで扱えます。

## Features

- APIカテゴリごとに分割されたクライアント (`auth`, `delivery`, `unsubscribe`, `errorFilter`, `domain`, `contract`)
- ESM / CJS 両対応 (`dist/index.mjs`, `dist/index.cjs`)
- TypeScript 型定義を同梱 (`dist/index.d.mts`)
- `AraraApiError` による統一エラーハンドリング
- GitHubソースインストール時も `prepare` で自動ビルド

## Requirements

- Node.js `>= 20.19.0`

## Installation

### npm (公開後)

```bash
npm install arara-message-sdk
```

### GitHub (現時点の推奨)

```bash
npm install github:Video-Advertisment-Analytics-Pro/arara-message-sdk
```

特定のタグ/コミットを固定する場合:

```bash
npm install github:Video-Advertisment-Analytics-Pro/arara-message-sdk#<tag-or-commit>
```

`git+https` 形式でもインストールできます:

```bash
npm install git+https://github.com/Video-Advertisment-Analytics-Pro/arara-message-sdk.git
```

> [!TIP]
> Gitインストール時は `prepare` スクリプトで `dist/` が自動生成されるため、そのまま利用できます。

## Quick Start

```ts
import { AraraMessageClient } from "arara-message-sdk";

const client = new AraraMessageClient({
  host: "https://api.example.com",
  // authHostを省略すると https://auth.<host> が使われます
});

const token = await client.issueAccessToken({
  clientId: process.env.ARARA_CLIENT_ID!,
  clientSecret: process.env.ARARA_CLIENT_SECRET!,
});

console.log(token.access_token);

const plan = await client.contract.getPlan();
console.log(plan.delivery_count, plan.unit_price);
```

## Client Options

`AraraMessageClient` は以下を受け取ります。

- `host` (required): APIホスト (`https://api.example.com` 形式)
- `authHost` (optional): 認証ホスト。未指定時は `https://auth.<host>`
- `accessToken` (optional): 初期Bearerトークン
- `timeoutMs` (optional): リクエストタイムアウト (ms)
- `fetch` (optional): カスタム `fetch` 実装
- `defaultHeaders` (optional): 全リクエスト共通ヘッダ

## API Overview

### `auth`

- `issueAccessToken({ clientId, clientSecret })`

### `delivery`

- `reserve(payload)`
- `cancel(deliveryId)`
- `getStatusByDeliveryId(deliveryId)`
- `getStatusByRequestId(requestId)`
- `getStatusByTimeRange({ timemin, timemax })`
- `getResultByDeliveryId(deliveryId)`
- `getResultByTimeRange({ timemin, timemax })`

### `unsubscribe`

- `setReceiver(payload)`
- `listAutoAssigned({ headerFrom, date })`
- `listClientAssigned({ headerFrom, date })`
- `resubscribe(payload)`

### `errorFilter`

- `lookup(payload)`
- `update(payload)`

### `domain`

- `registerDkim(payload)`
- `listDomains(domain?)`
- `updateDkim(signDomain, selector, payload)`
- `deleteDkim(signDomain, selector)`

### `contract`

- `getPlan()`
- `getDeliveryRecord(yearmonth?)`

## Error Handling

APIレスポンスが 2xx 以外の場合は `AraraApiError` を throw します。

```ts
import { AraraApiError } from "arara-message-sdk";

try {
  await client.contract.getPlan();
} catch (error) {
  if (error instanceof AraraApiError) {
    console.error(error.status, error.statusText, error.body);
  }
}
```

## Development

```bash
npm install
npm run build
npm run typecheck
```

## Testing

### Unit tests (APIキー不要)

`fetch` をモックして SDK の挙動を検証します。

```bash
npm run test:unit
```

### Integration tests (APIキー必要)

実APIへの疎通確認です。現在は読み取り寄りのシナリオ (`issueAccessToken`, `contract.getPlan`) のみを実行します。

PowerShell:

```powershell
$env:ARARA_HOST="https://api.example.com"
$env:ARARA_CLIENT_ID="your-client-id"
$env:ARARA_CLIENT_SECRET="your-client-secret"
$env:ARARA_RUN_INTEGRATION_TESTS="true"
npm run test:integration
```

bash:

```bash
ARARA_HOST="https://api.example.com" \
ARARA_CLIENT_ID="your-client-id" \
ARARA_CLIENT_SECRET="your-client-secret" \
ARARA_RUN_INTEGRATION_TESTS="true" \
npm run test:integration
```

> [!IMPORTANT]
> APIキー/シークレットはコードにハードコードしないでください。ローカルでは環境変数、CIではSecret管理を使用してください。

> [!WARNING]
> integration test には本番キーではなく、権限を絞ったテスト専用クレデンシャルを推奨します。
