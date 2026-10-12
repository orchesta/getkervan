// `node scripts/site/og-mark.mjs`: draws the logo (site/static/favicon.svg) as a PNG for the Open
// Graph images (site/assets/og/mark.png, 88x88). Hugo composes those images at build time and
// cannot read SVG; run this again whenever the logo changes.
import { readFileSync, writeFileSync } from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
export const MARK_SIZE = 88

/** The logo as PNG bytes, drawn by Chromium. */
export async function drawMark() {
  const require = createRequire(path.join(root, "package.json"))
  const { chromium } = require("@playwright/test")
  const svg = readFileSync(path.join(root, "site", "static", "favicon.svg"), "utf8")
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage({ viewport: { width: MARK_SIZE, height: MARK_SIZE } })
    await page.setContent(
      `<body style="margin:0">${svg.replace("<svg ", `<svg width="${MARK_SIZE}" height="${MARK_SIZE}" style="display:block" `)}`,
    )
    return await page.screenshot({ omitBackground: true })
  } finally {
    await browser.close()
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const file = path.join(root, "site", "assets", "og", "mark.png")
  writeFileSync(file, await drawMark())
  console.log(`wrote ${path.relative(root, file)}`)
}
