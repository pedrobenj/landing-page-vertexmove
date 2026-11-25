import { describe, expect, it, vi } from "vitest"

const contact = vi.hoisted(() => ({ whatsappNumber: "+55 (85) 99999-0000", email: "contato@vertex.example" }))
vi.mock("./contact-info", () => ({ CONTACT_INFO: contact }))

const { getConnectionsContactHref } = await import("./connections-contact")

describe("getConnectionsContactHref", () => {
  it("abre o WhatsApp com a mensagem pronta das Conexões", () => {
    contact.whatsappNumber = "+55 (85) 99999-0000"
    const href = getConnectionsContactHref()
    expect(href.startsWith("https://wa.me/5585999990000?text=")).toBe(true)
    expect(decodeURIComponent(href.split("text=")[1]!)).toContain("Conexões")
  })

  it("sem WhatsApp configurado, cai no e-mail", () => {
    contact.whatsappNumber = ""
    expect(getConnectionsContactHref()).toBe(
      `mailto:contato@vertex.example?subject=${encodeURIComponent("Conexões de sábado")}`,
    )
  })
})
