import { test, expect } from "@playwright/test";

test.describe("Session Tracking (US3)", () => {
  test("shows empty deck message after skipping all cards", async ({
    page,
  }) => {
    await page.goto("/");

    // Skip all cards until empty deck appears
    for (let i = 0; i < 50; i++) {
      const emptyDeck = page.getByTestId("empty-deck");
      if (await emptyDeck.isVisible().catch(() => false)) break;
      await page.keyboard.press("Escape");
    }

    await expect(page.getByTestId("empty-deck")).toBeVisible();
    await expect(page.getByTestId("empty-deck")).toContainText(
      "Inga fler kort!",
    );
  });

  test("no repeated cards during full session playthrough", async ({
    page,
  }) => {
    await page.goto("/");

    const seenFirstClues = new Set<string>();

    for (let i = 0; i < 50; i++) {
      const clueEl = page.getByTestId("clue-text");
      const emptyDeck = page.getByTestId("empty-deck");

      if (await emptyDeck.isVisible().catch(() => false)) break;

      const text = await clueEl.textContent();
      expect(seenFirstClues).not.toContain(text);
      seenFirstClues.add(text!);

      // Play through: guess correct immediately
      await page.getByTestId("correct").click();
      await page.getByTestId("next-card").click();
    }

    expect(seenFirstClues.size).toBeGreaterThanOrEqual(2);
  });
});
