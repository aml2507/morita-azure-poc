'use client';

import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

function LoadingScreen() {
  return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-[#0A0118]">
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const isAuthPage = pathname.includes('/signin') || pathname.includes('/signup');
      
      if (!user && !isAuthPage) {
        // Si no hay usuario y no estamos en una página de auth, redirigir a login
        const returnUrl = encodeURIComponent(pathname);
        window.location.href = `/signin?returnUrl=${returnUrl}`;
        return;
      }
      
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, [pathname]);

  if (!authChecked) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#0A0118]">
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.15 }}
          className="pt-16"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
} 