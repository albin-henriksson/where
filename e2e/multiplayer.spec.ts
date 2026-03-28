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
    await page.getByTestId("host-name-input").fill("TestHost");
    await page.getByTestId("host-name-submit").click();

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
    await page.getByTestId("host-name-input").fill("TestHost");
    await page.getByTestId("host-name-submit").click();

    await page.getByText("Avbryt").click();
    await expect(page.getByTestId("mode-freeplay")).toBeVisible();
  });
});

test.describe("Multiplayer P2P", () => {
  test.describe.configure({ retries: 2 });

  test("autodiscovery: player sees hosted game on join screen", async ({ browser }) => {
    const hostContext = await browser.newContext();
    const playerContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    const playerPage = await playerContext.newPage();

    // Host creates a game
    await hostPage.goto("http://localhost:5173");
    await hostPage.getByTestId("mode-multiplayer").click();
    await hostPage.getByTestId("mp-host").click();
    await hostPage.getByTestId("host-name-input").fill("Host");
    await hostPage.getByTestId("host-name-submit").click();

    const roomCode = await hostPage.getByTestId("room-code").textContent();
    expect(roomCode).toBeTruthy();

    // Player opens join screen
    await playerPage.goto("http://localhost:5173");
    await playerPage.getByTestId("mode-multiplayer").click();
    await playerPage.getByTestId("mp-join").click();

    // Player should see the discovered game within 10s
    await expect(
      playerPage.getByTestId(`discovered-${roomCode}`),
    ).toBeVisible({ timeout: 15000 });

    await hostContext.close();
    await playerContext.close();
  });

  test("host and two players can connect, rotate reader, and buzz", async ({ browser }) => {
    const hostContext = await browser.newContext();
    const player1Context = await browser.newContext();
    const player2Context = await browser.newContext();
    const hostPage = await hostContext.newPage();
    const player1Page = await player1Context.newPage();
    const player2Page = await player2Context.newPage();

    // Host creates a game with their name
    await hostPage.goto("http://localhost:5173");
    await hostPage.getByTestId("mode-multiplayer").click();
    await hostPage.getByTestId("mp-host").click();
    await hostPage.getByTestId("host-name-input").fill("HostPlayer");
    await hostPage.getByTestId("host-name-submit").click();

    const roomCode = await hostPage.getByTestId("room-code").textContent();
    expect(roomCode).toBeTruthy();

    // Player 1 joins (will be the first reader)
    await player1Page.goto("http://localhost:5173");
    await player1Page.getByTestId("mode-multiplayer").click();
    await player1Page.getByTestId("mp-join").click();
    await player1Page.getByTestId("join-name").fill("Alice");
    await player1Page.getByTestId("join-code").fill(roomCode!);
    await player1Page.getByTestId("join-submit").click();

    // Player 2 joins (will be the buzzer)
    await player2Page.goto("http://localhost:5173");
    await player2Page.getByTestId("mode-multiplayer").click();
    await player2Page.getByTestId("mp-join").click();
    await player2Page.getByTestId("join-name").fill("Bob");
    await player2Page.getByTestId("join-code").fill(roomCode!);
    await player2Page.getByTestId("join-submit").click();

    // Wait for both to connect
    await expect(player1Page.getByText("Ansluten")).toBeVisible({ timeout: 15000 });
    await expect(player2Page.getByText("Ansluten")).toBeVisible({ timeout: 15000 });
    await expect(hostPage.getByText("Alice")).toBeVisible({ timeout: 15000 });
    await expect(hostPage.getByText("Bob")).toBeVisible({ timeout: 15000 });

    // Host starts the game
    await hostPage.getByTestId("start-multiplayer").click();

    // Host (HostPlayer) is first reader — sees ReaderView with next clue button
    await expect(hostPage.getByTestId("reader-next-clue")).toBeVisible({ timeout: 5000 });

    // Alice and Bob should see the buzzer
    await expect(player1Page.getByTestId("buzz-button")).toBeVisible({ timeout: 10000 });
    await expect(player2Page.getByTestId("buzz-button")).toBeVisible({ timeout: 10000 });

    // Bob buzzes
    await player2Page.getByTestId("buzz-button").click();

    // Host (reader) should see Rätt/Fel buttons
    await expect(hostPage.getByTestId("reader-buzz-correct")).toBeVisible({ timeout: 5000 });

    await hostContext.close();
    await player1Context.close();
    await player2Context.close();
  });
});
