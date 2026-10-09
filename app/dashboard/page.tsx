"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { sessaoStore, type Sessao } from "@/lib/users";
import { salasStore, type Sala } from "@/lib/salas";

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

export default function DashboardPage() {
  const router = useRouter();
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [salas, setSalas] = useState<Sala[]>([]);

  function refreshSalas() {
    setSalas(salasStore.list());
  }

  useEffect(() => {
    const s = sessaoStore.get();
    if (!s) {
      router.push("/");
      return;
    }
    setSessao(s);
    refreshSalas();
  }, [router]);

  function sair() {
    sessaoStore.clear();
    router.push("/");
  }

  function adicionarSala() {
    const nome = prompt("Nome da nova sala:");
    if (!nome || !nome.trim()) return;
    salasStore.criar(nome.trim());
    refreshSalas();
  }

  function removerSala(id: string, nome: string) {
    if (confirm(`Remover a sala "${nome}"?`)) {
      salasStore.remover(id);
      refreshSalas();
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
            <h2 className="text-xl font-bold text-white">Minhas Salas</h2>
            <button
              onClick={adicionarSala}
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {salas.map((s) => (
                <div
                  key={s.id}
                  className="relative h-full rounded-lg border border-white/20 bg-white p-5 shadow-sm"
                >
                  <button
                    onClick={() => removerSala(s.id, s.nome)}
                    title="Remover sala"
                    className="absolute right-3 top-3 text-slate-400 hover:text-red-600"
                  >
                    ✕
                  </button>
                  <h3 className="pr-6 font-semibold text-slate-900">{s.nome}</h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Criada em {new Date(s.criadoEm).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}