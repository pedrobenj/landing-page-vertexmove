import { expect, test } from "@playwright/test"

// O playwright.config desliga as animações; aqui elas rodam de verdade.
test.use({ contextOptions: { reducedMotion: "no-preference" } })

test.describe("Animações da home", () => {
  test("o título do hero termina visível e o contador chega ao valor final", async ({ page }) => {
    await page.goto("/")

    const title = page.getByRole("heading", { level: 1, name: "Corra. Conecte-se. Evolua." })
    await expect(title).toBeVisible()
    // Cada palavra termina nítida, no lugar e opaca.
    const words = title.locator("[data-motion]")
    await expect(words).toHaveCount(3)
    for (const word of await words.all()) {
      await expect(word).toHaveCSS("opacity", "1")
      await expect(word).toHaveCSS("filter", /^(none|blur\(0px\))$/)
    }

    const stats = page.getByRole("region", { name: "Números da comunidade" })
    await stats.scrollIntoViewIfNeeded()
    const participants = stats.getByRole("listitem").filter({ hasText: "participantes" }).locator("[aria-hidden='true']")
    await expect(participants).toHaveText("3.500+", { timeout: 10_000 })
    await expect(stats.getByRole("listitem").first()).toHaveCSS("opacity", "1")
  })
})
