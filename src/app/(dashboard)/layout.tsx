'use client';

import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

function LoadingScreen() {
  return (
    <div className="min-h-[calc(100vh-80px)] pt-20 flex items-center justify-center bg-[#0A0118]">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FF00FF]"></div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Redirigir a signin si no está autenticado
        const returnUrl = encodeURIComponent(pathname);
        router.replace(`/signin?returnUrl=${returnUrl}`);
      } else {
        setIsAuthenticated(true);
      }
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, [pathname, router]);

  // No mostrar nada hasta que se verifique la autenticación
  if (!authChecked) {
    return <LoadingScreen />;
  }

  // Solo mostrar el contenido si está autenticado
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-80px)] pt-20 relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 bg-[#0A0118]"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
} 