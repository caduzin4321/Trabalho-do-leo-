"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usuariosStore, sessaoStore } from "@/lib/users";

export default function RegisterPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [podeAcessar, setPodeAcessar] = useState<boolean | null>(null);
  const [logadoComoAdmin, setLogadoComoAdmin] = useState(false);

  useEffect(() => {
    const existemUsuarios = usuariosStore.list().length > 0;
    const sessao = sessaoStore.get();

    if (!existemUsuarios) {
      setPodeAcessar(true);
      return;
    }

    if (sessao?.isAdmin) {
      setPodeAcessar(true);
      setLogadoComoAdmin(true);
      return;
    }

    setPodeAcessar(false);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!usuario || !senha) {
      setErro("Preencha usuário e senha.");
      return;
    }
    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }
    if (usuariosStore.existe(usuario)) {
      setErro("Esse nome de usuário já existe.");
      return;
    }
    const novo = usuariosStore.criar(usuario, senha);

    if (logadoComoAdmin) {
      router.push("/usuarios");
    } else {
      sessaoStore.set(novo);
      router.push("/dashboard");
    }
  }

  if (podeAcessar === null) return null;

  if (!podeAcessar) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-500 to-gray-200 flex items-center justify-center px-5">
        <div className="w-full max-w-[450px] rounded-2xl border-2 border-gray-400 p-10 text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso restrito</h1>
          <p className="mb-6 text-sm text-slate-200">
            Somente o administrador do sistema pode cadastrar novas contas.
          </p>
          <Link href="/dashboard" className="font-bold hover:underline">
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-500 to-gray-200 flex items-center justify-center px-5">
      <div className="w-full max-w-[450px] rounded-2xl border-2 border-gray-400 p-10 text-white">
        <h1 className="text-center text-4xl font-bold mb-10">Criar Conta</h1>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="flex items-center rounded-full border-2 border-gray-400 px-5 h-[55px]">
            <input
              type="text"
              placeholder="Usuário"
              required
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="w-full bg-transparent outline-none text-white placeholder-white"
            />
          </div>

          <div className="flex items-center rounded-full border-2 border-gray-400 px-5 h-[55px]">
            <input
              type="password"
              placeholder="Senha"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full bg-transparent outline-none text-white placeholder-white"
            />
          </div>

          <div className="flex items-center rounded-full border-2 border-gray-400 px-5 h-[55px]">
            <input
              type="password"
              placeholder="Confirmar Senha"
              required
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className="w-full bg-transparent outline-none text-white placeholder-white"
            />
          </div>

          {erro && <p className="text-center text-sm text-red-300">{erro}</p>}

          <button
            type="submit"
            className="w-full rounded-full bg-white py-3 font-bold text-black transition-colors hover:bg-gray-200"
          >
            Criar Conta
          </button>

          <p className="text-center text-sm">
            {logadoComoAdmin ? (
              <Link href="/dashboard" className="font-bold hover:underline">
                Voltar ao Dashboard
              </Link>
            ) : (
              <>
                Já tem uma conta?{" "}
                <Link href="/" className="font-bold hover:underline">
                  Fazer login
                </Link>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
