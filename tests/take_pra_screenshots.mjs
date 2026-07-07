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

// 2) Edit mode after loading a template
page.once("dialog", (d) => d.accept());
await page.click('#template-options [data-type="persona"]');
await page.waitForFunction(() => document.querySelector("#persona-editor").value.includes("standard: PortableAI Persona"), { timeout: 5000 });
await page.waitForSelector("#editor-surface", { state: "visible" });
await page.locator("#editor").scrollIntoViewIfNeeded();
await page.screenshot({ path: path.join(OUT, "02_edit_mode.png"), fullPage: true });

// 3) Read mode
await page.click("#mode-read");
await page.waitForSelector("#panel-read", { state: "visible" });
await page.locator("#editor").scrollIntoViewIfNeeded();
await page.screenshot({ path: path.join(OUT, "03_read_mode.png"), fullPage: true });

// 8) Teleport gutter (#83) — Read view, a margin bar hovered/lit.
await page.waitForSelector("#gutter-read .gutter-bar");
await page.evaluate(() => window.scrollTo(0, 0));
await page.hover('#gutter-read .gutter-bar[data-block-index="2"]');
await page.waitForTimeout(120);
await page.screenshot({ path: path.join(OUT, "08_gutter_read_hover.png"), fullPage: false });

// 9) Teleport gutter (#83) — Edit view, a margin bar hovered/lit.
await page.click("#mode-edit");
await page.waitForSelector("#gutter-edit .gutter-bar");
await page.evaluate(() => window.scrollTo(0, 0));
await page.hover('#gutter-edit .gutter-bar[data-block-index="2"]');
await page.waitForTimeout(120);
await page.screenshot({ path: path.join(OUT, "09_gutter_edit_hover.png"), fullPage: false });

// 4) Restore-or-clear banner
await page.reload();
await page.waitForSelector("#restore-banner", { state: "visible" });
await page.locator("#editor").scrollIntoViewIfNeeded();
await page.screenshot({ path: path.join(OUT, "04_restore_banner.png"), fullPage: true });

// 5) "Generate a profile" page — Persona (default) selected, full readout + both Copy buttons (#75)
await page.evaluate(() => localStorage.removeItem("portableAiPersonaDraft"));
await page.goto(url + "/generate-a-profile.html");
await page.waitForSelector("#prompt-readout-body");
await page.waitForFunction(() => {
  const el = document.querySelector("#prompt-readout-body");
  return el && el.textContent.trim().length > 0;
});
await page.screenshot({ path: path.join(OUT, "05_generate_a_profile_persona.png"), fullPage: true });

// 5b) "Generate a profile" page — Software Project selected (selector swaps the readout)
await page.click('#type-options [data-type="software-project"]');
await page.waitForFunction(() => {
  const el = document.querySelector("#prompt-readout-body");
  return el && el.textContent.includes("document_type: software-project");
});
await page.screenshot({ path: path.join(OUT, "05b_generate_a_profile_software_project.png"), fullPage: true });

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

// 10) Footer with version + build date (#43)
await page.goto(url);
await page.waitForSelector("#footer-build");
const footerEl = await page.$(".site-footer");
await footerEl.screenshot({ path: path.join(OUT, "10_footer.png") });

// 11) Add section (#23): appends an H1 section, lands in Edit at the new heading
await page.goto(url);
page.once("dialog", (d) => d.accept());
await page.click('#template-options [data-type="persona"]');
await page.waitForFunction(() => document.querySelector("#persona-editor").value.includes("standard: PortableAI Persona"), { timeout: 5000 });
await page.waitForSelector("#editor-surface", { state: "visible" });
await page.click("#add-section");
await page.waitForSelector("#panel-edit", { state: "visible" });
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.screenshot({ path: path.join(OUT, "11_add_section.png"), fullPage: false });

await browser.close();
server.close();
console.log("Screenshots written to", OUT);
