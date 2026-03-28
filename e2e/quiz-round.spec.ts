import { test, expect } from "@playwright/test";

test.describe("Quiz Round (US1)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("displays first clue on load", async ({ page }) => {
    const clue = page.getByTestId("clue-text");
    await expect(clue).toBeVisible();
    await expect(clue).not.toBeEmpty();

    const pointValue = page.getByTestId("point-value");
    await expect(pointValue).toContainText("5 poäng");
  });

  test("reveals clues progressively with decreasing points", async ({
    page,
  }) => {
    const clue = page.getByTestId("clue-text");
    const pointValue = page.getByTestId("point-value");
    const nextClue = page.getByTestId("next-clue");

    const clueTexts: string[] = [];
    clueTexts.push((await clue.textContent())!);

    for (let i = 0; i < 4; i++) {
      await nextClue.click();
      const text = await clue.textContent();
      expect(clueTexts).not.toContain(text);
      clueTexts.push(text!);
    }

    expect(clueTexts).toHaveLength(5);
    await expect(pointValue).toContainText("1 poäng");
  });

  test("correct on clue 2 shows city with 4 points", async ({ page }) => {
    await page.getByTestId("next-clue").click();
    await expect(page.getByTestId("point-value")).toContainText("4 poäng");

    await page.getByTestId("correct").click();

    await expect(page.getByTestId("city-name")).toBeVisible();
    await expect(page.getByTestId("country")).toBeVisible();
    await expect(page.getByTestId("points")).toContainText("4 poäng");
  });

  test("exhausting all clues shows city with 0 points", async ({ page }) => {
    const nextClue = page.getByTestId("next-clue");

    for (let i = 0; i < 4; i++) {
      await nextClue.click();
    }
    // On clue 5, button says "Visa svar"
    await nextClue.click();

    await expect(page.getByTestId("city-name")).toBeVisible();
    await expect(page.getByTestId("points")).toContainText("0 poäng");
  });

  test("next card draws a different card", async ({ page }) => {
    const firstClue = await page.getByTestId("clue-text").textContent();

    await page.getByTestId("correct").click();
    await page.getByTestId("next-card").click();

    const secondClue = await page.getByTestId("clue-text").textContent();
    expect(secondClue).not.toBe(firstClue);
  });
});
