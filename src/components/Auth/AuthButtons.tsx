"use client";

import { auth } from "@/lib/firebase";
import { 
  signInWithPopup, 
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification 
} from "firebase/auth";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AuthButtons() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  
  const isSignUp = pathname === "/signup";

  const handleGoogleAuth = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/resumen");
    } catch (error) {
      setError("Error al autenticar con Google");
      console.error(error);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    
    try {
      if (isSignUp) {
        // Validar que las contraseñas coincidan
        if (password !== confirmPassword) {
          setError("Las contraseñas no coinciden");
          return;
        }

        // Validar longitud mínima de contraseña
        if (password.length < 6) {
          setError("La contraseña debe tener al menos 6 caracteres");
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Enviar email de verificación
        await sendEmailVerification(userCredential.user);
        
        setMessage("¡Registro exitoso! Por favor, verifica tu correo electrónico para continuar.");
        
        // Esperar un momento antes de redirigir para que el usuario pueda leer el mensaje
        setTimeout(() => {
          router.push("/signin");
        }, 3000);

      } else {
        await signInWithEmailAndPassword(auth, email, password);
        router.push("/resumen");
      }
    } catch (error: any) {
      setError(
        error.code === "auth/email-already-in-use"
          ? "Este email ya está registrado"
          : error.code === "auth/weak-password"
          ? "La contraseña es muy débil"
          : "Error en la autenticación"
      );
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="mb-4 rounded-lg bg-red-500/20 p-4 text-red-200 backdrop-blur-sm">
          {error}
        </div>
      )}
      
      {message && (
        <div className="mb-4 rounded-lg bg-green-500/20 p-4 text-green-200 backdrop-blur-sm">
          {message}
        </div>
      )}
      
      <button
        onClick={handleGoogleAuth}
        className="flex items-center justify-center gap-3 rounded-lg bg-white/10 backdrop-blur-sm px-6 py-3 text-white hover:bg-white/20 transition-all"
      >
        <img src="/google-icon.svg" alt="Google" className="h-5 w-5" />
        Continuar con Google
      </button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-transparent px-4 text-white/50">
            O usa tu email
          </span>
        </div>
      </div>

      <form onSubmit={handleEmailAuth} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/10 backdrop-blur-sm p-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#FF00FF]/50"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/10 backdrop-blur-sm p-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#FF00FF]/50"
          required
        />
        {isSignUp && (
          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/10 backdrop-blur-sm p-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#FF00FF]/50"
            required
          />
        )}
        <button
          type="submit"
          className="rounded-lg bg-[#FF00FF] px-6 py-3 text-white hover:bg-[#FF00FF]/90 transition-all shadow-[0_0_20px_rgba(255,0,255,0.3)]"
        >
          {isSignUp ? "Registrarse" : "Iniciar sesión"}
        </button>
      </form>
    </div>
  );
} 