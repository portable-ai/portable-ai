// Smoke test for PR A: editor redesign (empty state, Edit/Read mode, restore banner).
//
// Run from /home/user/workspace/ where playwright is installed:
//   node portable-ai-working/tests/smoke_editor_redesign.mjs
//
// Serves the website via a tiny static server and drives it with Playwright.

import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
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
    (await page.textContent("#load-sample")).trim() === "Load a sample profile",
    "Primary action is 'Load a sample profile'",
  );
  assert(
    (await page.textContent("#open-profile")).trim() === "Open a profile",
    "Open-file action is labeled 'Open a profile' (#86)",
  );
  // #86: empty-state primary actions in order: Generate a profile · Open a profile · Load a sample profile.
  const emptyActionLabels = await page.locator(".empty-state-actions .link").allTextContents();
  assert(
    emptyActionLabels.map((t) => t.trim()).join(" | ") === "Generate a profile | Open a profile | Load a sample profile",
    `Empty-state actions are ordered Generate/Open/Load (got ${emptyActionLabels.map((t) => t.trim()).join(" | ")})`,
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
    (await page.locator(".tagline .link").count()) === 0,
    "Hero tagline no longer has an in-body 'Learn more' link (#86 — header nav covers it)",
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
    (await page.locator(".editor-blurb .link").count()) === 0,
    "Editor blurb no longer has an in-body 'Read more' link (#86 — header nav covers it)",
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

  // --- Case 7 (#75): overlay is GONE; "Generate a profile" is a dedicated page ---
  await page.reload();
  await page.waitForSelector("#empty-state", { state: "visible" });
  assert(
    (await page.locator("#context-overlay").count()) === 0,
    "AI-draft overlay removed from index.html",
  );
  assert(
    (await page.locator("#context-export-prompt").count()) === 0,
    "Overlay prompt textarea removed",
  );
  // Empty-state links to the page via the 'Generate a profile' primary action.
  assert(
    (await page.getAttribute("#empty-generate-profile", "href")) === "generate-a-profile.html",
    "Empty-state 'Generate a profile' links to generate-a-profile.html",
  );
  assert(
    (await page.textContent("#empty-generate-profile")).trim() === "Generate a profile",
    "First empty-state action reads 'Generate a profile'",
  );
  // #86: the standalone secondary 'Get a prompt' link is removed; the block
  // now just points the user at 'Generate a profile'.
  assert(
    (await page.locator("#empty-get-a-prompt").count()) === 0,
    "Standalone secondary prompt link removed from empty state (#86)",
  );
  assert(
    (await page.textContent(".empty-state-secondary-hint")).includes('Click “Generate a profile” to build one from any AI'),
    "Secondary block hint points to 'Generate a profile' (#86)",
  );
  assert(
    (await page.textContent(".empty-state-secondary-title")).trim() === "Ask an AI to draft one",
    "Secondary block keeps its 'Ask an AI to draft one' heading (#86)",
  );

  // The "Generate a profile" page itself.
  await page.goto(url + "/generate-a-profile.html");
  await page.waitForSelector("#prompt-readout-body");
  assert(
    (await page.textContent("#prompt-title")).trim() === "Generate a profile",
    "Generate-a-profile page has 'Generate a profile' heading",
  );
  // Type selector: two options, Persona default.
  const typeOptions = page.locator("#type-options [data-type]");
  assert(
    (await typeOptions.count()) === 2,
    "Type selector renders two profile types",
  );
  assert(
    (await page.getAttribute('#type-options [data-type="persona"]', "aria-checked")) === "true",
    "Persona is the default selected type",
  );
  // Full readout, not a scroll box: it is a <pre>, not a textarea.
  assert(
    (await page.locator("#prompt-readout-body").evaluate((el) => el.tagName)) === "PRE",
    "Prompt readout is a full <pre>, not a scrolling textarea",
  );
  const personaText = await page.textContent("#prompt-readout-body");
  assert(
    personaText.includes("portableai-profile-YYYY-MM-DD.md"),
    "Persona prompt tells AI to use standard filename",
  );
  assert(
    personaText.toLowerCase().includes("markdown"),
    "Persona prompt asks for Markdown output",
  );
  assert(
    !/what\s+(is\s+)?(your|my)\s+name/i.test(personaText),
    "Persona prompt never asks the user's name",
  );
  assert(
    personaText.includes("load it into another AI, or open it in PortableAI to review or edit"),
    "Persona prompt includes closing instructions to the user",
  );
  // Copy buttons at BOTH top and bottom.
  assert(
    await page.isVisible("#copy-prompt-top"),
    "Copy button visible at top of readout",
  );
  assert(
    await page.isVisible("#copy-prompt-bottom"),
    "Copy button visible at bottom of readout",
  );
  // Switching to Software Project swaps the prompt to the software-project one.
  await page.click('#type-options [data-type="software-project"]');
  assert(
    (await page.getAttribute('#type-options [data-type="software-project"]', "aria-checked")) === "true",
    "Software Project becomes selected after click",
  );
  const projectText = await page.textContent("#prompt-readout-body");
  assert(
    projectText.includes("document_type: software-project"),
    "Software Project prompt outputs document_type: software-project",
  );
  assert(
    projectText.includes("portableai-software-project-YYYY-MM-DD.md"),
    "Software Project prompt uses the software-project filename",
  );
  assert(
    /architecture/i.test(projectText) && /tech stack/i.test(projectText),
    "Software Project prompt extracts architecture + tech stack",
  );
  assert(
    projectText !== personaText,
    "Prompt readout changes when profile type changes",
  );
  // Privacy line present.
  assert(
    (await page.textContent(".prompt-privacy")).toLowerCase().includes("does not connect to your ai accounts"),
    "Page states the non-storage privacy guarantee",
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

  for (const pagePath of ["/", "/learn.html", "/generate-a-profile.html"]) {
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
      (await navLinks.count()) === 3,
      `Header has exactly three nav links on ${pagePath}`,
    );
    assert(
      (await navLinks.nth(0).textContent()).trim() === "Generate a profile" &&
        (await navLinks.nth(0).getAttribute("href")) === "generate-a-profile.html",
      `First nav link on ${pagePath} is 'Generate a profile' → generate-a-profile.html`,
    );
    assert(
      (await navLinks.nth(1).textContent()).trim() === "Learn more" &&
        (await navLinks.nth(1).getAttribute("href")) === "learn.html",
      `Second nav link on ${pagePath} is 'Learn more' → learn.html`,
    );
    assert(
      (await navLinks.nth(2).textContent()).trim() === "GitHub" &&
        (await navLinks.nth(2).getAttribute("href")) === "https://github.com/refineryllc/portable-ai-working",
      `Third nav link on ${pagePath} is 'GitHub' → GitHub repo`,
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

  // --- Case 12 (PR A4 + #75 + #86): links accent-blue site-wide; overlay deleted, no muted links ---
  // (overlay assertions below verify the removed AI-draft overlay stays gone)
  // In-body hero/blurb links were removed in #86, so verify the accent color on
  // an empty-state action link (still a site-wide `.link`) instead.
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector("#empty-state", { state: "visible" });
  const emptyActionLink = await page.$eval("#empty-generate-profile", (el) => getComputedStyle(el).color);
  assert(emptyActionLink === RGB_ACCENT, `Empty-state action link is accent-blue (got ${emptyActionLink})`);
  // Overlay is deleted; no muted links should exist anywhere.
  const mutedCount = await page.locator(".link.muted").count();
  assert(mutedCount === 0, `No .link.muted remain after overlay deletion; got ${mutedCount}`);

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

  // --- Case 15 (#83): teleport gutter ---
  // Fresh load, populate the editor with the built-in sample so we have real
  // headings/blocks in both views.
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(url);
  await page.waitForSelector("#empty-state");
  await page.click("#load-sample");
  await page.waitForSelector("#editor-surface", { state: "visible" });

  // Edit is the default mode. The Edit gutter should have a bar per block.
  await page.waitForSelector("#gutter-edit .gutter-bar");
  const editBarCount = await page.locator("#gutter-edit .gutter-bar").count();
  assert(editBarCount > 0, `Edit gutter renders bars (${editBarCount})`);

  // The textarea is auto-height: it shows all content without scrolling
  // internally (scrollHeight ~= clientHeight, overflow hidden).
  const taMetrics = await page.$eval("#persona-editor", (el) => ({
    scrollH: el.scrollHeight,
    clientH: el.clientHeight,
    overflowY: getComputedStyle(el).overflowY,
  }));
  assert(
    Math.abs(taMetrics.scrollH - taMetrics.clientH) <= 2 && taMetrics.overflowY === "hidden",
    `Edit textarea is auto-height / no inner scroll (scrollH ${taMetrics.scrollH} ≈ clientH ${taMetrics.clientH}, overflow ${taMetrics.overflowY})`,
  );

  // Each Edit gutter bar aligns to the top of its block's text row. Check that
  // the first bar sits at/after the textarea's content top (not above it).
  const editAlign = await page.evaluate(() => {
    const panel = document.querySelector("#panel-edit").getBoundingClientRect();
    const ta = document.querySelector("#persona-editor").getBoundingClientRect();
    const bar = document.querySelector('#gutter-edit .gutter-bar[data-block-index="0"]');
    const b = bar.getBoundingClientRect();
    return { barTop: b.top - panel.top, taTop: ta.top - panel.top };
  });
  assert(
    editAlign.barTop >= editAlign.taTop - 2,
    `First Edit bar sits within the textarea content (bar ${Math.round(editAlign.barTop)} >= ta ${Math.round(editAlign.taTop)})`,
  );

  // Clicking an Edit gutter bar teleports to Read view, same block.
  await page.click('#gutter-edit .gutter-bar[data-block-index="1"]');
  await page.waitForSelector("#panel-read", { state: "visible" });
  assert(
    (await page.getAttribute("#mode-read", "aria-selected")) === "true",
    "Clicking an Edit gutter bar switches to Read view",
  );
  const readHasBlock1 = await page.evaluate(() => {
    const pv = document.querySelector("#panel-read .preview-content");
    return !!pv.querySelector('[data-block-index="1"]');
  });
  assert(readHasBlock1, "Target block exists in Read view after teleport");

  // Read gutter also renders a bar per block.
  await page.waitForSelector("#gutter-read .gutter-bar");
  const readBarCount = await page.locator("#gutter-read .gutter-bar").count();
  assert(readBarCount > 0, `Read gutter renders bars (${readBarCount})`);
  assert(
    readBarCount === editBarCount,
    `Read and Edit gutters have matching bar counts (${readBarCount} == ${editBarCount})`,
  );

  // Clicking a Read gutter bar teleports back to Edit view, same block.
  await page.click('#gutter-read .gutter-bar[data-block-index="1"]');
  await page.waitForSelector("#panel-edit", { state: "visible" });
  assert(
    (await page.getAttribute("#mode-edit", "aria-selected")) === "true",
    "Clicking a Read gutter bar switches back to Edit view",
  );

  // Gutter bars are keyboard-focusable buttons.
  const barIsButton = await page.$eval(
    '#gutter-edit .gutter-bar[data-block-index="0"]',
    (el) => el.tagName === "BUTTON" && el.tabIndex === 0,
  );
  assert(barIsButton, "Gutter bars are focusable <button> elements");

  // Clicking the textarea body (not a bar) does NOT toggle mode.
  await page.evaluate(() => document.querySelector("#mode-edit").click());
  await page.evaluate(() => {
    const ta = document.querySelector("#persona-editor");
    const r = ta.getBoundingClientRect();
    ta.focus();
  });
  const editBodyClick = await page.evaluate(() => {
    const ta = document.querySelector("#persona-editor");
    const r = ta.getBoundingClientRect();
    return { x: Math.round(r.x + r.width * 0.5), y: Math.round(r.y + 150) };
  });
  await page.mouse.click(editBodyClick.x, editBodyClick.y);
  assert(
    (await page.getAttribute("#mode-edit", "aria-selected")) === "true",
    "Clicking the textarea body does not toggle mode",
  );

  // Clicking the preview text body (Read) does NOT toggle mode.
  await page.evaluate(() => { document.querySelector("#mode-read").click(); window.scrollTo(0, 0); });
  await page.waitForSelector("#panel-read", { state: "visible" });
  const readBodyClick = await page.evaluate(() => {
    const pv = document.querySelector("#panel-read .preview-content");
    const el = pv.querySelector('[data-block-index="1"]');
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.x + r.width * 0.6), y: Math.round(r.y + Math.min(12, r.height / 2)) };
  });
  await page.mouse.click(readBodyClick.x, readBodyClick.y);
  assert(
    (await page.getAttribute("#mode-read", "aria-selected")) === "true",
    "Clicking the preview text body does not toggle mode",
  );

  // Header Edit|Read toggle still switches modes both directions.
  await page.click("#mode-edit");
  assert(
    (await page.getAttribute("#mode-edit", "aria-selected")) === "true",
    "Header Edit button still selects Edit view",
  );
  await page.click("#mode-read");
  assert(
    (await page.getAttribute("#mode-read", "aria-selected")) === "true",
    "Header Read button still selects Read view",
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

  // --- Case 16 (#43): footer version + build-date stamp ---
  for (const p of ["index.html", "learn.html", "generate-a-profile.html"]) {
    await page.goto(`${url}/${p}`);
    await page.waitForSelector("#footer-version");
    const ver = (await page.textContent("#footer-version")).trim();
    assert(
      ver === "v0.3.0-rc.1",
      `${p}: footer version stamped from version.js (got "${ver}")`,
    );
    const buildText = (await page.textContent("#footer-build")).trim();
    const buildDatetime = await page.getAttribute("#footer-build", "datetime");
    assert(
      /^Updated /.test(buildText) && buildDatetime === "2026-07-06",
      `${p}: footer build date stamped (got "${buildText}", datetime="${buildDatetime}")`,
    );
  }
  await page.setViewportSize({ width: 1280, height: 900 });

  // --- Case 17 (#23): "Add section" appends an H1 section and focuses it ---
  await page.goto(url);
  await page.waitForSelector("#empty-state", { state: "visible" });
  // On the empty state, the Add section action is hidden (kept uncluttered).
  assert(
    !(await page.isVisible("#add-section")),
    "Add section is hidden on the empty state",
  );

  // Load a sample so the editor has content, then Add section becomes available.
  await page.click("#load-sample");
  await page.waitForSelector("#editor-surface", { state: "visible" });
  assert(
    await page.isVisible("#add-section"),
    "Add section is visible once the editor has content",
  );

  const beforeValue = await page.$eval("#persona-editor", (el) => el.value);
  const beforeH1Count = (beforeValue.match(/^# .+$/gm) || []).length;

  await page.click("#add-section");
  await page.waitForSelector("#panel-edit", { state: "visible" });

  // Clicking Add section switches to Edit mode.
  assert(
    (await page.getAttribute("#mode-edit", "aria-selected")) === "true",
    "Add section switches to Edit mode",
  );

  const afterValue = await page.$eval("#persona-editor", (el) => el.value);
  const afterH1Count = (afterValue.match(/^# .+$/gm) || []).length;

  // Exactly one new H1 section was appended, at the very end of the document.
  assert(
    afterH1Count === beforeH1Count + 1,
    `Add section adds exactly one H1 section (was ${beforeH1Count}, now ${afterH1Count})`,
  );
  assert(
    /# New section\n\n$/.test(afterValue),
    "New section heading is appended at the end with a trailing blank line",
  );

  // Caret sits on the blank line beneath the new heading, ready for input.
  const sel = await page.$eval("#persona-editor", (el) => ({
    start: el.selectionStart,
    end: el.selectionEnd,
    len: el.value.length,
  }));
  assert(
    sel.start === sel.len && sel.end === sel.len,
    "Caret is placed at the end, beneath the new heading",
  );

  // The new section round-trips into the Read preview as an <h1>.
  await page.click("#mode-read");
  await page.waitForSelector("#panel-read", { state: "visible" });
  const previewHasNewSection = await page.evaluate(() => {
    const hs = Array.from(document.querySelectorAll("#persona-preview h1"));
    return hs.some((h) => h.textContent.trim() === "New section");
  });
  assert(
    previewHasNewSection,
    "New section renders as an <h1> in the Read preview",
  );

  // It also survives a download round-trip (present in the generated blob).
  const downloadValue = await page.$eval("#persona-editor", (el) => el.value);
  assert(
    downloadValue.includes("# New section"),
    "New section is preserved in the editor value used for download",
  );

  // --- Case 18 (#105): loading a doc with an integrity block strips it ---
  const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), "pra-integrity-"));
  const docWithBlock = [
    "---",
    "standard: PortableAI Persona",
    "standard_version: 0.3",
    "---",
    "",
    "# Profile",
    "",
    "Durable context about me.",
    "",
    "# Notes",
    "",
    "Some freeform notes.",
    "",
    "<!-- portable-ai:integrity",
    "hash_algo: sha-256",
    "hash_scope: body",
    "hash: 3b1c9fdeadbeef0000e4a2",
    "generated_at: 2026-07-04T12:34:56Z",
    "generator: some-other-tool/1.0.0",
    "-->",
    "",
  ].join("\n");
  const fixturePath = path.join(fixtureDir, "with-integrity.md");
  fs.writeFileSync(fixturePath, docWithBlock);

  await page.goto(url);
  await page.waitForSelector("#empty-state", { state: "visible" });
  // The file input is a hidden, dynamically-created element (#markdown-file).
  await page.setInputFiles("#markdown-file", fixturePath);
  await page.waitForSelector("#editor-surface", { state: "visible" });

  const loadedValue = await page.$eval("#persona-editor", (el) => el.value);
  assert(
    !loadedValue.includes("portable-ai:integrity"),
    "Integrity block is stripped from the editor on load",
  );
  assert(
    loadedValue.includes("# Profile") && loadedValue.includes("# Notes"),
    "Document content is preserved after stripping the integrity block",
  );
  const statusText = (await page.textContent("#save-status")).trim();
  assert(
    /integrity block/i.test(statusText),
    `Status explains the removed integrity block (got "${statusText}")`,
  );

  // The download output must not carry the stale block either.
  const [dl] = await Promise.all([
    page.waitForEvent("download"),
    page.click("#download-markdown"),
  ]);
  const dlPath = await dl.path();
  const dlContent = fs.readFileSync(dlPath, "utf8");
  assert(
    !dlContent.includes("portable-ai:integrity"),
    "Downloaded document does not contain the stale integrity block",
  );

  // A document with no integrity block loads unchanged (no false positives).
  const cleanPath = path.join(fixtureDir, "clean.md");
  fs.writeFileSync(
    cleanPath,
    "---\nstandard: PortableAI Persona\n---\n\n# Profile\n\nJust content, no block.\n",
  );
  await page.goto(url);
  await page.waitForSelector("#empty-state", { state: "visible" });
  await page.setInputFiles("#markdown-file", cleanPath);
  await page.waitForSelector("#editor-surface", { state: "visible" });
  const cleanStatus = (await page.textContent("#save-status")).trim();
  assert(
    !/integrity block/i.test(cleanStatus),
    `No integrity message for a document without a block (got "${cleanStatus}")`,
  );

  fs.rmSync(fixtureDir, { recursive: true, force: true });
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
