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
  const settle = () =>
    page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
    );
  await page.goto("http://127.0.0.1:5173/review.html");
  await page.getByRole("button", { name: "First room" }).click();
  await page.getByRole("button", { name: "Ambient animation: on" }).click();
  await settle();
  await page.screenshot({ path: "artifacts/map-after-art-pass.png" });
  const inspector = await page
    .locator("#review-app")
    .evaluate((el) => ({
      calls: el.dataset.drawCalls,
      triangles: el.dataset.triangles,
    }));
  await page.getByRole("button", { name: "Guard rest", exact: true }).click();
  await settle();
  await page.screenshot({ path: "artifacts/map-rest-art-pass.png" });
  await page
    .getByRole("button", { name: "Game camera · 1.5×", exact: true })
    .click();
  await settle();
  await page.screenshot({ path: "artifacts/map-play-camera-art-pass.png" });
  await page.goto("http://127.0.0.1:5173/game.html");
  await page.getByRole("button", { name: "Begin operation" }).click();
  await settle();
  await page.screenshot({ path: "artifacts/gameplay-art-pass.png" });
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify({
      inspector,
      errors,
      gameplay: await page.evaluate(() => window.campTutorial.state),
    }),
  );
} finally {
  await browser.close();
}
