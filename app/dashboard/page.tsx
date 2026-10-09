"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { sessaoStore, type Sessao } from "@/lib/users";
import { salasStore, type Sala } from "@/lib/salas";
import { pontosRedeStore, patchPanelsStore, switchesStore } from "@/lib/storage";
import type { PontoRede, PatchPanel, SwitchEquip } from "@/lib/types";

const MODULOS = [
  {
    href: "/inventario",
    titulo: "Inventário de Cabeamento",
    desc: "Ponto de rede → patch panel/porta → porta de switch → categoria do cabo.",
  },
  {
    href: "/etiquetas",
    titulo: "Gerador de Etiquetas",
    desc: "Crie códigos de identificação seguindo a nomenclatura da sua equipe.",
  },
  {
    href: "/certificacao",
    titulo: "Testes de Certificação",
    desc: "Registre testes e valide automaticamente contra os limites da norma (PASS/FAIL).",
  },
];

const norm = (s: string) => (s ?? "").trim().toLowerCase();

function IconeLixeira({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-4 w-4"}
    >
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [pontos, setPontos] = useState<PontoRede[]>([]);
  const [patchPanels, setPatchPanels] = useState<PatchPanel[]>([]);
  const [switches, setSwitches] = useState<SwitchEquip[]>([]);

  const [modalNovaAberto, setModalNovaAberto] = useState(false);
  const [form, setForm] = useState({ nome: "", bloco: "", descricao: "" });
  const [erro, setErro] = useState("");

  const [salaSelecionadaId, setSalaSelecionadaId] = useState<string | null>(null);

  function refresh() {
    setSalas(salasStore.list());
    setPontos(pontosRedeStore.list());
    setPatchPanels(patchPanelsStore.list());
    setSwitches(switchesStore.list());
  }

  useEffect(() => {
    const s = sessaoStore.get();
    if (!s) {
      router.push("/");
      return;
    }
    setSessao(s);
    refresh();
  }, [router]);

  function sair() {
    sessaoStore.clear();
    router.push("/");
  }

  function abrirModalNova() {
    setForm({ nome: "", bloco: "", descricao: "" });
    setErro("");
    setModalNovaAberto(true);
  }

  function salvarSala(e: React.FormEvent) {
    e.preventDefault();
    const nome = form.nome.trim();
    if (!nome) {
      setErro("Informe o nome da sala.");
      return;
    }
    if (salas.some((s) => norm(s.nome) === norm(nome))) {
      setErro("Já existe uma sala com esse nome.");
      return;
    }
    salasStore.criar({
      nome,
      bloco: form.bloco.trim() || undefined,
      descricao: form.descricao.trim() || undefined,
    });
    refresh();
    setModalNovaAberto(false);
  }

  function removerSala(id: string, nome: string) {
    if (confirm(`Remover a sala "${nome}"? Os equipamentos do inventário não serão apagados.`)) {
      salasStore.remover(id);
      setSalaSelecionadaId(null);
      refresh();
    }
  }

  function dadosDaSala(s: Sala) {
    return {
      pontos: pontos.filter((p) => norm(p.local) === norm(s.nome)),
      pp: patchPanels.filter((p) => norm(p.local) === norm(s.nome)),
      sw: switches.filter((w) => norm(w.local) === norm(s.nome)),
    };
  }

  const salaSelecionada = salas.find((s) => s.id === salaSelecionadaId) ?? null;

  if (!sessao) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-500 to-gray-200 px-5 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Bem-vindo, {sessao.nomeUsuario}</h1>
            <p className="text-slate-200">Escolha um módulo para começar.</p>
          </div>
          <div className="flex gap-2">
            {sessao.isAdmin && (
              <Link href="/register">
                <button className="rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20">
                  Criar Conta
                </button>
              </Link>
            )}
            <Link href="/usuarios">
              <button className="rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20">
                Ver Usuários
              </button>
            </Link>
            <button
              onClick={sair}
              className="rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
            >
              Sair
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {MODULOS.map((m) => (
            <Link key={m.href} href={m.href}>
              <div className="h-full rounded-lg border border-white/20 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                <h2 className="mb-2 font-semibold text-slate-900">{m.titulo}</h2>
                <p className="text-sm text-slate-500">{m.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* ---------- Seção de Salas ---------- */}
        <div className="mt-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Minhas Salas ({salas.length})</h2>
            <button
              onClick={abrirModalNova}
              className="flex items-center gap-1 rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-200"
            >
              <span className="text-lg leading-none">+</span> Adicionar Sala
            </button>
          </div>

          {salas.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/30 p-6 text-center text-slate-200">
              Nenhuma sala cadastrada ainda. Clique em &quot;Adicionar Sala&quot; para começar.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {salas.map((s) => {
                const d = dadosDaSala(s);
                return (
                  <div
                    key={s.id}
                    onClick={() => setSalaSelecionadaId(s.id)}
                    className="group relative cursor-pointer rounded-lg border border-white/20 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removerSala(s.id, s.nome);
                      }}
                      title="Remover sala"
                      className="absolute right-2 top-2 rounded p-1 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <IconeLixeira className="h-4 w-4" />
                    </button>

                    <h3 className="truncate pr-6 text-sm font-semibold text-slate-900">{s.nome}</h3>
                    <p className="truncate text-xs text-slate-400">{s.bloco || "—"}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      {d.pontos.length} pontos · {d.pp.length} PP · {d.sw.length} SW
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ---------- Modal Detalhes da Sala ---------- */}
      {salaSelecionada && (() => {
        const d = dadosDaSala(salaSelecionada);
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
            onClick={() => setSalaSelecionadaId(null)}
          >
            <div
              className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{salaSelecionada.nome}</h2>
                  {salaSelecionada.bloco && (
                    <p className="text-sm text-slate-500">{salaSelecionada.bloco}</p>
                  )}
                  {salaSelecionada.descricao && (
                    <p className="mt-1 text-sm text-slate-600">{salaSelecionada.descricao}</p>
                  )}
                  <p className="mt-1 text-xs text-slate-400">
                    Criada em {new Date(salaSelecionada.criadoEm).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => removerSala(salaSelecionada.id, salaSelecionada.nome)}
                    title="Remover sala"
                    className="rounded p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <IconeLixeira className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setSalaSelecionadaId(null)}
                    className="px-1 text-2xl leading-none text-slate-400 hover:text-slate-700"
                    aria-label="Fechar"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-md bg-slate-100 py-2">
                  <p className="text-lg font-bold text-slate-900">{d.pontos.length}</p>
                  <p className="text-xs text-slate-500">Pontos</p>
                </div>
                <div className="rounded-md bg-slate-100 py-2">
                  <p className="text-lg font-bold text-slate-900">{d.pp.length}</p>
                  <p className="text-xs text-slate-500">Patch Panels</p>
                </div>
                <div className="rounded-md bg-slate-100 py-2">
                  <p className="text-lg font-bold text-slate-900">{d.sw.length}</p>
                  <p className="text-xs text-slate-500">Switches</p>
                </div>
              </div>

              <div className="mt-5">
                <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Pontos de Rede
                </h4>
                {d.pontos.length === 0 ? (
                  <p className="text-sm text-slate-400">Nenhum ponto nesta sala.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500">
                          <th className="py-1 pr-2">Código</th>
                          <th className="py-1 pr-2">Patch Panel</th>
                          <th className="py-1 pr-2">Switch</th>
                          <th className="py-1 pr-2">Cabo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {d.pontos.map((p) => {
                          const pp = patchPanels.find((x) => x.id === p.patchPanelId);
                          const sw = switches.find((x) => x.id === p.switchId);
                          return (
                            <tr key={p.id} className="border-b border-slate-100">
                              <td className="py-1 pr-2 font-medium text-slate-900">{p.codigo}</td>
                              <td className="py-1 pr-2">{pp ? `${pp.codigo} / ${p.portaPatchPanel}` : "—"}</td>
                              <td className="py-1 pr-2">{sw ? `${sw.codigo} / ${p.portaSwitch}` : "—"}</td>
                              <td className="py-1 pr-2">{p.categoriaCabo}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Patch Panels
                </h4>
                {d.pp.length === 0 ? (
                  <p className="text-sm text-slate-400">Nenhum patch panel nesta sala.</p>
                ) : (
                  <ul className="space-y-1 text-sm text-slate-700">
                    {d.pp.map((p) => (
                      <li key={p.id}>
                        <span className="font-medium">{p.codigo}</span> — {p.totalPortas} portas
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-4">
                <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Switches
                </h4>
                {d.sw.length === 0 ? (
                  <p className="text-sm text-slate-400">Nenhum switch nesta sala.</p>
                ) : (
                  <ul className="space-y-1 text-sm text-slate-700">
                    {d.sw.map((w) => (
                      <li key={w.id}>
                        <span className="font-medium">{w.codigo}</span>
                        {w.modelo ? ` (${w.modelo})` : ""} — {w.totalPortas} portas
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <Link
                href="/inventario"
                className="mt-5 inline-block text-xs font-medium text-slate-600 hover:underline"
              >
                Gerenciar no inventário →
              </Link>
            </div>
          </div>
        );
      })()}

      {/* ---------- Modal Nova Sala ---------- */}
      {modalNovaAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={() => setModalNovaAberto(false)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Nova Sala</h2>
              <button
                onClick={() => setModalNovaAberto(false)}
                className="text-2xl leading-none text-slate-400 hover:text-slate-700"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <form onSubmit={salvarSala} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Nome da sala *
                </label>
                <input
                  autoFocus
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="ex: Sala 101"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Use o mesmo nome no campo &quot;Local&quot; do inventário para os equipamentos aparecerem aqui.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Bloco / Andar
                </label>
                <input
                  value={form.bloco}
                  onChange={(e) => setForm({ ...form, bloco: e.target.value })}
                  placeholder="ex: Bloco A - 1º andar"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Descrição / Observações
                </label>
                <textarea
                  rows={3}
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  placeholder="ex: Laboratório de informática"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              {erro && <p className="text-sm text-red-600">{erro}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalNovaAberto(false)}
                  className="rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                >
                  Criar Sala
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}