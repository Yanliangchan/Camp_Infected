import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import assert from "node:assert/strict";
await mkdir("artifacts", { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? "/usr/bin/chromium",
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
  await page.screenshot({ path: "artifacts/guardhouse-gameplay.png" });
  await page.keyboard.press("m");
  await page.screenshot({ path: "artifacts/guardhouse-overview.png" });
  await page.keyboard.press("m");
  await page.keyboard.down("w");
  await page.keyboard.down("d");
  await page.waitForFunction(
    () => window.campTutorial?.state.z < 6.5,
    {},
    { timeout: 90000 },
  );
  await page.keyboard.up("w");
  await page.keyboard.up("d");
  await page.screenshot({ path: "artifacts/guardhouse-interior.png" });
  await page.keyboard.down("w");
  await page.keyboard.down("d");
  await page.waitForFunction(
    () => window.campTutorial?.state.z < 1,
    {},
    { timeout: 90000 },
  );
  await page.keyboard.up("w");
  await page.keyboard.up("d");
  await page.screenshot({ path: "artifacts/guardhouse-pass-office.png" });
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify({
      state: await page.evaluate(() => window.campTutorial.state),
      errors,
    }),
  );
} finally {
  await browser.close();
}
