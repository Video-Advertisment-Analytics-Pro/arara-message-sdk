import { beforeAll, describe, expect, it } from "vitest";
import { AraraMessageClient } from "../../src/client";

const runIntegration = process.env.ARARA_RUN_INTEGRATION_TESTS === "true";

const getRequiredEnv = (): {
  host: string;
  clientId: string;
  clientSecret: string;
} => {
  const host = process.env.ARARA_HOST;
  const clientId = process.env.ARARA_CLIENT_ID;
  const clientSecret = process.env.ARARA_CLIENT_SECRET;

  if (!host || !clientId || !clientSecret) {
    throw new Error(
      [
        "Integration test requires env vars:",
        "ARARA_HOST",
        "ARARA_CLIENT_ID",
        "ARARA_CLIENT_SECRET",
      ].join(" "),
    );
  }

  return { host, clientId, clientSecret };
};

(runIntegration ? describe : describe.skip)("integration: auth + read only endpoint", () => {
  let client: AraraMessageClient;
  let env: ReturnType<typeof getRequiredEnv>;

  beforeAll(() => {
    env = getRequiredEnv();
    client = new AraraMessageClient({
      host: env.host,
    });
  });

  it("issues token", async () => {
    const token = await client.issueAccessToken({
      clientId: env.clientId,
      clientSecret: env.clientSecret,
    });

    expect(typeof token.access_token).toBe("string");
    expect(token.access_token.length).toBeGreaterThan(0);
  });

  it("calls contract.getPlan with issued token", async () => {
    const plan = await client.contract.getPlan();
    expect(typeof plan.delivery_count).toBe("number");
    expect(typeof plan.unit_price).toBe("number");
  });
});
