// Smoke test for PR A: editor redesign (empty state, Edit/Read mode, restore banner).
//
// Run from /home/user/workspace/ where playwright is installed:
//   node portable-ai-working/tests/smoke_editor_redesign.mjs
//
// Serves the website via a tiny static server and drives it with Playwright.

import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.resolve(__dirname, "..", "website");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
};

function serve(root, port = 0) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url.split("?")[0]);
      let filePath = path.join(root, urlPath === "/" ? "/index.html" : urlPath);
      if (!filePath.startsWith(root)) {
        res.statusCode = 403;
        res.end("Forbidden");
        return;
      }
      if (!fs.existsSync(filePath)) {
        res.statusCode = 404;
        res.end("Not found: " + urlPath);
        return;
      }
      const ext = path.extname(filePath);
      res.setHeader("Content-Type", MIME[ext] || "application/octet-stream");
      res.end(fs.readFileSync(filePath));
    });
    server.listen(port, "127.0.0.1", () => {
      const addr = server.address();
      resolve({ server, url: `http://127.0.0.1:${addr.port}` });
    });
  });
}

const assertions = [];
function assert(cond, label) {
  assertions.push({ ok: !!cond, label });
  const mark = cond ? "PASS" : "FAIL";
  console.log(`${mark} ${label}`);
}

const { server, url } = await serve(SITE_ROOT);
const browser = await chromium.launch();
const context = await browser.newContext();

