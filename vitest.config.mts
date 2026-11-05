import { fileURLToPath } from "node:url"

import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      "server-only": fileURLToPath(new URL("./src/test/server-only-stub.ts", import.meta.url)),
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
    // Node 25+ expõe um localStorage global (Web Storage experimental) que sobrepõe o do jsdom.
    execArgv: ["--no-experimental-webstorage"],
  },
})
