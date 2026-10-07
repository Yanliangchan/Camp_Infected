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
  await page.goto("http://127.0.0.1:5173/game.html");
  await page.getByRole("button", { name: "Begin operation" }).click();
  const before = await page.evaluate(() => window.campTutorial.state);
  await page.waitForFunction(
    (t) => window.campTutorial.state.atmosphereTime > t + 0.2,
    before.atmosphereTime,
    { timeout: 90000 },
  );
  const after = await page.evaluate(() => window.campTutorial.state);
  assert.notDeepEqual(after.fixtureLevels, before.fixtureLevels);
  await page.keyboard.press("m");
  await page.waitForFunction(
    () =>
      getComputedStyle(document.querySelector("#damage-flash")).opacity === "0",
  );
  await page.screenshot({ path: "artifacts/atmosphere-overview.png" });
  await page.keyboard.press("Escape");
  const paused = await page.evaluate(
    () => window.campTutorial.state.atmosphereTime,
  );
  await page.waitForTimeout(1200);
  assert.equal(
    await page.evaluate(() => window.campTutorial.state.atmosphereTime),
    paused,
  );
  await page.getByRole("button", { name: "Ambient animation: on" }).click();
  const off = await page.evaluate(() => window.campTutorial.state);
  assert.equal(off.ambientEnabled, false);
  assert.deepEqual(off.fixtureLevels, [1.2, 11, 11]);
  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(
    await page.evaluate(() => window.campTutorial.state.ambientEnabled),
    false,
  );
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify({
      before: before.fixtureLevels,
      after: after.fixtureLevels,
      pause: true,
      disabled: true,
      errors,
    }),
  );
} finally {
  await browser.close();
}
