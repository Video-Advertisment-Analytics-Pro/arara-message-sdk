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
