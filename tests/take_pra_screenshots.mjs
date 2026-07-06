// Capture PR A screenshots.
// Run from /home/user/workspace/ where playwright is installed.
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.resolve(__dirname, "..", "website");
const OUT = path.resolve(__dirname, "..", "..", "pra_shots");
fs.mkdirSync(OUT, { recursive: true });

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);
  const filePath = path.join(SITE_ROOT, urlPath === "/" ? "/index.html" : urlPath);
  if (!fs.existsSync(filePath)) { res.statusCode = 404; res.end(); return; }
  res.setHeader("Content-Type", MIME[path.extname(filePath)] || "application/octet-stream");
  res.end(fs.readFileSync(filePath));
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const url = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

// 1) Empty state
await page.goto(url);
await page.waitForSelector("#empty-state", { state: "visible" });
await page.locator("#editor").scrollIntoViewIfNeeded();
await page.screenshot({ path: path.join(OUT, "01_empty_state.png"), fullPage: true });

// 2) Edit mode after loading sample
await page.click("#load-sample");
await page.waitForSelector("#editor-surface", { state: "visible" });
await page.locator("#editor").scrollIntoViewIfNeeded();
await page.screenshot({ path: path.join(OUT, "02_edit_mode.png"), fullPage: true });

// 3) Read mode
await page.click("#mode-read");
await page.waitForSelector("#panel-read", { state: "visible" });
await page.locator("#editor").scrollIntoViewIfNeeded();
await page.screenshot({ path: path.join(OUT, "03_read_mode.png"), fullPage: true });

// 4) Restore-or-clear banner
await page.reload();
await page.waitForSelector("#restore-banner", { state: "visible" });
await page.locator("#editor").scrollIntoViewIfNeeded();
await page.screenshot({ path: path.join(OUT, "04_restore_banner.png"), fullPage: true });

// 5) AI draft overlay
await page.evaluate(() => localStorage.removeItem("portableAiPersonaDraft"));
await page.reload();
await page.waitForSelector("#empty-state", { state: "visible" });
await page.click("#empty-show-full");
await page.waitForSelector("#context-overlay", { state: "visible" });
await page.screenshot({ path: path.join(OUT, "05_ai_draft_overlay.png"), fullPage: false });

await browser.close();
server.close();
console.log("Screenshots written to", OUT);
