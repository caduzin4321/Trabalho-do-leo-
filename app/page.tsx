"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usuariosStore, sessaoStore } from "@/lib/users";

export default function Home() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const encontrado = usuariosStore.autenticar(usuario, senha);
    if (!encontrado) {
      setErro("Usuário ou senha incorretos.");
      return;
    }
    sessaoStore.set(encontrado);
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-500 to-gray-200 flex items-center justify-center px-5">
      <div className="w-full max-w-[450px] rounded-2xl border-2 border-gray-400 p-10 text-white">
        <h1 className="text-center text-4xl font-bold mb-10">Login</h1>

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

          {erro && <p className="text-center text-sm text-red-300">{erro}</p>}

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" /> Lembre-me
            </label>
            <Link href="/forgot-password" className="font-bold hover:underline">
              Esqueceu a senha?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-white py-3 font-bold text-black transition-colors hover:bg-gray-200"
          >
            Login
          </button>

          <p className="text-center text-sm">
            Não tem uma conta?{" "}
            <Link href="/register" className="font-bold hover:underline">
              Criar uma conta
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}