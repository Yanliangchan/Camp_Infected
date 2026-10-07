import { chromium } from "playwright";
import assert from "node:assert/strict";
import {mkdir} from "node:fs/promises";
await mkdir("artifacts",{recursive:true});
const base = process.env.BASE_URL ?? "http://127.0.0.1:5173";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? "/usr/bin/chromium",
  args: [
    "--no-sandbox",
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
  ],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.setDefaultTimeout(60000);
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto(base);
await page.waitForTimeout(1200);
console.log("desktop");
await page.screenshot({ path: "artifacts/landing-desktop.png" });
await page
  .locator(".status-section")
  .screenshot({ path: "artifacts/landing-details.png" });
await page.evaluate(() => scrollTo(0, 0));
await page.getByRole("button", { name: "Play the tutorial" }).click();
await page.screenshot({ path: "artifacts/lobby-desktop.png" });
assert(await page.locator("dialog").evaluate((e) => e.open));
await page.keyboard.press("Escape");
console.log("art");
await page.getByRole("button", { name: "Meet the squad" }).click();
assert.equal(
  await page.locator("#review-app").getAttribute("data-view"),
  "soldier",
);
console.log("mobile");
await page.goto(base);
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(600);
assert(
  await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
);
await page.screenshot({ path: "artifacts/landing-mobile.png" });
await page
  .locator(".story-section")
  .screenshot({ path: "artifacts/landing-mobile-story.png" });
await page.evaluate(() => scrollTo(0, 0));
await page.getByRole("button", { name: "Play the tutorial" }).click();
await page.screenshot({ path: "artifacts/lobby-mobile.png" });
await page.goto(base+"/game.html");
await page.setViewportSize({ width: 1440, height: 900 });
await page.getByRole("button", { name: "Begin operation" }).click();
await page.waitForTimeout(300);
await page.keyboard.down("w");
await page.waitForFunction(
  () => window.campTutorial.state.x < -9,
  {},
  { timeout: 15000 },
);
await page.keyboard.up("w");
const state = await page.evaluate(() => window.campTutorial.state);
assert(state.x < -9 && state.z < 8);
await page.screenshot({ path: "artifacts/tutorial-desktop.png" });
await page.keyboard.press("Escape");
const frozen = await page.evaluate(() => window.campTutorial.state);
await page.waitForTimeout(200);
assert.deepEqual(await page.evaluate(() => window.campTutorial.state), frozen);
await page.keyboard.press("Escape");
assert.equal(await page.locator("#menu").evaluate(e=>e.open),false);
await page.keyboard.press("Escape");
await page.getByRole("button", { name: "Restart operation" }).click();
assert.equal((await page.evaluate(() => window.campTutorial.state)).step, 0);
assert.deepEqual(errors, []);
console.log(
  JSON.stringify({
    checks:
      "landing desktop/mobile, lobby, art navigation, movement, pause, restart",
    state,
    errors,
  }),
);
await browser.close();
