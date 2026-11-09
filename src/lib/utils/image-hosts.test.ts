import { describe, expect, it } from "vitest"

import { areValidImageHosts, parseImageHosts } from "./image-hosts"

describe("image hosts", () => {
  it("separa por vírgula, normaliza e descarta vazios", () => {
    expect(parseImageHosts(" CDN.vertex.com.br, **.cloudfront.net ,,")).toEqual(["cdn.vertex.com.br", "**.cloudfront.net"])
    expect(parseImageHosts(undefined)).toEqual([])
    expect(parseImageHosts("")).toEqual([])
  })

  it("valida hosts e curingas de subdomínio", () => {
    expect(areValidImageHosts(["cdn.vertex.com.br", "*.example.com", "**.cloudfront.net"])).toBe(true)
    expect(areValidImageHosts(["**"])).toBe(false)
    expect(areValidImageHosts(["https://cdn.vertex.com.br"])).toBe(false)
    expect(areValidImageHosts(["cdn.vertex.com.br/fotos"])).toBe(false)
    expect(areValidImageHosts([])).toBe(true)
  })
})
