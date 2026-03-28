import { test, expect } from "@playwright/test";

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

  test("competition: add players, play round, assign points, verify scoreboard", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByTestId("mode-competition").click();

    // Fill in two players
    await page.getByTestId("player-input-0").fill("Anna");
    await page.getByTestId("player-input-1").fill("Erik");
    await page.getByTestId("start-competition").click();

    // Verify scoreboard is visible
    await expect(page.getByTestId("scoreboard")).toBeVisible();

    // Guess correct on clue 1 (5 points)
    await page.getByTestId("correct").click();

    // Award to Anna
    await page.getByTestId("award-Anna").click();

    // Verify scoreboard updated — Anna should have 5
    const scoreboard = page.getByTestId("scoreboard");
    await expect(scoreboard).toContainText("5");
    await expect(scoreboard).toContainText("Anna");
  });

  test("competition: nobody guessed awards no points", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("mode-competition").click();

    await page.getByTestId("player-input-0").fill("Anna");
    await page.getByTestId("player-input-1").fill("Erik");
    await page.getByTestId("start-competition").click();

    // Exhaust all clues
    for (let i = 0; i < 5; i++) {
      await page.getByTestId("next-clue").click();
    }

    // Should show next-card button (0 points, no player assignment)
    await expect(page.getByTestId("next-card")).toBeVisible();
    await page.getByTestId("next-card").click();

    // Scoreboard should still show 0 for both
    const scoreboard = page.getByTestId("scoreboard");
    await expect(scoreboard).toContainText("0");
  });
});
