"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  maquinasStore,
  pontosRedeStore,
  patchPanelsStore,
  switchesStore,
} from "@/lib/storage";
import type {
  Maquina,
  TipoMaquina,
  PontoRede,
  PatchPanel,
  SwitchEquip,
  CategoriaCabo,
} from "@/lib/types";
import { getSala, type SalaSlug } from "@/lib/salas";
import { Input, Select, Button, Card, Label } from "@/components/ui";

const TIPOS_MAQUINA: TipoMaquina[] = [
  "Desktop",
  "Notebook",
  "Servidor",
  "Impressora",
  "Outro",
];

const CATEGORIAS: CategoriaCabo[] = ["Cat5e", "Cat6", "Cat6A", "Cat7"];

export default function SalaPage() {
  const params = useParams();
  const slug = String(params.slug);
  const sala = getSala(slug);
  const [tab, setTab] = useState<"maquinas" | "cabeamento">("maquinas");

  if (!sala) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-500 to-gray-200 px-5 py-16">
        <div className="mx-auto max-w-2xl text-center text-white">
          <p className="mb-4">Sala não encontrada.</p>
          <Link href="/dashboard" className="underline">
            Voltar ao dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-500 to-gray-200">
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              href="/dashboard"
              className="mb-2 inline-block text-sm text-slate-200 hover:underline"
            >
              ← Voltar ao dashboard
            </Link>
            <h1 className="text-2xl font-bold text-white">{sala.nome}</h1>
            <p className="text-sm text-slate-200">{sala.desc}</p>
          </div>
        </div>

        <div className="mb-6 flex gap-2">
          {[
            { key: "maquinas", label: "Máquinas" },
            { key: "cabeamento", label: "Cabeamento" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as typeof tab)}
              className={`rounded-md px-4 py-2 text-sm font-medium ${
                tab === t.key
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "maquinas" && <MaquinasTab sala={sala.slug} />}
        {tab === "cabeamento" && <CabeamentoTab sala={sala.slug} />}
      </main>
    </div>
  );
}

// ---------- Máquinas ----------

function MaquinasTab({ sala }: { sala: SalaSlug }) {
  const [itens, setItens] = useState<Maquina[]>([]);
  const [form, setForm] = useState({
    codigo: "",
    tipo: "Desktop" as TipoMaquina,
    patrimonio: "",
    ip: "",
    observacoes: "",
  });

  function refresh() {
    setItens(maquinasStore.list().filter((m) => m.sala === sala));
  }

  useEffect(refresh, [sala]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.codigo) {
      alert("Informe ao menos o código/nome da máquina.");
      return;
    }
    maquinasStore.create({
      codigo: form.codigo,
      sala,
      tipo: form.tipo,
      patrimonio: form.patrimonio,
      ip: form.ip,
      observacoes: form.observacoes,
      criadoEm: new Date().toISOString(),
    });
    setForm({
      codigo: "",
      tipo: "Desktop",
      patrimonio: "",
      ip: "",
      observacoes: "",
    });
    refresh();
  }

  function remover(id: string) {
    if (confirm("Remover esta máquina?")) {
      maquinasStore.remove(id);
      refresh();
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <h2 className="mb-4 font-semibold text-slate-800">Nova Máquina</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label>Código / Nome</Label>
            <Input
              value={form.codigo}
              onChange={(e) => setForm({ ...form, codigo: e.target.value })}
              placeholder="ex: PC-SEC-01"
            />
          </div>
          <div>
            <Label>Tipo</Label>
            <Select
              value={form.tipo}
              onChange={(e) =>
                setForm({ ...form, tipo: e.target.value as TipoMaquina })
              }
            >
              {TIPOS_MAQUINA.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Patrimônio</Label>
            <Input
              value={form.patrimonio}
              onChange={(e) =>
                setForm({ ...form, patrimonio: e.target.value })
              }
              placeholder="ex: 2024-0451"
            />
          </div>
          <div>
            <Label>IP</Label>
            <Input
              value={form.ip}
              onChange={(e) => setForm({ ...form, ip: e.target.value })}
              placeholder="ex: 192.168.1.20"
            />
          </div>
          <div>
            <Label>Observações</Label>
            <Input
              value={form.observacoes}
              onChange={(e) =>
                setForm({ ...form, observacoes: e.target.value })
              }
            />
          </div>
          <Button type="submit" className="w-full">
            Cadastrar Máquina
          </Button>
        </form>
      </Card>

      <Card className="lg:col-span-2">
        <h2 className="mb-4 font-semibold text-slate-800">
          Máquinas nesta sala ({itens.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 pr-3">Código</th>
                <th className="py-2 pr-3">Tipo</th>
                <th className="py-2 pr-3">Patrimônio</th>
                <th className="py-2 pr-3">IP</th>
                <th className="py-2 pr-3">Observações</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {itens.map((m) => (
                <tr key={m.id} className="border-b border-slate-100">
                  <td className="py-2 pr-3 font-medium text-slate-950">
                    {m.codigo}
                  </td>
                  <td className="py-2 pr-3 text-slate-950">{m.tipo}</td>
                  <td className="py-2 pr-3 text-slate-950">
                    {m.patrimonio}
                  </td>
                  <td className="py-2 pr-3 text-slate-950">{m.ip}</td>
                  <td className="py-2 pr-3 text-slate-950">
                    {m.observacoes}
                  </td>
                  <td>
                    <button
                      onClick={() => remover(m.id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      remover
                    </button>
                  </td>
                </tr>
              ))}
              {itens.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    Nenhuma máquina cadastrada nesta sala ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ---------- Cabeamento ----------

function CabeamentoTab({ sala }: { sala: SalaSlug }) {
  const [pontos, setPontos] = useState<PontoRede[]>([]);
  const [patchPanels, setPatchPanels] = useState<PatchPanel[]>([]);
  const [switches, setSwitches] = useState<SwitchEquip[]>([]);

  const [form, setForm] = useState({
    codigo: "",
    local: "",
    patchPanelId: "",
    portaPatchPanel: "",
    switchId: "",
    portaSwitch: "",
    categoriaCabo: "Cat6" as CategoriaCabo,
    comprimentoMetros: "",
    observacoes: "",
  });

  function refresh() {
    setPontos(pontosRedeStore.list().filter((p) => p.sala === sala));
    setPatchPanels(patchPanelsStore.list());
    setSwitches(switchesStore.list());
  }

  useEffect(refresh, [sala]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.codigo || !form.patchPanelId || !form.switchId) {
      alert("Preencha ao menos código, patch panel e switch.");
      return;
    }
    pontosRedeStore.create({
      codigo: form.codigo,
      sala,
      local: form.local,
      patchPanelId: form.patchPanelId,
      portaPatchPanel: Number(form.portaPatchPanel) || 0,
      switchId: form.switchId,
      portaSwitch: Number(form.portaSwitch) || 0,
      categoriaCabo: form.categoriaCabo,
      comprimentoMetros: Number(form.comprimentoMetros) || 0,
      observacoes: form.observacoes,
      criadoEm: new Date().toISOString(),
    });
    setForm({
      ...form,
      codigo: "",
      portaPatchPanel: "",
      portaSwitch: "",
      comprimentoMetros: "",
      observacoes: "",
    });
    refresh();
  }

  function remover(id: string) {
    if (confirm("Remover este ponto de cabeamento?")) {
      pontosRedeStore.remove(id);
      refresh();
    }
  }

  function nomePatchPanel(id: string) {
    return patchPanels.find((p) => p.id === id)?.codigo ?? "-";
  }
  function nomeSwitch(id: string) {
    return switches.find((s) => s.id === id)?.codigo ?? "-";
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <h2 className="mb-4 font-semibold text-slate-800">
          Novo Ponto de Cabeamento
        </h2>
        {(patchPanels.length === 0 || switches.length === 0) && (
          <p className="mb-3 text-xs text-amber-600">
            Cadastre patch panels e switches no módulo{" "}
            <Link href="/inventario" className="underline">
              Inventário
            </Link>{" "}
            antes de vincular um ponto.
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label>Código do ponto</Label>
            <Input
              value={form.codigo}
              onChange={(e) => setForm({ ...form, codigo: e.target.value })}
              placeholder="ex: SEC-PT01"
            />
          </div>
          <div>
            <Label>Detalhe do local (opcional)</Label>
            <Input
              value={form.local}
              onChange={(e) => setForm({ ...form, local: e.target.value })}
              placeholder="ex: mesa 3, parede norte"
            />
          </div>
          <div>
            <Label>Patch Panel</Label>
            <Select
              value={form.patchPanelId}
              onChange={(e) =>
                setForm({ ...form, patchPanelId: e.target.value })
              }
            >
              <option value="">Selecione...</option>
              {patchPanels.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.codigo} ({p.local})
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Porta do Patch Panel</Label>
            <Input
              type="number"
              value={form.portaPatchPanel}
              onChange={(e) =>
                setForm({ ...form, portaPatchPanel: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Switch</Label>
            <Select
              value={form.switchId}
              onChange={(e) => setForm({ ...form, switchId: e.target.value })}
            >
              <option value="">Selecione...</option>
              {switches.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.codigo} ({s.local})
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Porta do Switch</Label>
            <Input
              type="number"
              value={form.portaSwitch}
              onChange={(e) =>
                setForm({ ...form, portaSwitch: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Categoria do Cabo</Label>
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
          <div>
            <Label>Comprimento (metros)</Label>
            <Input
              type="number"
              step="0.1"
              value={form.comprimentoMetros}
              onChange={(e) =>
                setForm({ ...form, comprimentoMetros: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Observações</Label>
            <Input
              value={form.observacoes}
              onChange={(e) =>
                setForm({ ...form, observacoes: e.target.value })
              }
            />
          </div>
          <Button type="submit" className="w-full">
            Cadastrar Ponto
          </Button>
        </form>
      </Card>

      <Card className="lg:col-span-2">
        <h2 className="mb-4 font-semibold text-slate-800">
          Cabeamento desta sala ({pontos.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 pr-3">Código</th>
                <th className="py-2 pr-3">Local</th>
                <th className="py-2 pr-3">Patch Panel</th>
                <th className="py-2 pr-3">Switch</th>
                <th className="py-2 pr-3">Categoria</th>
                <th className="py-2 pr-3">Metros</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pontos.map((p) => (
                <tr key={p.id} className="border-b border-slate-100">
                  <td className="py-2 pr-3 font-medium text-slate-950">
                    {p.codigo}
                  </td>
                  <td className="py-2 pr-3 text-slate-950">{p.local}</td>
                  <td className="py-2 pr-3 text-slate-950">
                    {nomePatchPanel(p.patchPanelId)} / porta{" "}
                    {p.portaPatchPanel}
                  </td>
                  <td className="py-2 pr-3 text-slate-950">
                    {nomeSwitch(p.switchId)} / porta {p.portaSwitch}
                  </td>
                  <td className="py-2 pr-3 text-slate-950">
                    {p.categoriaCabo}
                  </td>
                  <td className="py-2 pr-3 text-slate-950">
                    {p.comprimentoMetros}m
                  </td>
                  <td>
                    <button
                      onClick={() => remover(p.id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      remover
                    </button>
                  </td>
                </tr>
              ))}
              {pontos.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    Nenhum ponto de cabeamento cadastrado nesta sala ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}