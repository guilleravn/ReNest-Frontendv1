import { test as base, type BrowserContext } from "@playwright/test";

import { newTestAccount, registerThroughUi, type TestAccount } from "./helpers/auth";

type WorkerAccount = TestAccount & {
  /**
   * Playwright storage state (cookies) of a signed-in browser for this account. Kept in memory:
   * a file under the shared `test-results` dir can be cleaned up while another project runs.
   */
  storageState: Awaited<ReturnType<BrowserContext["storageState"]>>;
};

/**
 * `test` plus `workerAccount`: one account per Playwright worker, signed up once through the
 * UI the first time a test asks for it. Every browser request reaches the backend with the
 * same forwarded IP, so signing up in every test would hit the backend's per-IP throttles;
 * tests that only need "some signed-in user" share this account instead. Its email is unique
 * per run and worker.
 */
export const test = base.extend<object, { workerAccount: WorkerAccount }>({
  workerAccount: [
    async ({ browser }, provide, workerInfo) => {
      const account = newTestAccount();
      const context = await browser.newContext({ baseURL: workerInfo.project.use.baseURL });
      const page = await context.newPage();

      await registerThroughUi(page, account);
      // Drop the one-time welcome toast, so tests don't start with it.
      await context.clearCookies({ name: "renest_flash" });
      const storageState = await context.storageState();
      await context.close();

      await provide({ ...account, storageState });
    },
    { scope: "worker" },
  ],
});

/**
 * `test` whose browser starts signed in as `workerAccount`. Signing out in a test only deletes
 * that test's cookie (tokens aren't revoked), so the shared session stays valid.
 */
export const signedInTest = test.extend({
  // Playwright's fixture callback is named `provide`, not `use`, so the React hooks lint rule
  // doesn't mistake it for a hook.
  storageState: async ({ workerAccount }, provide) => {
    await provide(workerAccount.storageState);
  },
});

export { expect } from "@playwright/test";
