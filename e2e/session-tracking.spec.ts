import { test, expect } from "@playwright/test";

test.describe("Session Tracking (US3)", () => {
  test("shows empty deck message after skipping all cards", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByTestId("mode-freeplay").click();

    for (let i = 0; i < 150; i++) {
      const emptyDeck = page.getByTestId("empty-deck");
      if (await emptyDeck.isVisible().catch(() => false)) break;
      await page.keyboard.press("Escape");
    }

    await expect(page.getByTestId("empty-deck")).toBeVisible();
    await expect(page.getByTestId("empty-deck")).toContainText(
      "Inga fler kort!",
    );
  });

  test("no repeated cards during playthrough", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("mode-freeplay").click();

    const seenFirstClues = new Set<string>();

    // Play through 10 cards and verify no repeats
    for (let i = 0; i < 10; i++) {
      const clueEl = page.getByTestId("clue-text");
      await expect(clueEl).toBeVisible();

      const text = await clueEl.textContent();
      expect(seenFirstClues).not.toContain(text);
      seenFirstClues.add(text!);

      await page.getByTestId("correct").click();
      await page.getByTestId("next-card").click();
    }

    expect(seenFirstClues.size).toBe(10);
  });
});
