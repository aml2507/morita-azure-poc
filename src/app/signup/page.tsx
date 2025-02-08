import AuthButtons from "@/components/Auth/AuthButtons";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registrarse | Morita",
  description: "Crea una cuenta en Morita",
};

const SignupPage = () => {
  return (
    <div className="min-h-screen pt-24 pb-12 flex flex-col items-center">
      <div className="w-full max-w-md px-8">
        <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/10">
          <h1 className="text-3xl font-bold text-center text-white mb-2">
            Crear Cuenta
          </h1>
          <p className="text-white/70 text-center mb-8">
            Regístrate para comenzar tu viaje financiero
          </p>
          <AuthButtons />
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
