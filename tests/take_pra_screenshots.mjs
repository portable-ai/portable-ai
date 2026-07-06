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

// 5) Get a Prompt page — Persona (default) selected, full readout + both Copy buttons (#75)
await page.evaluate(() => localStorage.removeItem("portableAiPersonaDraft"));
await page.goto(url + "/get-a-prompt.html");
await page.waitForSelector("#prompt-readout-body");
await page.waitForFunction(() => {
  const el = document.querySelector("#prompt-readout-body");
  return el && el.textContent.trim().length > 0;
});
await page.screenshot({ path: path.join(OUT, "05_get_a_prompt_persona.png"), fullPage: true });

// 5b) Get a Prompt page — Software Project selected (selector swaps the readout)
await page.click('#type-options [data-type="software-project"]');
await page.waitForFunction(() => {
  const el = document.querySelector("#prompt-readout-body");
  return el && el.textContent.includes("document_type: software-project");
});
await page.screenshot({ path: path.join(OUT, "05b_get_a_prompt_software_project.png"), fullPage: true });

// 6) Learn page
await page.goto(url + "/learn.html");
await page.waitForSelector("#learn-title");
await page.screenshot({ path: path.join(OUT, "06_learn_page.png"), fullPage: true });

// 7) Mobile header with hamburger menu open (PR A4)
const mobile = await browser.newContext({ viewport: { width: 375, height: 812 } });
const mpage = await mobile.newPage();
await mpage.goto(url);
await mpage.waitForSelector("#nav-toggle", { state: "visible" });
await mpage.click("#nav-toggle");
await mpage.waitForSelector("#site-nav .site-nav-link", { state: "visible" });
await mpage.screenshot({ path: path.join(OUT, "07_header_mobile.png"), fullPage: false });
await mobile.close();

await browser.close();
server.close();
console.log("Screenshots written to", OUT);
