import { test, expect } from "@playwright/test";

test.describe("Skip/Hide Card (US2)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("mode-freeplay").click();
  });

  test("pressing Escape draws a new card", async ({ page }) => {
    const firstClue = await page.getByTestId("clue-text").textContent();

    await page.keyboard.press("Escape");

    const secondClue = await page.getByTestId("clue-text").textContent();
    expect(secondClue).not.toBe(firstClue);
  });

  test("clicking skip button draws a new card", async ({ page }) => {
    const firstClue = await page.getByTestId("clue-text").textContent();

    await page.getByTestId("skip-button").click({ force: true });

    const secondClue = await page.getByTestId("clue-text").textContent();
    expect(secondClue).not.toBe(firstClue);
  });

  test("skipped card never reappears", async ({ page }) => {
    const seenClues = new Set<string>();
    const firstClue = await page.getByTestId("clue-text").textContent();
    seenClues.add(firstClue!);

    for (let i = 0; i < 4; i++) {
      await page.keyboard.press("Escape");
      const clueEl = page.getByTestId("clue-text");
      const emptyDeck = page.getByTestId("empty-deck");
      const hasEmpty = await emptyDeck.isVisible().catch(() => false);

      if (hasEmpty) break;
      const hasClue = await clueEl.isVisible().catch(() => false);
      if (hasClue) {
        const text = await clueEl.textContent();
        expect(seenClues).not.toContain(text);
        seenClues.add(text!);
      }
    }
  });
});
