"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { sessaoStore, type Sessao } from "@/lib/users";
import { maquinasStore, pontosRedeStore } from "@/lib/storage";
import { SALAS, type SalaSlug } from "@/lib/salas";

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

type ContagensPorSala = Record<
  SalaSlug,
  { maquinas: number; cabeamento: number }
>;

export default function DashboardPage() {
  const router = useRouter();
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [contagens, setContagens] = useState<ContagensPorSala>(
    {} as ContagensPorSala
  );

  useEffect(() => {
    const s = sessaoStore.get();
    if (!s) {
      router.push("/");
      return;
    }
    setSessao(s);

    const maquinas = maquinasStore.list();
    const pontos = pontosRedeStore.list();
    const porSala = {} as ContagensPorSala;
    for (const sala of SALAS) {
      porSala[sala.slug] = {
        maquinas: maquinas.filter((m) => m.sala === sala.slug).length,
        cabeamento: pontos.filter((p) => p.sala === sala.slug).length,
      };
    }
    setContagens(porSala);
  }, [router]);

  function sair() {
    sessaoStore.clear();
    router.push("/");
  }

  if (!sessao) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-500 to-gray-200 px-5 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Bem-vindo, {sessao.nomeUsuario}
            </h1>
            <p className="text-slate-200">Escolha um módulo para começar.</p>
          </div>
          <div className="flex gap-2">
            {sessao.isAdmin && (
              <Link href="/register">
                <button className="rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20">
                  Adicionar usuário
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
                <h2 className="mb-2 font-semibold text-slate-900">
                  {m.titulo}
                </h2>
                <p className="text-sm text-slate-500">{m.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mb-4 mt-10">
          <h2 className="text-xl font-bold text-white">Salas</h2>
          <p className="text-sm text-slate-200">
            Cada espaço reúne as máquinas e o cabeamento cadastrados nele.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SALAS.map((sala) => {
            const c = contagens[sala.slug] ?? { maquinas: 0, cabeamento: 0 };
            return (
              <Link key={sala.slug} href={`/salas/${sala.slug}`}>
                <div className="h-full rounded-lg border border-white/20 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                  <h2 className="mb-1 font-semibold text-slate-900">
                    {sala.nome}
                  </h2>
                  <p className="mb-3 text-sm text-slate-500">{sala.desc}</p>
                  <div className="flex gap-2">
                    <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                      {c.maquinas} máquina{c.maquinas === 1 ? "" : "s"}
                    </span>
                    <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                      {c.cabeamento} ponto{c.cabeamento === 1 ? "" : "s"} de
                      cabeamento
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
