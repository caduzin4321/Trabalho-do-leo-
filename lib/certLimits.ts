// lib/certLimits.ts
//
// ATENÇÃO: os valores abaixo são valores de REFERÊNCIA aproximados, baseados
// nos limites de canal (channel) da norma ANSI/TIA-568-C.2 para fins didáticos.
// Confirme com seu professor qual norma exata deve ser usada (TIA-568,
// ISO/IEC 11801 ou ABNT NBR 14565) e ajuste os números se necessário —
// é só editar a tabela abaixo, o resto do sistema não precisa mudar.

import type { CategoriaCabo } from "./types";

export interface LimiteNorma {
  comprimentoMaximoM: number; // limite máximo de comprimento do canal
  perdaInsercaoMaxDb: number; // Insertion Loss / Attenuation: quanto MENOR, melhor (limite é um teto)
  nextMinDb: number; // NEXT: quanto MAIOR, melhor (limite é um piso)
  returnLossMinDb: number; // Return Loss: quanto MAIOR, melhor (limite é um piso)
}

export const LIMITES_POR_CATEGORIA: Record<CategoriaCabo, LimiteNorma> = {
  Cat5e: {
    comprimentoMaximoM: 100,
    perdaInsercaoMaxDb: 24.0,
    nextMinDb: 30.1,
    returnLossMinDb: 10.0,
  },
  Cat6: {
    comprimentoMaximoM: 100,
    perdaInsercaoMaxDb: 21.3,
    nextMinDb: 33.1,
    returnLossMinDb: 12.0,
  },
  Cat6A: {
    comprimentoMaximoM: 100,
    perdaInsercaoMaxDb: 20.9,
    nextMinDb: 26.1,
    returnLossMinDb: 8.0,
  },
  Cat7: {
    comprimentoMaximoM: 100,
    perdaInsercaoMaxDb: 20.0,
    nextMinDb: 39.9,
    returnLossMinDb: 8.0,
  },
};

export interface EntradaTeste {
  categoriaCabo: CategoriaCabo;
  comprimentoMedidoM: number;
  perdaInsercaoDb: number;
  nextDb: number;
  returnLossDb: number;
}

export interface ResultadoValidacao {
  resultado: "PASS" | "FAIL";
  detalhesFalha: string[];
}

export function validarTeste(entrada: EntradaTeste): ResultadoValidacao {
  const limite = LIMITES_POR_CATEGORIA[entrada.categoriaCabo];
  const falhas: string[] = [];

  if (entrada.comprimentoMedidoM > limite.comprimentoMaximoM) {
    falhas.push(
      `Comprimento (${entrada.comprimentoMedidoM}m) excede o máximo de ${limite.comprimentoMaximoM}m`
    );
  }
  if (entrada.perdaInsercaoDb > limite.perdaInsercaoMaxDb) {
    falhas.push(
      `Perda de Inserção (${entrada.perdaInsercaoDb}dB) acima do limite de ${limite.perdaInsercaoMaxDb}dB`
    );
  }
  if (entrada.nextDb < limite.nextMinDb) {
    falhas.push(
      `NEXT (${entrada.nextDb}dB) abaixo do mínimo de ${limite.nextMinDb}dB`
    );
  }
  if (entrada.returnLossDb < limite.returnLossMinDb) {
    falhas.push(
      `Return Loss (${entrada.returnLossDb}dB) abaixo do mínimo de ${limite.returnLossMinDb}dB`
    );
  }

  return {
    resultado: falhas.length === 0 ? "PASS" : "FAIL",
    detalhesFalha: falhas,
  };
}
