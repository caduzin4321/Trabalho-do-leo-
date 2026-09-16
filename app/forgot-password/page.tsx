import Link from "next/link";

export default function ForgotPassword() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-500 to-gray-200 flex items-center justify-center px-5">
      <div className="w-full max-w-[450px] rounded-2xl border-2 border-gray-400 p-10 text-white">
        <h1 className="text-center text-4xl font-bold mb-4">
          Esqueci minha senha
        </h1>

        <p className="text-center text-sm text-gray-200 mb-10">
          Digite seu e-mail e enviaremos um link para você redefinir sua senha.
        </p>

        <form className="space-y-6">
          <div className="flex items-center rounded-full border-2 border-gray-400 px-5 h-[55px]">
            <input
              type="email"
              placeholder="E-mail"
              required
              className="w-full bg-transparent outline-none text-white placeholder-white"
            />

            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
          </div>

          <button
            type="submit"
            className="w-full h-[50px] rounded-full bg-white text-gray-800 font-bold hover:bg-gray-200 transition"
          >
            Enviar link
          </button>

          <p className="text-center text-sm pt-2">
            <Link href="/" className="font-bold hover:underline">
              ← Voltar para o login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
