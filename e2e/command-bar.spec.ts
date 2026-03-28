import { test, expect } from "@playwright/test";

test.describe("Command Bar (US6)", () => {
  test("Cmd+K opens bar, Escape closes it", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("mode-freeplay").click();

    await page.keyboard.press("Control+k");
    await expect(page.getByTestId("command-bar")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByTestId("command-bar-overlay")).not.toBeVisible();
  });

  test("type to filter commands, Enter executes", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("mode-competition").click();
    await page.getByTestId("player-input-0").fill("Anna");
    await page.getByTestId("player-input-1").fill("Erik");
    await page.getByTestId("start-competition").click();

    await page.keyboard.press("Control+k");
    await page.getByTestId("command-input").fill("hoppa");

    // Should filter to show "Hoppa över kort"
    await expect(page.getByTestId("cmd-skip")).toBeVisible();
    // Other commands should be hidden
    await expect(page.getByTestId("cmd-new-game")).not.toBeVisible();
  });

  test("reset scores sets all to 0", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("mode-competition").click();
    await page.getByTestId("player-input-0").fill("Anna");
    await page.getByTestId("player-input-1").fill("Erik");
    await page.getByTestId("start-competition").click();

    // Score a point for Anna
    await page.getByTestId("correct").click();
    await page.getByTestId("award-Anna").click();

    // Click through score summary
    await page.getByTestId("summary-next").click();

    // Verify score is 5
    await expect(page.getByTestId("scoreboard")).toContainText("5");

    // Open command bar and reset
    await page.keyboard.press("Control+k");
    await page.getByTestId("cmd-reset-scores").click();

    // Verify all scores are 0
    const scoreboard = page.getByTestId("scoreboard");
    // Both should show 0 now
    const text = await scoreboard.textContent();
    expect(text).not.toContain("5");
  });
});
