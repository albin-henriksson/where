import { test, expect } from "./fixtures";

test.describe("Game Modes (US5)", () => {
  test("start screen shows two mode options", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("mode-freeplay")).toBeVisible();
    await expect(page.getByTestId("mode-competition")).toBeVisible();
  });

  test("freeplay starts without player setup", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("mode-freeplay").click();

    await expect(page.getByTestId("clue-text")).toBeVisible();
    await expect(page.getByTestId("scoreboard")).not.toBeVisible();
  });

  test("competition: add players, play round, assign points, verify score summary", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByTestId("mode-competition").click();

    await page.getByTestId("player-input-0").fill("Anna");
    await page.getByTestId("player-input-1").fill("Erik");
    await page.getByTestId("start-competition").click();

    await expect(page.getByTestId("scoreboard")).toBeVisible();

    // Guess correct on clue 1 (5 points)
    await page.getByTestId("correct").click();
    await page.getByTestId("award-Anna").click();

    // Score summary should appear with Anna's points
    await expect(page.getByTestId("summary-next")).toBeVisible();
    await expect(page.getByText("Anna +5p")).toBeVisible();

    // Click through to next card
    await page.getByTestId("summary-next").click();
    await expect(page.getByTestId("clue-text")).toBeVisible();

    // Scoreboard should now show Anna with 5
    const scoreboard = page.getByTestId("scoreboard");
    await expect(scoreboard).toContainText("5");
    await expect(scoreboard).toContainText("Anna");
  });

  test("competition: nobody guessed shows score summary with no changes", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByTestId("mode-competition").click();

    await page.getByTestId("player-input-0").fill("Anna");
    await page.getByTestId("player-input-1").fill("Erik");
    await page.getByTestId("start-competition").click();

    // Exhaust all clues
    for (let i = 0; i < 5; i++) {
      await page.getByTestId("next-clue").click();
    }

    // 0 points — next-card goes to summary
    await expect(page.getByTestId("next-card")).toBeVisible();
    await page.getByTestId("next-card").click();

    // Score summary should appear
    await expect(page.getByTestId("summary-next")).toBeVisible();

    // Click through
    await page.getByTestId("summary-next").click();

    // Back to game with scoreboard showing 0
    const scoreboard = page.getByTestId("scoreboard");
    await expect(scoreboard).toContainText("0");
  });
});
