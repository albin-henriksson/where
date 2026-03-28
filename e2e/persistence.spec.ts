import { test, expect } from "@playwright/test";

test.describe("Persistence", () => {
  test("game state persists across page refresh in freeplay", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("mode-freeplay").click();

    // Play a card — remember the first clue text
    const firstClue = await page.getByTestId("clue-text").textContent();
    expect(firstClue).toBeTruthy();

    // Advance to clue 2
    await page.getByTestId("next-clue").click();
    const secondClue = await page.getByTestId("clue-text").textContent();
    expect(secondClue).not.toBe(firstClue);

    // Correct + next card
    await page.getByTestId("correct").click();
    await page.getByTestId("next-card").click();

    // Now on a new card — this card's clue should differ
    const newCardClue = await page.getByTestId("clue-text").textContent();

    // Refresh
    await page.reload();

    // Should resume in game (not start screen) — clue text visible
    await expect(page.getByTestId("clue-text")).toBeVisible({ timeout: 3000 });

    // The first card should NOT reappear (it was seen)
    const afterRefreshClue = await page.getByTestId("clue-text").textContent();
    expect(afterRefreshClue).not.toBe(firstClue);
  });

  test("competition scores persist across refresh", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("mode-competition").click();
    await page.getByTestId("player-input-0").fill("Anna");
    await page.getByTestId("player-input-1").fill("Erik");
    await page.getByTestId("start-competition").click();

    // Score a point for Anna (5 points on clue 1)
    await page.getByTestId("correct").click();
    await page.getByTestId("award-Anna").click();

    // Click through summary
    await page.getByTestId("summary-next").click();

    // Verify scoreboard shows 5
    await expect(page.getByTestId("scoreboard")).toContainText("5");

    // Refresh
    await page.reload();

    // Should still be in game with scores
    await expect(page.getByTestId("scoreboard")).toBeVisible({ timeout: 3000 });
    await expect(page.getByTestId("scoreboard")).toContainText("5");
    await expect(page.getByTestId("scoreboard")).toContainText("Anna");
  });

  test("quit game clears persisted state", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("mode-freeplay").click();

    // Play a bit
    await page.getByTestId("correct").click();
    await page.getByTestId("next-card").click();

    // Quit via command bar
    await page.keyboard.press("Control+k");
    await page.getByTestId("cmd-quit").click();

    // Should be on start screen
    await expect(page.getByTestId("mode-freeplay")).toBeVisible();

    // Refresh — should still be on start screen (state cleared)
    await page.reload();
    await expect(page.getByTestId("mode-freeplay")).toBeVisible({ timeout: 3000 });
  });
});
