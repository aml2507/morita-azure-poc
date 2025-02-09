"use client";

import { auth } from "@/lib/firebase";
import { 
  signInWithPopup, 
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail
} from "firebase/auth";
import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function AuthButtons() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/resumen';
  
  const isSignUp = pathname === "/signup";

  const setAuthCookie = async (user: any) => {
    const idToken = await user.getIdToken();
    // Establecer la cookie
    document.cookie = `firebase-token=${idToken}; path=/; max-age=3600; SameSite=Strict`;
  };

  const handleGoogleAuth = async () => {
    try {
      setIsLoading(true);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        await setAuthCookie(result.user);
        toast.success("Inicio de sesión exitoso");
        window.location.href = returnUrl;
      }
    } catch (error: any) {
      console.error('Error de autenticación:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Ventana de autenticación cerrada');
      } else {
        toast.error("Error al autenticar con Google");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          toast.error("Las contraseñas no coinciden");
          return;
        }

        if (password.length < 6) {
          toast.error("La contraseña debe tener al menos 6 caracteres");
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        toast.success("Se ha enviado un correo de verificación a tu email");
        
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        if (!userCredential.user.emailVerified) {
          await sendEmailVerification(userCredential.user);
          toast.error("Por favor verifica tu email antes de iniciar sesión");
          await auth.signOut();
          return;
        }

        await setAuthCookie(userCredential.user);
        toast.success("Inicio de sesión exitoso");
        window.location.href = returnUrl;
      }
    } catch (error: any) {
      console.error('Error:', error);
      if (error.code === 'auth/wrong-password') {
        toast.error('Contraseña incorrecta');
      } else if (error.code === 'auth/user-not-found') {
        toast.error('Usuario no encontrado');
      } else {
        toast.error('Error al iniciar sesión');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast.error("Por favor ingresa tu email");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Se ha enviado un correo para restablecer tu contraseña");
    } catch (error) {
      toast.error("Error al enviar el correo de restablecimiento");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={handleGoogleAuth}
        disabled={isLoading}
        className="flex items-center justify-center gap-3 rounded-lg bg-white/10 backdrop-blur-sm px-6 py-3 text-white hover:bg-white/20 transition-all disabled:opacity-50"
      >
        <Image
          src="/google-icon.svg"
          alt="Google"
          width={24}
          height={24}
          className="h-5 w-5"
        />
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
          disabled={isLoading}
          className="rounded-lg border border-white/10 bg-white/10 backdrop-blur-sm p-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#FF00FF]/50 disabled:opacity-50"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          className="rounded-lg border border-white/10 bg-white/10 backdrop-blur-sm p-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#FF00FF]/50 disabled:opacity-50"
          required
        />
        {isSignUp && (
          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            className="rounded-lg border border-white/10 bg-white/10 backdrop-blur-sm p-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#FF00FF]/50 disabled:opacity-50"
            required
          />
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-[#FF00FF] px-6 py-3 text-white hover:bg-[#FF00FF]/90 transition-all shadow-[0_0_20px_rgba(255,0,255,0.3)] disabled:opacity-50"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : (
            isSignUp ? "Registrarse" : "Iniciar sesión"
          )}
        </button>

        {!isSignUp && (
          <button
            type="button"
            onClick={handleResetPassword}
            disabled={isLoading}
            className="text-sm text-white/50 hover:text-white transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </button>
        )}
      </form>
    </div>
  );
} 