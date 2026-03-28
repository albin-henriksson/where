import { test, expect } from "@playwright/test";

test.describe("Multiplayer UI (US7)", () => {
  test("start screen shows multiplayer option", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("mode-multiplayer")).toBeVisible();
  });

  test("multiplayer lobby shows host and join options", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("mode-multiplayer").click();

    await expect(page.getByTestId("mp-host")).toBeVisible();
    await expect(page.getByTestId("mp-join")).toBeVisible();
  });

  test("hosting creates a room with 4-letter code", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("mode-multiplayer").click();
    await page.getByTestId("mp-host").click();

    const roomCode = page.getByTestId("room-code");
    await expect(roomCode).toBeVisible();
    const code = await roomCode.textContent();
    expect(code).toMatch(/^[A-Z0-9]{4}$/);
  });

  test("join screen has name and code inputs", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("mode-multiplayer").click();
    await page.getByTestId("mp-join").click();

    await expect(page.getByTestId("join-name")).toBeVisible();
    await expect(page.getByTestId("join-code")).toBeVisible();
    await expect(page.getByTestId("join-submit")).toBeVisible();
  });

  test("join button disabled without name and code", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("mode-multiplayer").click();
    await page.getByTestId("mp-join").click();

    await expect(page.getByTestId("join-submit")).toBeDisabled();

    await page.getByTestId("join-name").fill("Test");
    await expect(page.getByTestId("join-submit")).toBeDisabled();

    await page.getByTestId("join-code").fill("ABCD");
    await expect(page.getByTestId("join-submit")).toBeEnabled();
  });

  test("back button returns to start screen from lobby", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("mode-multiplayer").click();
    await page.getByTestId("mp-host").click();

    // Click Avbryt (cancel)
    await page.getByText("Avbryt").click();
    await expect(page.getByTestId("mode-freeplay")).toBeVisible();
  });
});

test.describe("Multiplayer P2P", () => {
  test("host and player can connect and play", async ({ browser }) => {
    // Create two isolated browser contexts
    const hostContext = await browser.newContext();
    const playerContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    const playerPage = await playerContext.newPage();

    // Host creates a game
    await hostPage.goto("http://localhost:5173");
    await hostPage.getByTestId("mode-multiplayer").click();
    await hostPage.getByTestId("mp-host").click();

    // Get the room code
    const roomCode = await hostPage.getByTestId("room-code").textContent();
    expect(roomCode).toBeTruthy();

    // Player joins with the code
    await playerPage.goto("http://localhost:5173");
    await playerPage.getByTestId("mode-multiplayer").click();
    await playerPage.getByTestId("mp-join").click();
    await playerPage.getByTestId("join-name").fill("TestPlayer");
    await playerPage.getByTestId("join-code").fill(roomCode!);
    await playerPage.getByTestId("join-submit").click();

    // Wait for connection (player sees "Ansluten")
    await expect(playerPage.getByText("Ansluten")).toBeVisible({ timeout: 15000 });

    // Host should see the player in the lobby
    await expect(hostPage.getByText("TestPlayer")).toBeVisible({ timeout: 15000 });

    // Host starts the game
    await hostPage.getByTestId("start-multiplayer").click();

    // Host should see the card view with answer
    await expect(hostPage.getByTestId("clue-text")).toBeVisible({ timeout: 5000 });
    await expect(hostPage.getByTestId("reader-answer")).toBeVisible();

    // Player should see the buzzer
    await expect(playerPage.getByTestId("buzz-button")).toBeVisible({ timeout: 10000 });

    // Player buzzes
    await playerPage.getByTestId("buzz-button").click();

    // Host should see buzz notification
    await expect(hostPage.getByText("TestPlayer buzzade")).toBeVisible({ timeout: 5000 });

    // Cleanup
    await hostContext.close();
    await playerContext.close();
  });
});
