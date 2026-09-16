export type SalaSlug =
  | "equipamentos"
  | "secretaria"
  | "lei1"
  | "lei2"
  | "hardware";

export interface SalaInfo {
  slug: SalaSlug;
  nome: string;
  desc: string;
}

export const SALAS: SalaInfo[] = [
  {
    slug: "equipamentos",
    nome: "Sala de Equipamentos",
    desc: "Rack central, servidores, patch panels e switches.",
  },
  {
    slug: "secretaria",
    nome: "Secretaria",
    desc: "Estações administrativas e impressoras.",
  },
  {
    slug: "lei1",
    nome: "LEI 1",
    desc: "Laboratório de Informática 1.",
  },
  {
    slug: "lei2",
    nome: "LEI 2",
    desc: "Laboratório de Informática 2.",
  },
  {
    slug: "hardware",
    nome: "Hardware",
    desc: "Sala de manutenção e bancada de hardware.",
  },
];

export function getSala(slug: string): SalaInfo | undefined {
  return SALAS.find((s) => s.slug === slug);
}
