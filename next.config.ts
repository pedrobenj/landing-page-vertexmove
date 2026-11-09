import type { NextConfig } from "next";

/**
 * Páginas onde o atleta digita ou vê dados pessoais: nenhum Referer sai daqui para links externos
 * (regulamento em PDF, WhatsApp, corridas parceiras) — §12 do CLAUDE.md.
 */
const NO_REFERRER_PATHS = ["/corridas/:slug/inscricao", "/inscricao/:path*", "/consulta"]

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Capas e fotos vêm da API (`imagemCapaUrl`, `fotos[].url`) e de logos de parceiros.
    // TODO: restringir ao hostname do CDN/storage quando o backend definir onde as imagens ficam.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async headers() {
    return NO_REFERRER_PATHS.map((source) => ({
      source,
      headers: [{ key: "Referrer-Policy", value: "no-referrer" }],
    }))
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
