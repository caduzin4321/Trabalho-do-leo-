"use client";

import { useState } from "react";
import { gerarCodigoEtiqueta, PADRAO_PADRAO } from "@/lib/etiquetas";
import { Input, Button, Card, Label } from "@/components/ui";

export default function EtiquetasPage() {
  const [padrao, setPadrao] = useState(PADRAO_PADRAO);
  const [bloco, setBloco] = useState("A");
  const [sala, setSala] = useState("101");
  const [patchPanel, setPatchPanel] = useState("PP01");
  const [porta, setPorta] = useState("1");
  const [seqInicial, setSeqInicial] = useState("1");
  const [quantidade, setQuantidade] = useState("5");

  const seqBase = Number(seqInicial) || 1;
  const qtd = Math.max(1, Number(quantidade) || 1);

  const etiquetas = Array.from({ length: qtd }, (_, i) =>
    gerarCodigoEtiqueta(padrao, {
      bloco,
      sala,
      local: `${bloco}${sala}`,
      patchPanel,
      porta: Number(porta) + i,
      seq: seqBase + i,
    })
  );

  function copiarTudo() {
    navigator.clipboard.writeText(etiquetas.join("\n"));
    alert("Códigos copiados para a área de transferência!");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-500 to-gray-200">
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-1 text-2xl font-bold text-white">
          Gerador de Etiquetas
        </h1>
        <p className="mb-6 text-sm text-slate-200">
          Defina o padrão de nomenclatura da sua equipe usando os campos{" "}
          {"{BLOCO} {SALA} {LOCAL} {PATCHPANEL} {PORTA} {SEQ}"}.
        </p>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <h2 className="mb-4 font-semibold text-slate-800">Configuração</h2>
            <div className="space-y-3">
              <div>
                <Label>Padrão da etiqueta</Label>
                <Input
                  value={padrao}
                  onChange={(e) => setPadrao(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Bloco</Label>
                  <Input
                    value={bloco}
                    onChange={(e) => setBloco(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Sala</Label>
                  <Input
                    value={sala}
                    onChange={(e) => setSala(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Patch Panel</Label>
                  <Input
                    value={patchPanel}
                    onChange={(e) => setPatchPanel(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Porta inicial</Label>
                  <Input
                    type="number"
                    value={porta}
                    onChange={(e) => setPorta(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Sequencial inicial</Label>
                  <Input
                    type="number"
                    value={seqInicial}
                    onChange={(e) => setSeqInicial(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Quantidade a gerar</Label>
                  <Input
                    type="number"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={copiarTudo} className="w-full">
                Copiar todos os códigos
              </Button>
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 font-semibold text-slate-800">
              Pré-visualização ({etiquetas.length})
            </h2>
            <div className="max-h-[420px] space-y-2 overflow-y-auto">
              {etiquetas.map((cod, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-md border border-dashed border-slate-300 px-3 py-2 font-mono text-sm"
                >
                  <span>{cod}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(cod)}
                    className="text-xs text-slate-500 hover:underline"
                  >
                    copiar
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
