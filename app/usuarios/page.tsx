"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usuariosStore, sessaoStore, type Usuario } from "@/lib/users";
import { Card, Button } from "@/components/ui";

export default function UsuariosPage() {
  const router = useRouter();
  const [sessao, setSessao] = useState<{
    id: string;
    nomeUsuario: string;
  } | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  function refresh() {
    setUsuarios(usuariosStore.list());
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

  function remover(id: string, nomeUsuario: string) {
    if (sessao && id === sessao.id) {
      alert("Você não pode remover o usuário com o qual está logado.");
      return;
    }
    if (confirm(`Remover o usuário "${nomeUsuario}"?`)) {
      usuariosStore.remover(id);
      refresh();
    }
  }

  if (!sessao) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-500 to-gray-200 px-5 py-10">
      <main className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">
            Usuários Cadastrados
          </h1>
          <Link href="/dashboard">
            <Button variant="secondary">Voltar ao Dashboard</Button>
          </Link>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 pr-3">Usuário</th>
                  <th className="py-2 pr-3">Criado em</th>
                  <th className="py-2 pr-3"></th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 ">
                    <td className="py-2 pr-3 font-medium text-slate-950">
                      {u.nomeUsuario}
                      {sessao.id === u.id && (
                        <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-950">
                          você
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-slate-950">
                      {new Date(u.criadoEm).toLocaleString("pt-BR")}
                    </td>
                    <td className="py-2 pr-3 ">
                      <button
                        onClick={() => remover(u.id, u.nomeUsuario)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        remover
                      </button>
                    </td>
                  </tr>
                ))}
                {usuarios.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-400">
                      Nenhum usuário cadastrado ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}
