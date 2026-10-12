// The logo is one drawing in every place: the website's favicon (the source), Studio's mark and
// tab icon, and the Open Graph images' PNG. Its camel is "Camel" by Delapouite under CC BY 3.0,
// which asks for the credit wherever the logo shows: each place that shows it names the author
// and the license. (The website's pages are checked by check:site, see site-build.test.ts.)
import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const root = path.join(import.meta.dirname, "..", "..")
const read = (file: string) => readFileSync(path.join(root, file), "utf8")
const AUTHOR = "Delapouite"
const WORK = "https://game-icons.net/1x1/delapouite/camel.html"
const LICENSE = "https://creativecommons.org/licenses/by/3.0/"

const favicon = read("site/static/favicon.svg")
const drawing = / d="([^"]+)"/.exec(favicon)?.[1] ?? ""

describe("the logo", () => {
  it("names its author, the work and the license in the file itself", () => {
    expect(drawing.length).toBeGreaterThan(100)
    for (const text of [AUTHOR, WORK, LICENSE]) expect(favicon).toContain(text)
  })

  it("is the same drawing in Studio, with the credit in a component both layouts show", () => {
    const mark = read("apps/studio/web/src/ui/BrandMark.tsx")
    expect(mark).toContain(`"${drawing}"`)
    const credit = mark.slice(mark.indexOf("export function LogoCredit"))
    for (const text of [AUTHOR, WORK, LICENSE]) expect(credit, text).toContain(text)
    // The signed-in layout and the signed-out pages: the mark, and the credit with it.
    for (const file of [
      "apps/studio/web/src/shell/AppShell.tsx",
      "apps/studio/web/src/pages/Auth.tsx",
    ]) {
      const source = read(file)
      expect(source, file).toContain("<BrandMark")
      expect(source, file).toContain("<LogoCredit")
      // The letter the camel replaced.
      expect(source, file).not.toMatch(/>\s*K\s*</)
    }
  })

  it("is Studio's tab icon, inline", () => {
    const plain = favicon.replace(/<!--[\s\S]*?-->\n?/, "").replace(/\n/g, "")
    for (const file of ["apps/studio/web/index.html", "apps/studio/web/styleguide.html"]) {
      const href = /<link rel="icon"[^>]* href="(data:image\/svg\+xml,[^"]+)"/.exec(read(file))?.[1]
      expect(href, file).toBeDefined()
      expect(decodeURIComponent((href ?? "").slice("data:image/svg+xml,".length)), file).toBe(plain)
    }
  })

  it("is credited in the README, which says it is not under the MIT license", () => {
    const readme = read("README.md")
    for (const text of [AUTHOR, WORK, LICENSE, "not under the MIT license"])
      expect(readme).toContain(text)
  })

  it("is credited on the Open Graph images, which draw it from a PNG of the favicon", () => {
    const partial = read("site/layouts/_partials/og-image.html")
    expect(partial).toContain('resources.Get "og/mark.png"')
    expect(partial).toContain(`Logo: Camel by ${AUTHOR}, CC BY 3.0`)
  })
})
