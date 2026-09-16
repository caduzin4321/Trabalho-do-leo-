// lib/etiquetas.ts
//
// Gerador de código de etiqueta. A "nomenclatura" é um padrão com placeholders
// que a equipe define, por exemplo:
//   "{BLOCO}-{SALA}-PT{SEQ}"        -> "A-101-PT03"
//   "{LOCAL}.{PATCHPANEL}.{PORTA}"  -> "SALA101.PP01.12"
//
// Placeholders suportados: {BLOCO} {SALA} {LOCAL} {PATCHPANEL} {PORTA} {SEQ}
// {SEQ} é preenchido automaticamente com um número sequencial (com zero à esquerda).

export interface DadosEtiqueta {
  bloco?: string;
  sala?: string;
  local?: string;
  patchPanel?: string;
  porta?: string | number;
  seq: number;
  seqDigitos?: number; // quantidade de dígitos do sequencial, padrão 2
}

export function gerarCodigoEtiqueta(
  padrao: string,
  dados: DadosEtiqueta
): string {
  const seqStr = String(dados.seq).padStart(dados.seqDigitos ?? 2, "0");

  return padrao
    .replaceAll("{BLOCO}", (dados.bloco ?? "").toUpperCase())
    .replaceAll("{SALA}", (dados.sala ?? "").toUpperCase())
    .replaceAll("{LOCAL}", (dados.local ?? "").toUpperCase())
    .replaceAll("{PATCHPANEL}", (dados.patchPanel ?? "").toUpperCase())
    .replaceAll("{PORTA}", String(dados.porta ?? ""))
    .replaceAll("{SEQ}", seqStr);
}

export const PADRAO_PADRAO = "{BLOCO}-{SALA}-PT{SEQ}";
