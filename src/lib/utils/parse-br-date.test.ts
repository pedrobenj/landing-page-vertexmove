import { describe, expect, it } from "vitest"

import { parseBrDate } from "./parse-br-date"

describe("parseBrDate", () => {
  it("lê DD/MM/AAAA como data local", () => {
    expect(parseBrDate("06/12/1990")).toEqual(new Date(1990, 11, 6))
  })

  it("recusa datas inexistentes e formatos incompletos", () => {
    expect(parseBrDate("31/02/1990")).toBeNull()
    expect(parseBrDate("6/12/1990")).toBeNull()
    expect(parseBrDate("06/12/90")).toBeNull()
    expect(parseBrDate("")).toBeNull()
  })
})
