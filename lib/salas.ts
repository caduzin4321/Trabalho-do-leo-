
export interface Sala {
  id: string;
  nome: string;
  desc: string;
  slug: string;
  criadoEm: string;
}

export type SalaSlug = string;

const KEY = "app:salas";

function readAll(): Sala[] {
  if (typeof window === "undefined") return [];

  const raw = window.localStorage.getItem(KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as Sala[];
  } catch {
    return [];
  }
}

function writeAll(items: Sala[]) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(KEY, JSON.stringify(items));
}

export function getSala(slug: SalaSlug): Sala | undefined {
  return readAll().find(
    (sala) =>
      sala.id === slug ||
      sala.nome.toLowerCase().replace(/\s+/g, "-") ===
        slug.toLowerCase()
  );
}

export const salasStore = {
  list(): Sala[] {
    return readAll().sort((a, b) =>
      a.nome.localeCompare(b.nome)
    );
  },

  criar(nome: string): Sala {
    const items = readAll();

    const nova: Sala = {
      id: crypto.randomUUID(),
      nome,
      desc: "",
      slug: nome
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-"),
      criadoEm: new Date().toISOString(),
    };

    items.push(nova);
    writeAll(items);

    return nova;
  },

  remover(id: string) {
    const items = readAll().filter((s) => s.id !== id);
    writeAll(items);
  },
};