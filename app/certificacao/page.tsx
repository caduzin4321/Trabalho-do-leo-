"use client";

import { useEffect, useState } from "react";
import { testesStore, pontosRedeStore } from "@/lib/storage";
import type { TesteCertificacao, PontoRede, CategoriaCabo } from "@/lib/types";
import { validarTeste, LIMITES_POR_CATEGORIA } from "@/lib/certLimits";
import { Input, Select, Button, Card, Label, Badge } from "@/components/ui";

const CATEGORIAS: CategoriaCabo[] = ["Cat5e", "Cat6", "Cat6A", "Cat7"];

export default function CertificacaoPage() {
  const [pontos, setPontos] = useState<PontoRede[]>([]);
  const [testes, setTestes] = useState<TesteCertificacao[]>([]);

  const [form, setForm] = useState({
    pontoRedeId: "",
    categoriaCabo: "Cat6" as CategoriaCabo,
    comprimentoMedidoM: "",
    perdaInsercaoDb: "",
    nextDb: "",
    returnLossDb: "",
    testadoPor: "",
  });

  const [previa, setPrevia] = useState<{
    resultado: "PASS" | "FAIL";
    detalhesFalha: string[];
  } | null>(null);

  function refresh() {
    setPontos(pontosRedeStore.list());
    setTestes(testesStore.list());
  }
  useEffect(refresh, []);

  function handlePontoChange(pontoId: string) {
    const ponto = pontosRedeStore.get(pontoId);
    setForm({
      ...form,
      pontoRedeId: pontoId,
      categoriaCabo: ponto?.categoriaCabo ?? form.categoriaCabo,
      comprimentoMedidoM: ponto
        ? String(ponto.comprimentoMetros)
        : form.comprimentoMedidoM,
    });
    setPrevia(null);
  }

  function calcularPrevia() {
    if (
      !form.comprimentoMedidoM ||
      !form.perdaInsercaoDb ||
      !form.nextDb ||
      !form.returnLossDb
    ) {
      alert("Preencha todos os valores medidos.");
      return;
    }
    const r = validarTeste({
      categoriaCabo: form.categoriaCabo,
      comprimentoMedidoM: Number(form.comprimentoMedidoM),
      perdaInsercaoDb: Number(form.perdaInsercaoDb),
      nextDb: Number(form.nextDb),
      returnLossDb: Number(form.returnLossDb),
    });
    setPrevia(r);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.pontoRedeId) {
      alert("Selecione o ponto de rede testado.");
      return;
    }
    const resultado = validarTeste({
      categoriaCabo: form.categoriaCabo,
      comprimentoMedidoM: Number(form.comprimentoMedidoM),
      perdaInsercaoDb: Number(form.perdaInsercaoDb),
      nextDb: Number(form.nextDb),
      returnLossDb: Number(form.returnLossDb),
    });

    testesStore.create({
      pontoRedeId: form.pontoRedeId,
      categoriaCabo: form.categoriaCabo,
      dataTeste: new Date().toISOString(),
      comprimentoMedidoM: Number(form.comprimentoMedidoM),
      perdaInsercaoDb: Number(form.perdaInsercaoDb),
      nextDb: Number(form.nextDb),
      returnLossDb: Number(form.returnLossDb),
      resultado: resultado.resultado,
      detalhesFalha: resultado.detalhesFalha,
      testadoPor: form.testadoPor,
    });

    setForm({
      ...form,
      comprimentoMedidoM: "",
      perdaInsercaoDb: "",
      nextDb: "",
      returnLossDb: "",
    });
    setPrevia(null);
    refresh();
  }

  function remover(id: string) {
    if (confirm("Remover este teste registrado?")) {
      testesStore.remove(id);
      refresh();
    }
  }

  const limite = LIMITES_POR_CATEGORIA[form.categoriaCabo];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-500 to-gray-200">
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-1 text-2xl font-bold text-white">
          Registro de Testes de Certificação
        </h1>
        <p className="mb-6 text-sm text-slate-200">
          Os limites usados são de referência (ANSI/TIA-568-C.2) — ajuste em{" "}
          <code>lib/certLimits.ts</code> se seu professor exigir outra norma.
        </p>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <h2 className="mb-4 font-semibold text-slate-800">Novo Teste</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label>Ponto de rede testado</Label>
                <Select
                  value={form.pontoRedeId}
                  onChange={(e) => handlePontoChange(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {pontos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.codigo} — {p.local}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Categoria do cabo</Label>
                <Select
                  value={form.categoriaCabo}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      categoriaCabo: e.target.value as CategoriaCabo,
                    })
                  }
                >
                  {CATEGORIAS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="rounded-md bg-slate-50 p-3 text-xs text-slate-500">
                Limites para {form.categoriaCabo}: comprimento ≤{" "}
                {limite.comprimentoMaximoM}m · perda de inserção ≤{" "}
                {limite.perdaInsercaoMaxDb}dB · NEXT ≥ {limite.nextMinDb}dB ·
                return loss ≥ {limite.returnLossMinDb}dB
              </div>
              <div>
                <Label>Comprimento medido (m)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.comprimentoMedidoM}
                  onChange={(e) =>
                    setForm({ ...form, comprimentoMedidoM: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Perda de Inserção (dB)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.perdaInsercaoDb}
                  onChange={(e) =>
                    setForm({ ...form, perdaInsercaoDb: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>NEXT (dB)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.nextDb}
                  onChange={(e) => setForm({ ...form, nextDb: e.target.value })}
                />
              </div>
              <div>
                <Label>Return Loss (dB)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.returnLossDb}
                  onChange={(e) =>
                    setForm({ ...form, returnLossDb: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Testado por</Label>
                <Input
                  value={form.testadoPor}
                  onChange={(e) =>
                    setForm({ ...form, testadoPor: e.target.value })
                  }
                />
              </div>

              {previa && (
                <div
                  className={`rounded-md p-3 text-sm ${
                    previa.resultado === "PASS"
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  <strong>{previa.resultado}</strong>
                  {previa.detalhesFalha.length > 0 && (
                    <ul className="mt-1 list-disc pl-4">
                      {previa.detalhesFalha.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={calcularPrevia}
                  className="flex-1"
                >
                  Pré-validar
                </Button>
                <Button type="submit" className="flex-1">
                  Registrar Teste
                </Button>
              </div>
            </form>
          </Card>

          <Card className="lg:col-span-2">
            <h2 className="mb-4 font-semibold text-slate-800">
              Testes Registrados ({testes.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2 pr-3">Ponto</th>
                    <th className="py-2 pr-3">Categoria</th>
                    <th className="py-2 pr-3">Comp.</th>
                    <th className="py-2 pr-3">Perda Ins.</th>
                    <th className="py-2 pr-3">NEXT</th>
                    <th className="py-2 pr-3">Return Loss</th>
                    <th className="py-2 pr-3">Resultado</th>
                    <th className="py-2 pr-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {testes
                    .slice()
                    .reverse()
                    .map((t) => {
                      const ponto = pontos.find((p) => p.id === t.pontoRedeId);
                      return (
                        <tr key={t.id} className="border-b border-slate-100">
                          <td className="py-2 pr-3 font-medium text-slate-950">
                            {ponto?.codigo ?? "—"}
                          </td>
                          <td className="py-2 pr-3 text-slate-950">
                            {t.categoriaCabo}
                          </td>
                          <td className="py-2 pr-3 text-slate-950">
                            {t.comprimentoMedidoM}m
                          </td>
                          <td className="py-2 pr-3 text-slate-950">
                            {t.perdaInsercaoDb}dB
                          </td>
                          <td className="py-2 pr-3 text-slate-950">
                            {t.nextDb}dB
                          </td>
                          <td className="py-2 pr-3 text-slate-950">
                            {t.returnLossDb}dB
                          </td>
                          <td className="py-2 pr-3">
                            <Badge
                              color={t.resultado === "PASS" ? "green" : "red"}
                            >
                              {t.resultado}
                            </Badge>
                          </td>
                          <td className="py-2 pr-3">
                            <button
                              onClick={() => remover(t.id)}
                              className="text-xs text-red-600 hover:underline"
                            >
                              remover
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  {testes.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-6 text-center text-slate-400"
                      >
                        Nenhum teste registrado ainda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
