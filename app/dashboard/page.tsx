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

export default function DashboardPage() {
  const router = useRouter();
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [pontos, setPontos] = useState<PontoRede[]>([]);
  const [patchPanels, setPatchPanels] = useState<PatchPanel[]>([]);
  const [switches, setSwitches] = useState<SwitchEquip[]>([]);

  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState({ nome: "", bloco: "", descricao: "" });
  const [erro, setErro] = useState("");

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

  function abrirModal() {
    setForm({ nome: "", bloco: "", descricao: "" });
    setErro("");
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
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
    fecharModal();
  }

  function removerSala(id: string, nome: string) {
    if (confirm(`Remover a sala "${nome}"? Os equipamentos do inventário não serão apagados.`)) {
      salasStore.remover(id);
      refresh();
    }
  }

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
              onClick={abrirModal}
              className="flex items-center gap-1 rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-200"
            >
              <span className="text-lg leading-none">+</span> Adicionar Sala
            </button>
          </div>

          {salas.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/30 p-6 text-center text-slate-200">
              Clique em &quot;Adicionar Sala&quot; para começar.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {salas.map((s) => {
                const pontosSala = pontos.filter((p) => norm(p.local) === norm(s.nome));
                const ppSala = patchPanels.filter((p) => norm(p.local) === norm(s.nome));
                const swSala = switches.filter((w) => norm(w.local) === norm(s.nome));

                return (
                  <div
                    key={s.id}
                    className="relative rounded-lg border border-white/20 bg-white p-5 shadow-sm"
                  >
                    <button
                      onClick={() => removerSala(s.id, s.nome)}
                      title="Remover sala"
                      className="absolute right-3 top-3 text-xs font-medium text-red-600 hover:underline"
                    >
                      remover sala
                    </button>

                    <h3 className="pr-24 text-lg font-semibold text-slate-900">{s.nome}</h3>
                    {s.bloco && <p className="text-sm text-slate-500">{s.bloco}</p>}
                    {s.descricao && <p className="mt-1 text-sm text-slate-600">{s.descricao}</p>}
                    <p className="mt-1 text-xs text-slate-400">
                      Criada em {new Date(s.criadoEm).toLocaleDateString("pt-BR")}
                    </p>

                    {/* Resumo */}
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-md bg-slate-100 py-2">
                        <p className="text-lg font-bold text-slate-900">{pontosSala.length}</p>
                        <p className="text-xs text-slate-500">Pontos</p>
                      </div>
                      <div className="rounded-md bg-slate-100 py-2">
                        <p className="text-lg font-bold text-slate-900">{ppSala.length}</p>
                        <p className="text-xs text-slate-500">Patch Panels</p>
                      </div>
                      <div className="rounded-md bg-slate-100 py-2">
                        <p className="text-lg font-bold text-slate-900">{swSala.length}</p>
                        <p className="text-xs text-slate-500">Switches</p>
                      </div>
                    </div>

                    {/* Pontos de rede */}
                    <div className="mt-4">
                      <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Pontos de Rede
                      </h4>
                      {pontosSala.length === 0 ? (
                        <p className="text-sm text-slate-400">Nenhum ponto nesta sala.</p>
                      ) : (
                        <div className="max-h-48 overflow-auto">
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
                              {pontosSala.map((p) => {
                                const pp = patchPanels.find((x) => x.id === p.patchPanelId);
                                const sw = switches.find((x) => x.id === p.switchId);
                                return (
                                  <tr key={p.id} className="border-b border-slate-100">
                                    <td className="py-1 pr-2 font-medium text-slate-900">{p.codigo}</td>
                                    <td className="py-1 pr-2">
                                      {pp ? `${pp.codigo} / ${p.portaPatchPanel}` : "—"}
                                    </td>
                                    <td className="py-1 pr-2">
                                      {sw ? `${sw.codigo} / ${p.portaSwitch}` : "—"}
                                    </td>
                                    <td className="py-1 pr-2">{p.categoriaCabo}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Patch panels */}
                    <div className="mt-4">
                      <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Patch Panels
                      </h4>
                      {ppSala.length === 0 ? (
                        <p className="text-sm text-slate-400">Nenhum patch panel nesta sala.</p>
                      ) : (
                        <ul className="space-y-1 text-sm text-slate-700">
                          {ppSala.map((p) => (
                            <li key={p.id}>
                              <span className="font-medium">{p.codigo}</span> — {p.totalPortas} portas
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Switches */}
                    <div className="mt-4">
                      <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Switches
                      </h4>
                      {swSala.length === 0 ? (
                        <p className="text-sm text-slate-400">Nenhum switch nesta sala.</p>
                      ) : (
                        <ul className="space-y-1 text-sm text-slate-700">
                          {swSala.map((w) => (
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
                      className="mt-4 inline-block text-xs font-medium text-slate-600 hover:underline"
                    >
                      Gerenciar no inventário →
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ---------- Modal Nova Sala ---------- */}
      {modalAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={fecharModal}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Nova Sala</h2>
              <button
                onClick={fecharModal}
                className="text-xl leading-none text-slate-400 hover:text-slate-700"
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
                  onClick={fecharModal}
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