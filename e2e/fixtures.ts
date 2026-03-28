import { test as base } from "@playwright/test";

// Extend test to auto-dismiss intro screen via localStorage
export const test = base.extend({
  page: async ({ page }, use) => {
    // Set localStorage before any navigation to skip intro
    await page.addInitScript(() => {
      localStorage.setItem("where-intro-dismissed", "true");
    });
    await use(page);
  },
});

export { expect } from "@playwright/test";
