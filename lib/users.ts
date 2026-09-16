export interface Usuario {
  id: string;
  nomeUsuario: string;
  senha: string;
  criadoEm: string;
  isAdmin: boolean;
}

export interface Sessao {
  id: string;
  nomeUsuario: string;
  isAdmin: boolean;
}

const KEY = "auth:usuarios";
const SESSION_KEY = "auth:sessao";

function readAll(): Usuario[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const items = JSON.parse(raw) as Usuario[];
    // Migração: corrige usuários antigos que não tinham o campo isAdmin
    let precisaSalvar = false;
    items.forEach((u, i) => {
      if (u.isAdmin === undefined) {
        u.isAdmin = i === 0; // o primeiro da lista vira admin
        precisaSalvar = true;
      }
    });
    if (precisaSalvar) writeAll(items);
    return items;
  } catch {
    return [];
  }
}

function writeAll(items: Usuario[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(items));
}

export const usuariosStore = {
  list(): Usuario[] {
    return readAll();
  },
  existe(nomeUsuario: string): boolean {
    return readAll().some(
      (u) => u.nomeUsuario.toLowerCase() === nomeUsuario.toLowerCase()
    );
  },
  criar(nomeUsuario: string, senha: string): Usuario {
    const items = readAll();
    const novo: Usuario = {
      id: crypto.randomUUID(),
      nomeUsuario,
      senha,
      criadoEm: new Date().toISOString(),
      isAdmin: items.length === 0,
    };
    items.push(novo);
    writeAll(items);
    return novo;
  },
  autenticar(nomeUsuario: string, senha: string): Usuario | null {
    const usuario = readAll().find(
      (u) =>
        u.nomeUsuario.toLowerCase() === nomeUsuario.toLowerCase() &&
        u.senha === senha
    );
    return usuario ?? null;
  },
  remover(id: string) {
    const items = readAll().filter((u) => u.id !== id);
    writeAll(items);
  },
};

export const sessaoStore = {
  set(usuario: Usuario) {
    if (typeof window === "undefined") return;
    const sessao: Sessao = {
      id: usuario.id,
      nomeUsuario: usuario.nomeUsuario,
      isAdmin: usuario.isAdmin,
    };
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(sessao));
  },
  get(): Sessao | null {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Sessao;
    } catch {
      return null;
    }
  },
  clear() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(SESSION_KEY);
  },
};
