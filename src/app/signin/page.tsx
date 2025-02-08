import AuthButtons from "@/components/Auth/AuthButtons";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar Sesión | Morita",
  description: "Inicia sesión en tu cuenta de Morita",
};

const SigninPage = () => {
  return (
    <div className="min-h-screen pt-24 pb-12 flex flex-col items-center">
      <div className="w-full max-w-md px-8">
        <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/10">
          <h1 className="text-3xl font-bold text-center text-white mb-2">
            Iniciar Sesión
          </h1>
          <p className="text-white/70 text-center mb-8">
            Inicia sesión para acceder a todas las funcionalidades
          </p>
          <AuthButtons />
        </div>
      </div>
    </div>
  );
};

export default SigninPage;
