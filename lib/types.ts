import type { SalaSlug } from "./salas";

export type CategoriaCabo = "Cat5e" | "Cat6" | "Cat6A" | "Cat7";

export interface PontoRede {
  id: string; // gerado automaticamente
  codigo: string; // ex: gerado pelo módulo de etiquetas (ex: SALA101-PT01)
  sala?: SalaSlug; // espaço físico ao qual este ponto pertence
  local: string; // ex: "Sala 101", "Laboratório 3"
  ambiente?: string; // ex: "Bloco A - 1º andar"
  patchPanelId: string; // referência ao PatchPanel.id
  portaPatchPanel: number; // número da porta no patch panel
  switchId: string; // referência ao Switch.id
  portaSwitch: number; // número da porta no switch
  categoriaCabo: CategoriaCabo;
  comprimentoMetros: number;
  observacoes?: string;
  criadoEm: string; // ISO date
}

export interface PatchPanel {
  id: string;
  codigo: string; // ex: "PP-RACK1-01"
  local: string; // ex: "Rack 1 - Sala Técnica"
  totalPortas: number;
}

export interface SwitchEquip {
  id: string;
  codigo: string; // ex: "SW-RACK1-01"
  local: string;
  totalPortas: number;
  modelo?: string;
}

export interface TesteCertificacao {
  id: string;
  pontoRedeId: string; // referência ao PontoRede.id
  categoriaCabo: CategoriaCabo;
  dataTeste: string; // ISO date
  comprimentoMedidoM: number;
  perdaInsercaoDb: number; // Attenuation / Insertion Loss (menor = melhor, tem limite máximo)
  nextDb: number; // NEXT (maior = melhor, tem limite mínimo)
  returnLossDb: number; // Return Loss (maior = melhor, tem limite mínimo)
  resultado: "PASS" | "FAIL";
  detalhesFalha?: string[]; // lista de critérios que falharam
  testadoPor?: string;
}

export type TipoMaquina =
  | "Desktop"
  | "Notebook"
  | "Servidor"
  | "Impressora"
  | "Outro";

export interface Maquina {
  id: string;
  codigo: string; // nome/identificação da máquina, ex: "PC-SEC-01"
  sala: SalaSlug;
  tipo: TipoMaquina;
  patrimonio?: string;
  ip?: string;
  pontoRedeId?: string; // referência opcional ao PontoRede.id ao qual está conectada
  observacoes?: string;
  criadoEm: string; // ISO date
}
