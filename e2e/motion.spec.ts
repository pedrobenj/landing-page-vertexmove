import { expect, test } from "@playwright/test"

// O playwright.config desliga as animações; aqui elas rodam de verdade.
test.use({ contextOptions: { reducedMotion: "no-preference" } })

test.describe("Animações da home", () => {
  test("o título do hero termina visível e o contador chega ao valor final", async ({ page }) => {
    await page.goto("/")

    // O H1 é o nome da próxima corrida (varia com as corridas publicadas): confere só a animação.
    // `:has([data-motion])` ignora o H1 do skeleton, que aparece antes do streaming.
    const title = page.locator("h1:has([data-motion])")
    await expect(title).toBeVisible()
    // Cada palavra termina nítida, no lugar e opaca.
    const words = title.locator("[data-motion]")
    await expect(words.first()).toBeVisible()
    for (const word of await words.all()) {
      await expect(word).toHaveCSS("opacity", "1")
      await expect(word).toHaveCSS("filter", /^(none|blur\(0px\))$/)
    }

    const stats = page.getByRole("list", { name: "Números da comunidade" })
    await stats.scrollIntoViewIfNeeded()
    const participants = stats.getByRole("listitem").filter({ hasText: "participantes" }).locator("[aria-hidden='true']")
    await expect(participants).toHaveText("3.500+", { timeout: 10_000 })
    await expect(stats.getByRole("listitem").first()).toHaveCSS("opacity", "1")
  })
})
