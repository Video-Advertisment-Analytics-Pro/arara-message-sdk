# arara-message-sdk

TypeScript SDK for Arara Message API v2.

## Install

```bash
bun install
```

## Quick Start

```ts
import { AraraMessageClient } from "./src/index";

const client = new AraraMessageClient({
  host: "https://{HOST}",
});

const token = await client.issueAccessToken({
  clientId: process.env.ARARA_CLIENT_ID!,
  clientSecret: process.env.ARARA_CLIENT_SECRET!,
});

console.log(token.access_token);
```

## Main APIs

- `client.auth.issueAccessToken(...)`
- `client.delivery.reserve(...)`
- `client.delivery.cancel(...)`
- `client.delivery.getStatusByDeliveryId(...)`
- `client.delivery.getResultByDeliveryId(...)`
- `client.errorFilter.lookup(...)`
- `client.errorFilter.update(...)`
- `client.domain.registerDkim(...)`
- `client.domain.listDomains(...)`
- `client.domain.updateDkim(...)`
- `client.domain.deleteDkim(...)`
- `client.contract.getPlan()`
- `client.contract.getDeliveryRecord(...)`
- `client.unsubscribe.setReceiver(...)`
- `client.unsubscribe.listAutoAssigned(...)`
- `client.unsubscribe.listClientAssigned(...)`
- `client.unsubscribe.resubscribe(...)`

## Type Check

```bash
bunx tsc --noEmit
```

## Tests

### Unit Tests (No API key required)

`fetch` をモックして SDK の挙動を確認します。

```bash
bun run test:unit
```

### Integration Tests (API key required)

実 API に対する疎通確認です。読み取り系 (`issueAccessToken`, `getPlan`) のみに絞っています。

1. 環境変数を設定
2. `ARARA_RUN_INTEGRATION_TESTS=true` を指定して実行

PowerShell:

```powershell
$env:ARARA_HOST="https://{HOST}"
$env:ARARA_CLIENT_ID="{CLIENT_ID}"
$env:ARARA_CLIENT_SECRET="{CLIENT_SECRET}"
$env:ARARA_RUN_INTEGRATION_TESTS="true"
bun run test:integration
```

bash:

```bash
ARARA_HOST="https://{HOST}" \
ARARA_CLIENT_ID="{CLIENT_ID}" \
ARARA_CLIENT_SECRET="{CLIENT_SECRET}" \
ARARA_RUN_INTEGRATION_TESTS="true" \
bun run test:integration
```

### APIキー運用の推奨

- ハードコードしない（コードやテストファイルに直接書かない）
- ローカルは環境変数、CI は Secrets 機能で注入
- 本番キーではなく、テスト専用アカウント/権限の低いキーを使う
