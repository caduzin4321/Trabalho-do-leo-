export interface Sala {
  id: string;
  nome: string;
  bloco?: string;
  descricao?: string;
  criadoEm: string;
}

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

export const salasStore = {
  list(): Sala[] {
    return readAll().sort((a, b) => a.nome.localeCompare(b.nome));
  },
  criar(dados: { nome: string; bloco?: string; descricao?: string }): Sala {
    const items = readAll();
    const nova: Sala = {
      id: crypto.randomUUID(),
      nome: dados.nome,
      bloco: dados.bloco,
      descricao: dados.descricao,
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