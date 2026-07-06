// Smoke test: load the enriched template via Playwright, verify
// - Form tab shows a read-only metadata card (no input elements for FM keys)
// - Card contains rows for each of the 5 well-known front-matter keys
// - Editing an input in the Markdown tab still round-trips to the metadata card
// - Section textareas still work (edit → serialize back)

import { chromium } from 'playwright';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { pathToFileURL, fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const site = resolve(__dirname, '..', 'website');
const templatePath = resolve(__dirname, '..', 'templates', 'portable-ai-persona-template.md');
const templateMd = readFileSync(templatePath, 'utf8');

function assert(cond, msg) {
  if (!cond) { console.error('FAIL:', msg); process.exitCode = 1; }
  else console.log('ok:', msg);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 2000 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

await page.goto(pathToFileURL(resolve(site, 'index.html')).href);
await page.waitForSelector('#persona-editor', { state: 'attached' });

// Load the template via the "New from Template" button (we simulate a click
// after clearing localStorage-driven auto-restore).
await page.evaluate(() => {
  try { localStorage.removeItem('portableAiPersonaDraft'); } catch {}
  document.querySelector('#persona-editor').value = '';
  document.querySelector('#persona-editor').dispatchEvent(new Event('input', { bubbles: true }));
});
// Bypass confirm() so the button doesn't prompt when the editor is empty.
await page.evaluate(() => { window.confirm = () => true; });
await page.click('#new-from-template');
await page.waitForTimeout(200);

// The canonical Markdown should equal the template file byte-for-byte.
const editorValue = await page.evaluate(() => document.querySelector('#persona-editor').value);
assert(editorValue === templateMd, 'canonical Markdown equals template file');

// Form tab is default. Check the metadata card is present + read-only.
await page.click('#tab-form');
await page.waitForTimeout(100);

const formMetadata = await page.evaluate(() => {
  const card = document.querySelector('#panel-form .metadata-card--form');
  if (!card) return null;
  const rows = [...card.querySelectorAll('dl > dt')].map((dt) => ({
    key: dt.textContent,
    value: dt.nextElementSibling?.textContent ?? '',
  }));
  // Any inputs in the form-metadata region?
  const inputs = card.querySelectorAll('input, textarea');
  return { rows, inputCount: inputs.length, hint: card.querySelector('.metadata-card-hint')?.textContent ?? '' };
});
assert(formMetadata !== null, 'form has a metadata-card--form element');
assert(formMetadata.inputCount === 0, 'form metadata card has zero editable inputs');
assert(formMetadata.rows.length === 5, 'form metadata card shows 5 rows');
const keys = formMetadata.rows.map(r => r.key);
for (const expected of ['Standard', 'Standard version', 'Profile name', 'Profile version', 'Last updated']) {
  assert(keys.includes(expected), `metadata row present: ${expected}`);
}
assert(formMetadata.hint.length > 0, 'metadata hint text present');

// Edit profile_name in Markdown, expect Form metadata card to update.
await page.click('#tab-markdown');
await page.evaluate(() => {
  const t = document.querySelector('#persona-editor');
  t.value = t.value.replace('My PortableAI Persona', 'Dave test persona');
  t.dispatchEvent(new Event('input', { bubbles: true }));
});
await page.click('#tab-form');
await page.waitForTimeout(100);
const updated = await page.evaluate(() => {
  const rows = [...document.querySelectorAll('#panel-form .metadata-card--form dl dt')];
  const nameDt = rows.find(dt => dt.textContent === 'Profile name');
  return nameDt?.nextElementSibling?.textContent ?? null;
});
assert(updated === 'Dave test persona', `Markdown edits propagate to Form metadata card (got: ${updated})`);

// Section textareas still work — edit Interests and confirm it round-trips.
await page.evaluate(() => {
  const ta = document.querySelector('#section-interests');
  ta.focus();
  ta.value = ta.value + '\n- e.g. New interest added by test';
  ta.dispatchEvent(new Event('input', { bubbles: true }));
});
await page.waitForTimeout(50);
const roundTripped = await page.evaluate(() => document.querySelector('#persona-editor').value);
assert(roundTripped.includes('New interest added by test'), 'section edit round-trips to canonical Markdown');

// Preview tab shows the same metadata card (existing behavior).
await page.click('#tab-preview');
await page.waitForTimeout(100);
const previewMeta = await page.evaluate(() => {
  const card = document.querySelector('#panel-preview .metadata-card');
  return card ? { visible: !card.hidden, rowCount: card.querySelectorAll('dl dt').length } : null;
});
assert(previewMeta && previewMeta.visible, 'preview metadata card visible');
assert(previewMeta && previewMeta.rowCount === 5, 'preview metadata card has 5 rows');

// No console errors during smoke run.
assert(errors.length === 0, `no console/page errors (got ${errors.length}: ${errors.join(' | ')})`);

await browser.close();
if (process.exitCode) process.exit(process.exitCode);
console.log('\nAll smoke assertions passed.');
