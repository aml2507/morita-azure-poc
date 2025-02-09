"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import menuData from "./menuData";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import Image from "next/image";
import { signOut } from "firebase/auth";

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = () => {
    router.push("/signin");
  };

  const handleSignUp = () => {
    router.push("/signup");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Limpiar localStorage al desloguearse
      localStorage.removeItem('lastAnalysis');
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/10 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/favicon.ico" 
                alt="Morita Logo" 
                width={24} 
                height={24} 
                className="w-6 h-6"
              />
              <span className="text-2xl font-bold text-white">
                Morita .
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {menuData.map((menuItem, index) => (
              <Link
                key={index}
                href={menuItem.path || "#"}
                className={`text-white/70 hover:text-[#FF00FF] transition-colors ${
                  pathname === menuItem.path ? "text-[#FF00FF]" : ""
                }`}
              >
                {menuItem.title}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <Button 
                variant="ghost" 
                className="text-white/70 hover:text-white"
                onClick={handleLogout}
              >
                Cerrar sesión
              </Button>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  className="text-white/70 hover:text-white"
                  onClick={handleSignIn}
                >
                  Iniciar sesión
                </Button>
                <Button 
                  className="bg-[#FF00FF] hover:bg-[#7C4DFF] shadow-[0_0_20px_rgba(255,0,255,0.3)]"
                  onClick={handleSignUp}
                >
                  Registrarse
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
