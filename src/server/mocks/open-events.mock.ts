import type { OpenEvent } from "@/server/services/event.service"

/**
 * Corridas fictícias para desenvolver o front sem banco de dados.
 * Ativadas com USE_MOCK_DATA=true no .env — nunca em produção.
 */
export const OPEN_EVENTS_MOCK: OpenEvent[] = [
  {
    id: "mock-event-1",
    slug: "corrida-vertex-beira-mar-2026",
    name: "Corrida Vertex Beira-Mar 2026",
    date: new Date("2026-12-06T12:00:00Z"),
    startTime: "05:30",
    location: "Aterrinho da Praia de Iracema",
    bannerUrl: null,
    modalities: [
      { id: "mock-mod-1a", name: "5 km" },
      { id: "mock-mod-1b", name: "10 km" },
      { id: "mock-mod-1c", name: "Caminhada 3 km" },
    ],
  },
  {
    id: "mock-event-2",
    slug: "night-run-vertex-aterro",
    name: "Night Run Vertex",
    date: new Date("2027-01-23T12:00:00Z"),
    startTime: "19:00",
    location: "Aterro da Praia de Iracema",
    bannerUrl: null,
    modalities: [
      { id: "mock-mod-2a", name: "5 km" },
      { id: "mock-mod-2b", name: "10 km" },
    ],
  },
  {
    id: "mock-event-3",
    slug: "desafio-vertex-parque-do-coco",
    name: "Desafio Vertex Parque do Cocó",
    date: new Date("2027-03-14T12:00:00Z"),
    startTime: "06:00",
    location: "Parque Estadual do Cocó",
    bannerUrl: null,
    modalities: [
      { id: "mock-mod-3a", name: "7 km" },
      { id: "mock-mod-3b", name: "15 km" },
    ],
  },
]
