"use client";

import { useEffect, useState } from "react";
import {
  pontosRedeStore,
  patchPanelsStore,
  switchesStore,
} from "@/lib/storage";
import type {
  PontoRede,
  PatchPanel,
  SwitchEquip,
  CategoriaCabo,
} from "@/lib/types";
import { Input, Select, Button, Card, Label } from "@/components/ui";

const CATEGORIAS: CategoriaCabo[] = ["Cat5e", "Cat6", "Cat6A", "Cat7"];

export default function InventarioPage() {
  const [tab, setTab] = useState<"pontos" | "patchpanels" | "switches">(
    "pontos"
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-500 to-gray-200">
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-1 text-2xl font-bold text-white">
          Inventário de Cabeamento
        </h1>
        <p className="mb-6 text-sm text-slate-200">
          Cadastre patch panels e switches primeiro, depois relacione cada ponto
          de rede a eles.
        </p>

        <div className="mb-6 flex gap-2">
          {[
            { key: "pontos", label: "Pontos de Rede" },
            { key: "patchpanels", label: "Patch Panels" },
            { key: "switches", label: "Switches" },
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

        {tab === "pontos" && <PontosRedeTab />}
        {tab === "patchpanels" && <PatchPanelsTab />}
        {tab === "switches" && <SwitchesTab />}
      </main>
    </div>
  );
}

// ---------- Pontos de Rede ----------

function PontosRedeTab() {
  const [pontos, setPontos] = useState<PontoRede[]>([]);
  const [patchPanels, setPatchPanels] = useState<PatchPanel[]>([]);
  const [switches, setSwitches] = useState<SwitchEquip[]>([]);

  const [form, setForm] = useState({
    codigo: "",
    local: "",
    ambiente: "",
    patchPanelId: "",
    portaPatchPanel: "",
    switchId: "",
    portaSwitch: "",
    categoriaCabo: "Cat6" as CategoriaCabo,
    comprimentoMetros: "",
    observacoes: "",
  });

  function refresh() {
    setPontos(pontosRedeStore.list());
    setPatchPanels(patchPanelsStore.list());
    setSwitches(switchesStore.list());
  }

  useEffect(refresh, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.codigo || !form.patchPanelId || !form.switchId) {
      alert("Preencha ao menos código, patch panel e switch.");
      return;
    }
    pontosRedeStore.create({
      codigo: form.codigo,
      local: form.local,
      ambiente: form.ambiente,
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
    if (confirm("Remover este ponto de rede?")) {
      pontosRedeStore.remove(id);
      refresh();
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <h2 className="mb-4 font-semibold text-slate-800">
          Novo Ponto de Rede
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label>Código do ponto</Label>
            <Input
              value={form.codigo}
              onChange={(e) => setForm({ ...form, codigo: e.target.value })}
              placeholder="ex: A-101-PT01"
            />
          </div>
          <div>
            <Label>Local</Label>
            <Input
              value={form.local}
              onChange={(e) => setForm({ ...form, local: e.target.value })}
              placeholder="ex: Sala 101"
            />
          </div>
          <div>
            <Label>Ambiente / Bloco</Label>
            <Input
              value={form.ambiente}
              onChange={(e) => setForm({ ...form, ambiente: e.target.value })}
              placeholder="ex: Bloco A - 1º andar"
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
          Pontos Cadastrados ({pontos.length})
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
                <th className="py-2 pr-3">Comp. (m)</th>
                <th className="py-2 pr-3"></th>
              </tr>
            </thead>
            <tbody>
              {pontos.map((p) => {
                const pp = patchPanels.find((x) => x.id === p.patchPanelId);
                const sw = switches.find((x) => x.id === p.switchId);
                return (
                  <tr key={p.id} className="border-b border-slate-100">
                    <td className="py-2 pr-3 font-medium text-slate-950">
                      {p.codigo}
                    </td>
                    <td className="py-2 pr-3 text-slate-950">{p.local}</td>
                    <td className="py-2 pr-3 text-slate-950">
                      {pp ? `${pp.codigo} / porta ${p.portaPatchPanel}` : "—"}
                    </td>
                    <td className="py-2 pr-3 text-slate-950">
                      {sw ? `${sw.codigo} / porta ${p.portaSwitch}` : "—"}
                    </td>
                    <td className="py-2 pr-3 text-slate-950">
                      {p.categoriaCabo}
                    </td>
                    <td className="py-2 pr-3 text-slate-950">
                      {p.comprimentoMetros}
                    </td>
                    <td className="py-2 pr-3 text-slate-950">
                      <button
                        onClick={() => remover(p.id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        remover
                      </button>
                    </td>
                  </tr>
                );
              })}
              {pontos.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    Nenhum ponto cadastrado ainda.
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

// ---------- Patch Panels ----------

function PatchPanelsTab() {
  const [items, setItems] = useState<PatchPanel[]>([]);
  const [form, setForm] = useState({
    codigo: "",
    local: "",
    totalPortas: "24",
  });

  function refresh() {
    setItems(patchPanelsStore.list());
  }
  useEffect(refresh, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.codigo) return;
    patchPanelsStore.create({
      codigo: form.codigo,
      local: form.local,
      totalPortas: Number(form.totalPortas) || 24,
    });
    setForm({ codigo: "", local: "", totalPortas: "24" });
    refresh();
  }

  function remover(id: string) {
    if (confirm("Remover este patch panel?")) {
      patchPanelsStore.remove(id);
      refresh();
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card>
        <h2 className="mb-4 font-semibold text-slate-800">Novo Patch Panel</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label>Código</Label>
            <Input
              value={form.codigo}
              onChange={(e) => setForm({ ...form, codigo: e.target.value })}
              placeholder="ex: PP-RACK1-01"
            />
          </div>
          <div>
            <Label>Local</Label>
            <Input
              value={form.local}
              onChange={(e) => setForm({ ...form, local: e.target.value })}
              placeholder="ex: Rack 1"
            />
          </div>
          <div>
            <Label>Total de portas</Label>
            <Input
              type="number"
              value={form.totalPortas}
              onChange={(e) =>
                setForm({ ...form, totalPortas: e.target.value })
              }
            />
          </div>
          <Button type="submit" className="w-full">
            Cadastrar
          </Button>
        </form>
      </Card>
      <Card className="lg:col-span-2">
        <h2 className="mb-4 font-semibold text-slate-800">
          Patch Panels ({items.length})
        </h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="py-2 pr-3 text-slate-500">Código</th>
              <th className="py-2 pr-3 text-slate-500">Local</th>
              <th className="py-2 pr-3 text-slate-500">Portas</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-b border-slate-100">
                <td className="py-2 pr-3 font-medium text-slate-950">
                  {i.codigo}
                </td>
                <td className="py-2 pr-3 text-slate-950">{i.local}</td>
                <td className="py-2 pr-3 text-slate-950">{i.totalPortas}</td>
                <td>
                  <button
                    onClick={() => remover(i.id)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    remover
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-slate-400">
                  Nenhum patch panel cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ---------- Switches ----------

function SwitchesTab() {
  const [items, setItems] = useState<SwitchEquip[]>([]);
  const [form, setForm] = useState({
    codigo: "",
    local: "",
    totalPortas: "24",
    modelo: "",
  });

  function refresh() {
    setItems(switchesStore.list());
  }
  useEffect(refresh, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.codigo) return;
    switchesStore.create({
      codigo: form.codigo,
      local: form.local,
      totalPortas: Number(form.totalPortas) || 24,
      modelo: form.modelo,
    });
    setForm({ codigo: "", local: "", totalPortas: "24", modelo: "" });
    refresh();
  }

  function remover(id: string) {
    if (confirm("Remover este switch?")) {
      switchesStore.remove(id);
      refresh();
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card>
        <h2 className="mb-4 font-semibold text-slate-800">Novo Switch</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label>Código</Label>
            <Input
              value={form.codigo}
              onChange={(e) => setForm({ ...form, codigo: e.target.value })}
              placeholder="ex: SW-RACK1-01"
            />
          </div>
          <div>
            <Label>Local</Label>
            <Input
              value={form.local}
              onChange={(e) => setForm({ ...form, local: e.target.value })}
              placeholder="ex: Rack 1"
            />
          </div>
          <div>
            <Label>Modelo</Label>
            <Input
              value={form.modelo}
              onChange={(e) => setForm({ ...form, modelo: e.target.value })}
              placeholder="ex: Cisco SG350"
            />
          </div>
          <div>
            <Label>Total de portas</Label>
            <Input
              type="number"
              value={form.totalPortas}
              onChange={(e) =>
                setForm({ ...form, totalPortas: e.target.value })
              }
            />
          </div>
          <Button type="submit" className="w-full">
            Cadastrar
          </Button>
        </form>
      </Card>
      <Card className="lg:col-span-2">
        <h2 className="mb-4 font-semibold text-slate-800">
          Switches ({items.length})
        </h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="py-2 pr-3 text-slate-500">Código</th>
              <th className="py-2 pr-3 text-slate-500">Local</th>
              <th className="py-2 pr-3 text-slate-500">Modelo</th>
              <th className="py-2 pr-3 text-slate-500">Portas</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-b border-slate-100">
                <td className="py-2 pr-3 font-medium text-slate-950">
                  {i.codigo}
                </td>
                <td className="py-2 pr-3 text-slate-950">{i.local}</td>
                <td className="py-2 pr-3 text-slate-950">{i.modelo}</td>
                <td className="py-2 pr-3 text-slate-950">{i.totalPortas}</td>
                <td>
                  <button
                    onClick={() => remover(i.id)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    remover
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-400">
                  Nenhum switch cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
