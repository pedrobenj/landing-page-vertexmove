import { expect, test } from "@playwright/test"

import type { ApiPublicEventDetail } from "../../src/types/api/api-event-detail.interface"
import type { CursorPage } from "../../src/types/api/cursor-page.interface"
import type { PublicEvent } from "../../src/types/api/event.interface"
import type { PartnerRace } from "../../src/types/api/partner-race.interface"
import { getFromApi } from "./real-api"

// Só contra o backend real (`npm run test:e2e:real`): a tela tem que mostrar o que a API devolve,
// sem depender de nomes ou contagens do banco de dev.

test.describe("Catálogo público contra o backend real", () => {
  test("home lista as corridas abertas de GET /eventos", async ({ page, request }) => {
    const events = (await getFromApi<CursorPage<PublicEvent>>(request, "/eventos?limit=50"))!.items
    await page.goto("/")
    const section = page.locator("#corridas")
    if (events.length === 0) {
      await expect(section.getByRole("article")).toHaveCount(0)
      return
    }
    await expect(section.getByText(new RegExp(`^${events.length} corridas? abertas?$`))).toBeVisible()
    const hrefs = await section.getByRole("link", { name: /^Inscrever-se em / }).evaluateAll((links) =>
      links.map((link) => link.getAttribute("href")),
    )
    expect(new Set(hrefs)).toEqual(new Set(events.map((event) => `/corridas/${event.slug}`)))
  })

  test("página da corrida mostra o detalhe de GET /eventos/:slug (distâncias, kits e retirada do kit)", async ({ page, request }) => {
    const events = (await getFromApi<CursorPage<PublicEvent>>(request, "/eventos?limit=50"))!.items
    test.skip(events.length === 0, "nenhuma corrida publicada no banco de dev")
    // Prefere uma corrida com retirada do kit cadastrada, para cobrir o bloco.
    const details = await Promise.all(
      events.map((event) => getFromApi<ApiPublicEventDetail>(request, `/eventos/${event.slug}`)),
    )
    const detail = details.find((item) => item?.retiradaKit) ?? details.find((item) => item !== null)!

    await page.goto(`/corridas/${detail.slug}`)
    await expect(page.getByRole("heading", { level: 1, name: detail.nome })).toBeVisible()
    const distances = page.getByRole("region", { name: "Escolha sua distância" })
    await expect(distances.getByRole("article")).toHaveCount(detail.distancias?.length ?? 0)
    if (detail.kits && detail.kits.length > 0) {
      await expect(page.getByRole("region", { name: "Escolha seu kit" }).getByRole("article")).toHaveCount(detail.kits.length)
    }
    const pickup = page.getByRole("region", { name: "Retirada do kit" })
    if (detail.retiradaKit?.local) await expect(pickup.getByText(detail.retiradaKit.local)).toBeVisible()
    else if (!detail.retiradaKit) await expect(pickup).toHaveCount(0)
  })

  test("corridas encerradas lista GET /eventos/encerrados", async ({ page, request }) => {
    const past = (await getFromApi<CursorPage<PublicEvent>>(request, "/eventos/encerrados?limit=50"))!.items
    await page.goto("/corridas/encerradas")
    if (past.length === 0) {
      await expect(page.getByText("Os topos conquistados chegam em breve.")).toBeVisible()
      return
    }
    // A lista fica até 5 min em cache no Next (SLOW_LIST_CACHE_LIFE): o banco de dev muda durante a suíte
    // (specs do backend criam corridas), então confere que cada card mostrado veio da API, não a contagem.
    const names = new Set(past.map((event) => event.nome))
    const shown = await page.getByRole("list", { name: "Edições passadas" }).getByRole("article").getByRole("heading").allTextContents()
    expect(shown.length).toBeGreaterThan(0)
    for (const name of shown) expect(names.has(name.trim()), `"${name}" não está em GET /eventos/encerrados`).toBe(true)
  })

  test("corridas parceiras lista GET /corridas-parceiras", async ({ page, request }) => {
    const races = await getFromApi<PartnerRace[]>(request, "/corridas-parceiras")
    test.skip(races === null, "backend ainda sem GET /corridas-parceiras")
    await page.goto("/corridas-parceiras")
    const cards = page.getByRole("main").getByRole("article")
    await expect(cards).toHaveCount(races!.length)
    for (const race of races!) {
      await expect(cards.filter({ hasText: race.nome }).getByText(race.cupom, { exact: true })).toBeVisible()
    }
  })
})
