import { chromium } from "playwright";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: [
    "--no-sandbox",
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
  ],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("http://127.0.0.1:5180/");
  await page.waitForFunction(
    () => window.society?.game,
    {},
    { timeout: 90000 },
  );
  await page.evaluate(() => {
    const { sim, game } = window.society;
    sim.state.money = 1e7;
    sim.state.reputation = 200;
    for (const id of [
      "ws_2",
      "recruit_board",
      "ws_3",
      "coffee_1",
      "wall_display_1",
      "expand_1",
      "ws_4",
      "ws_5",
      "automation_server",
      "playbook_board",
      "water_1",
      "plant_2",
      "ws_6",
      "expand_2",
      "ws_7",
      "ws_8",
      "server_2",
      "sofa_1",
      "bookshelf_1",
      "ws_9",
      "ws_10",
    ])
      sim.payIntoPad(id, 1e9);
    for (let i = 0; i < 6; i++)
      sim.hire(0) || (sim.refreshCandidates(true), sim.hire(0));
    game.view.desiredZoom = 0.8;
    game.view.zoom = 0.8;
    game.view.updateFrustum();
    game.player.position.set(7, 0, 6);
    game.view.follow(game.player.position, 0, true);
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "artifacts/society-comparison.png" });
  await page.goto("http://127.0.0.1:5173/review.html");
  await page.getByRole("button", { name: "First room" }).click();
  await page.getByRole("button", { name: "Ambient animation: on" }).click();
  await page.screenshot({ path: "artifacts/map-before-art-pass.png" });
  assert.deepEqual(errors, []);
  console.log("Comparison screenshots captured without runtime errors");
} finally {
  await browser.close();
}