try {
  // --- Case 1: fresh load with no draft ---
  const page = await context.newPage();
  await page.goto(url);
  await page.waitForSelector("#empty-state");

  assert(
    await page.isVisible("#empty-state"),
    "Empty state is visible on fresh load",
  );
  assert(
    !(await page.isVisible("#editor-surface")),
    "Editor surface is hidden on fresh load",
  );
  assert(
    !(await page.isVisible("#restore-banner")),
    "Restore banner is hidden when no draft in localStorage",
  );
  assert(
    (await page.textContent("#empty-state .empty-state-title")).includes("Nothing loaded yet"),
    "Empty state title reads 'Nothing loaded yet'",
  );
  assert(
    (await page.textContent("#empty-state .empty-state-hint")).toLowerCase().includes("load a profile or create a new one"),
    "Empty state hint reads 'Load a profile or create a new one'",
  );
  assert(
    (await page.textContent("#load-sample")).trim() === "Load a sample",
    "Primary action is 'Load a sample'",
  );
  assert(
    (await page.textContent("#open-file")).trim() === "Open a file",
    "Secondary action is 'Open a file'",
  );
  assert(
    (await page.textContent(".empty-state-secondary-title")).trim() === "Ask an AI to draft one",
    "Secondary card heading is 'Ask an AI to draft one'",
  );
  assert(
    !(await page.isVisible("#download-markdown")),
    "Download button hidden when editor is empty",
  );
  assert(
    !(await page.isVisible("#copy-markdown")),
    "Copy Markdown button hidden when editor is empty",
  );
  assert(
    !(await page.isVisible("#clear-draft")),
    "Clear button hidden when editor is empty",
  );

  // Hero copy (PR A3: rewritten)
  assert(
    (await page.textContent("#site-title")).includes("Every AI needs you to start over"),
    "Hero H1 reads 'Every AI needs you to start over' (was 'asks')",
  );
  assert(
    (await page.textContent(".tagline")).includes("take your profile anywhere"),
    "Hero tagline preserved",
  );
  assert(
    (await page.locator(".tagline .link").count()) === 1,
    "Hero tagline includes a 'Learn more' link",
  );
  assert(
    (await page.locator("#open-context-overlay").count()) === 0,
    "Hero CTAs removed (Ask an AI / Open the editor no longer in hero)",
  );
  assert(
    (await page.locator(".privacy-note").count()) === 0,
    "Privacy-and-trust box removed",
  );
  assert(
    (await page.locator("#editor-title").count()) === 0,
    "'Edit your profile' h2 removed",
  );
  assert(
    (await page.textContent(".editor-blurb")).toLowerCase().includes("never stored on portableai"),
    "Editor blurb mentions non-storage",
  );
  assert(
    (await page.locator(".editor-blurb .link").count()) === 1,
    "Editor blurb includes a 'Read more' link",
  );
  const h1Size = await page.$eval("#site-title", (el) => parseFloat(getComputedStyle(el).fontSize));
  assert(
    h1Size < 40,
    `Hero H1 is small now (${h1Size}px, expected < 40px)`,
  );

  // No tabs / no Form remnants
  assert(
    (await page.locator(".tabs").count()) === 0,
    "Old tab strip is gone",
  );
  assert(
    (await page.locator("#panel-form").count()) === 0,
    "Old Form panel is gone",
  );
  assert(
    (await page.locator("#form-fields").count()) === 0,
    "Old form-fields container is gone",
  );

  // --- Case 2: click 'Load a sample' → editor surface visible with Edit/Read ---
  await page.click("#load-sample");
  await page.waitForSelector("#editor-surface", { state: "visible" });
  assert(
    await page.isVisible("#editor-surface"),
    "Editor surface visible after loading sample",
  );
  assert(
    !(await page.isVisible("#empty-state")),
    "Empty state hidden after loading sample",
  );
  assert(
    await page.isVisible("#mode-edit"),
    "Edit mode button visible",
  );
  assert(
    await page.isVisible("#mode-read"),
    "Read mode button visible",
  );
  assert(
    (await page.getAttribute("#mode-edit", "aria-selected")) === "true",
    "Edit mode selected by default",
  );
  assert(
    await page.isVisible("#download-markdown"),
    "Download button visible when editor has content",
  );

  // Editor should have the sample
  const editorValue = await page.$eval("#persona-editor", (el) => el.value);
  assert(
    editorValue.includes("standard: PortableAI Persona"),
    "Editor contains sample front-matter",
  );
  assert(
    editorValue.includes("My PortableAI Profile"),
    "Sample uses 'My PortableAI Profile' (Persona→Profile rename)",
  );

  // --- Case 3: switch to Read mode ---
  await page.click("#mode-read");
  await page.waitForSelector("#panel-read", { state: "visible" });
  assert(
    (await page.getAttribute("#mode-read", "aria-selected")) === "true",
    "Read mode selected after click",
  );
  assert(
    await page.isVisible("#persona-preview"),
    "Preview content visible in Read mode",
  );
  const previewHtml = await page.innerHTML("#persona-preview");
  assert(
    previewHtml.includes("<h1"),
    "Read mode renders H1s",
  );
  assert(
    !previewHtml.includes("standard: PortableAI Persona"),
    "Read mode strips front-matter YAML (rendered separately in metadata card)",
  );
  assert(
    await page.isVisible("#persona-metadata"),
    "Metadata card visible in Read mode",
  );

  // Read-mode H1 font size should be small (~1.15rem = 18.4px), not the huge hero size.
  const h1FontSize = await page.$eval(
    "#persona-preview h1",
    (el) => window.getComputedStyle(el).fontSize,
  );
  const h1Px = parseFloat(h1FontSize);
  assert(
    h1Px > 14 && h1Px < 22,
    `Read-mode H1 font-size is small (~1.15rem); got ${h1FontSize}`,
  );

  // --- Case 4: download filename uses portableai-profile-YYYY-MM-DD.md ---
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.click("#download-markdown"),
  ]);
  const suggested = download.suggestedFilename();
  assert(
    /^portableai-profile-\d{4}-\d{2}-\d{2}\.md$/.test(suggested),
    `Download filename matches portableai-profile-YYYY-MM-DD.md; got ${suggested}`,
  );

  // --- Case 5: restore-or-clear banner appears on reload ---
  await page.reload();
  await page.waitForSelector("#restore-banner", { state: "visible" });
  assert(
    await page.isVisible("#restore-banner"),
    "Restore banner appears on reload when draft exists",
  );
  assert(
    (await page.textContent(".restore-banner-text")).includes("draft from a previous session"),
    "Restore banner text mentions previous session",
  );
  assert(
    await page.isVisible("#empty-state"),
    "Empty state still shown behind banner (draft not auto-restored)",
  );

  // Clicking Restore should hydrate the editor and hide the banner.
  await page.click("#restore-draft");
  await page.waitForSelector("#restore-banner", { state: "hidden" });
  assert(
    !(await page.isVisible("#restore-banner")),
    "Restore banner hidden after clicking Restore",
  );
  assert(
    await page.isVisible("#editor-surface"),
    "Editor surface visible after Restore",
  );

  // --- Case 6: Clear from banner drops storage; reload stays empty ---
  await page.click("#clear-draft");
  // confirm dialog; accept
  page.on("dialog", (d) => d.accept());
  await page.evaluate(() => document.querySelector("#persona-editor").value = "");
  await page.evaluate(() => localStorage.removeItem("portableAiPersonaDraft"));
  await page.reload();
  await page.waitForSelector("#empty-state", { state: "visible" });
  assert(
    !(await page.isVisible("#restore-banner")),
    "No banner on reload after clearing localStorage",
  );

  // --- Case 7: 'Ask an AI to draft one' overlay opens from empty-state ---
  await page.click("#empty-show-full");
  await page.waitForSelector("#context-overlay", { state: "visible" });
  assert(
    (await page.textContent("#context-overlay-title")).trim() === "Ask an AI to draft one",
    "Overlay heading reads 'Ask an AI to draft one'",
  );
  const promptText = await page.$eval("#context-export-prompt", (el) => el.value);
  assert(
    promptText.includes("portableai-profile-YYYY-MM-DD.md"),
    "Prompt tells AI to use standard filename",
  );
  assert(
    promptText.toLowerCase().includes("markdown"),
    "Prompt asks for Markdown output",
  );
  assert(
    !/what\s+(is\s+)?(your|my)\s+name/i.test(promptText),
    "Prompt never asks the user's name",
  );
  assert(
    promptText.includes("load it into another AI, or open it in PortableAI to review or edit"),
    "Prompt includes closing instructions to the user",
  );
  assert(
    (await page.textContent("#context-overlay-description")).includes("open on PortableAI.org"),
    "Overlay intro says 'open on PortableAI.org'",
  );
  assert(
    await page.isVisible("#copy-context-prompt"),
    "Copy prompt button visible above textarea in overlay",
  );
  assert(
    await page.isVisible("#toggle-prompt-length"),
    "Show full prompt toggle visible in overlay",
  );
  const promptClassesBefore = await page.getAttribute("#context-export-prompt", "class");
  assert(
    promptClassesBefore.includes("prompt-textarea--collapsed"),
    "Overlay prompt starts collapsed",
  );
  await page.click("#toggle-prompt-length");
  const promptClassesAfter = await page.getAttribute("#context-export-prompt", "class");
  assert(
    !promptClassesAfter.includes("prompt-textarea--collapsed"),
    "Toggle expands the overlay prompt",
  );
  await page.click("#close-context-overlay");
  await page.waitForSelector("#context-overlay", { state: "hidden" });
  assert(
    !(await page.isVisible("#context-overlay")),
    "Overlay closes on Close button",
  );

  // --- Case 8: /learn.html loads and links back ---
  await page.goto(url + "/learn.html");
  await page.waitForSelector("#learn-title");
  assert(
    (await page.textContent("#learn-title")).toLowerCase().includes("learn more"),
    "/learn.html has 'Learn more' heading",
  );
  assert(
    (await page.locator(".learn-nav").count()) === 0,
    "/learn.html back-to-editor nav removed (fixed header replaces it)",
  );

  // --- Case 9: footer has repo/license line and neutral one-liner ---
  await page.goto(url);
  assert(
    (await page.locator(".site-footer .footer-meta").count()) === 1,
    "Footer has meta line (repo/license/version)",
  );
  assert(
    (await page.textContent(".site-footer .footer-meta")).toLowerCase().includes("mit"),
    "Footer meta mentions MIT license",
  );
  assert(
    (await page.locator(".site-footer .footer-tagline").count()) === 0,
    "Old 'People should own their context' tagline removed",
  );

  // --- Case 10 (PR A4): fixed header on both pages ---
  const RGB_TEXT = "rgb(17, 17, 17)";
  const RGB_ACCENT = "rgb(59, 91, 255)";

  for (const pagePath of ["/", "/learn.html"]) {
    await page.goto(url + pagePath);
    await page.waitForSelector(".site-header");
    assert(
      (await page.locator(".site-header").count()) === 1,
      `Fixed header present on ${pagePath}`,
    );
    assert(
      (await page.getAttribute(".site-header .site-wordmark", "href")) === "index.html",
      `Header wordmark on ${pagePath} links to home (index.html)`,
    );
    assert(
      (await page.textContent(".site-header .site-wordmark")).trim() === "PortableAI",
      `Header wordmark on ${pagePath} reads 'PortableAI'`,
    );
    const navLinks = page.locator(".site-header .site-nav .site-nav-link");
    assert(
      (await navLinks.count()) === 2,
      `Header has exactly two nav links on ${pagePath}`,
    );
    assert(
      (await navLinks.nth(0).textContent()).trim() === "Learn more" &&
        (await navLinks.nth(0).getAttribute("href")) === "learn.html",
      `First nav link on ${pagePath} is 'Learn more' → learn.html`,
    );
    assert(
      (await navLinks.nth(1).textContent()).trim() === "Project" &&
        (await navLinks.nth(1).getAttribute("href")) === "https://github.com/refineryllc/portable-ai-working",
      `Second nav link on ${pagePath} is 'Project' → GitHub repo`,
    );
    const headerPos = await page.$eval(".site-header", (el) => getComputedStyle(el).position);
    assert(
      headerPos === "fixed",
      `Header is position:fixed on ${pagePath} (got ${headerPos})`,
    );
  }

  // --- Case 11 (PR A4): regular text flattened to 1rem #111 ---
  await page.goto(url);
  await page.waitForSelector(".tagline");
  const flatTargets = [".tagline", ".editor-blurb", "#empty-state .empty-state-hint", ".site-footer .footer-meta", ".site-footer .footer-note", ".site-footer .footer-contact"];
  for (const sel of flatTargets) {
    const { size, color } = await page.$eval(sel, (el) => {
      const s = getComputedStyle(el);
      return { size: s.fontSize, color: s.color };
    });
    assert(size === "16px", `${sel} font-size is 1rem/16px (got ${size})`);
    assert(color === RGB_TEXT, `${sel} color is #111 (got ${color})`);
  }

  // --- Case 12 (PR A4): links accent-blue site-wide, only overlay Close muted ---
  const heroLink = await page.$eval(".tagline .link", (el) => getComputedStyle(el).color);
  assert(heroLink === RGB_ACCENT, `Hero 'Learn more' link is accent-blue (got ${heroLink})`);
  const blurbLink = await page.$eval(".editor-blurb .link", (el) => getComputedStyle(el).color);
  assert(blurbLink === RGB_ACCENT, `Editor blurb link is accent-blue (got ${blurbLink})`);
  // Open overlay and confirm Close is the only muted link, and it resolves muted.
  await page.click("#empty-show-full");
  await page.waitForSelector("#context-overlay", { state: "visible" });
  assert(
    (await page.getAttribute("#close-context-overlay", "class")).includes("muted"),
    "Overlay Close still carries .link.muted",
  );
  const closeColor = await page.$eval("#close-context-overlay", (el) => getComputedStyle(el).color);
  assert(closeColor !== RGB_ACCENT, `Overlay Close resolves to muted, not accent (got ${closeColor})`);
  const overlayCopyColor = await page.$eval("#copy-context-prompt", (el) => getComputedStyle(el).color);
  assert(overlayCopyColor === RGB_ACCENT, `Overlay 'Copy prompt' is accent-blue (got ${overlayCopyColor})`);
  const toggleColor = await page.$eval("#toggle-prompt-length", (el) => getComputedStyle(el).color);
  assert(toggleColor === RGB_ACCENT, `Overlay 'Show full prompt' toggle is accent-blue, no longer muted (got ${toggleColor})`);
  await page.click("#close-context-overlay");
  await page.waitForSelector("#context-overlay", { state: "hidden" });
  // The only .link.muted anywhere should be the overlay Close.
  const mutedCount = await page.locator(".link.muted").count();
  assert(mutedCount === 1, `Exactly one .link.muted remains (overlay Close); got ${mutedCount}`);

  // --- Case 13 (PR A4): footer left-aligned, flush with editor panel ---
  const footerAlign = await page.$eval(".site-footer", (el) => getComputedStyle(el).textAlign);
  assert(footerAlign === "left", `Footer text-align is left (got ${footerAlign})`);
  const { footerLeft, panelLeft } = await page.evaluate(() => {
    const f = document.querySelector(".footer-meta").getBoundingClientRect();
    const p = document.querySelector(".editor-panel").getBoundingClientRect();
    return { footerLeft: f.left, panelLeft: p.left };
  });
  assert(
    Math.abs(footerLeft - panelLeft) <= 2,
    `Footer left edge aligns with editor panel (footer ${footerLeft} vs panel ${panelLeft})`,
  );

  // --- Case 14 (PR A4): mobile hamburger toggles nav ---
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(url);
  await page.waitForSelector("#nav-toggle");
  assert(
    await page.isVisible("#nav-toggle"),
    "Hamburger visible at 375px width",
  );
  assert(
    !(await page.isVisible("#site-nav .site-nav-link")),
    "Nav links hidden by default on mobile",
  );
  await page.click("#nav-toggle");
  assert(
    (await page.getAttribute("#nav-toggle", "aria-expanded")) === "true",
    "Hamburger sets aria-expanded=true when opened",
  );
  assert(
    await page.isVisible("#site-nav .site-nav-link"),
    "Nav links visible after tapping hamburger",
  );
  await page.setViewportSize({ width: 1280, height: 900 });
} finally {
  await browser.close();
  server.close();
}

const failed = assertions.filter((a) => !a.ok);
console.log(`\n${assertions.length - failed.length}/${assertions.length} assertions passed`);
if (failed.length) {
  console.log("Failures:");
  for (const f of failed) console.log(" - " + f.label);
  process.exit(1);
}
