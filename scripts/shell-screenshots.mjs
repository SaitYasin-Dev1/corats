// Kullanım: önce  npx cross-env VITE_HOSTED_MODE=true npm run dev:mock
// sonra   node scripts/shell-screenshots.mjs [outDir]
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const base = process.env.SHELL_BASE_URL ?? "http://localhost:3001";
const out = process.argv[2] ?? path.resolve("shell-screenshots");
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto(`${base}/conversations`, { waitUntil: "networkidle" });
await page.screenshot({ path: path.join(out, "01-home-expanded.png") });

await page.getByRole("button", { name: /collapse sidebar/i }).click();
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(out, "02-home-collapsed.png") });
await page.getByTestId("shell-sidebar").hover();
await page.waitForTimeout(400);
await page.screenshot({ path: path.join(out, "03-sidebar-peek.png") });
await page.mouse.move(900, 450);
await page.getByRole("button", { name: /expand sidebar/i }).click();

const firstRecent = page.getByTestId("shell-recent-link").first();
if (await firstRecent.count()) {
  await firstRecent.click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(out, "04-conversation.png") });
  await page.getByTestId("right-panel-toggle").click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(out, "05-conversation-panel.png") });
}

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(`${base}/conversations`, { waitUntil: "networkidle" });
await page.screenshot({ path: path.join(out, "06-mobile-home.png") });

await browser.close();
console.log(`screenshots → ${out}`);
