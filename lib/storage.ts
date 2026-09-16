// lib/storage.ts
// Camada de persistência usando localStorage.
// Quando migrar para um banco real, basta trocar as implementações destas
// funções por chamadas de API (fetch) mantendo a mesma "assinatura".

const KEYS = {
  pontosRede: "inv:pontosRede",
  patchPanels: "inv:patchPanels",
  switches: "inv:switches",
  testes: "inv:testes",
  maquinas: "inv:maquinas",
} as const;

function readAll<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function writeAll<T>(key: string, items: T[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(items));
}

function genId(): string {
  return crypto.randomUUID();
}

export function createGenericStore<T extends { id: string }>(key: string) {
  return {
    list(): T[] {
      return readAll<T>(key);
    },
    get(id: string): T | undefined {
      return readAll<T>(key).find((i) => i.id === id);
    },
    create(item: Omit<T, "id">): T {
      const items = readAll<T>(key);
      const newItem = { ...item, id: genId() } as T;
      items.push(newItem);
      writeAll(key, items);
      return newItem;
    },
    update(id: string, patch: Partial<T>): T | undefined {
      const items = readAll<T>(key);
      const idx = items.findIndex((i) => i.id === id);
      if (idx === -1) return undefined;
      items[idx] = { ...items[idx], ...patch };
      writeAll(key, items);
      return items[idx];
    },
    remove(id: string): void {
      const items = readAll<T>(key).filter((i) => i.id !== id);
      writeAll(key, items);
    },
  };
}

import type {
  PontoRede,
  PatchPanel,
  SwitchEquip,
  TesteCertificacao,
  Maquina,
} from "./types";

export const pontosRedeStore = createGenericStore<PontoRede>(KEYS.pontosRede);
export const patchPanelsStore = createGenericStore<PatchPanel>(
  KEYS.patchPanels
);
export const switchesStore = createGenericStore<SwitchEquip>(KEYS.switches);
export const testesStore = createGenericStore<TesteCertificacao>(KEYS.testes);
export const maquinasStore = createGenericStore<Maquina>(KEYS.maquinas);
