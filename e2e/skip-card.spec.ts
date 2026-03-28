import { test, expect } from "@playwright/test";

test.describe("Skip/Hide Card (US2)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("pressing Escape draws a new card", async ({ page }) => {
    const firstClue = await page.getByTestId("clue-text").textContent();

    await page.keyboard.press("Escape");

    const secondClue = await page.getByTestId("clue-text").textContent();
    expect(secondClue).not.toBe(firstClue);
  });

  test("clicking skip button draws a new card", async ({ page }) => {
    const firstClue = await page.getByTestId("clue-text").textContent();

    await page.getByTestId("skip-button").click();

    const secondClue = await page.getByTestId("clue-text").textContent();
    expect(secondClue).not.toBe(firstClue);
  });

  test("skipped card never reappears", async ({ page }) => {
    const seenClues = new Set<string>();
    const firstClue = await page.getByTestId("clue-text").textContent();
    seenClues.add(firstClue!);

    // Skip through all remaining cards, collecting first clues
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press("Escape");
      const clueEl = page.getByTestId("clue-text");
      // Might hit empty deck
      const emptyDeck = page.getByTestId("empty-deck");
      const hasClue = await clueEl.isVisible().catch(() => false);
      const hasEmpty = await emptyDeck.isVisible().catch(() => false);

      if (hasEmpty) break;
      if (hasClue) {
        const text = await clueEl.textContent();
        expect(seenClues).not.toContain(text);
        seenClues.add(text!);
      }
    }
  });
});
