"use client";

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';

export function useAnalysisLimit() {
  const [analysisCount, setAnalysisCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasReachedLimit, setHasReachedLimit] = useState(false);
  const MONTHLY_LIMIT = 2;

  const checkAnalysisLimit = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const now = new Date();
    const currentMonth = now.getMonth();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    try {
      const analysisRef = collection(db, 'analyses');
      const q = query(
        analysisRef,
        where('userId', '==', user.uid),
        where('createdAt', '>=', Timestamp.fromDate(startOfMonth)),
        orderBy('createdAt', 'asc'),
        orderBy('__name__', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const count = querySnapshot.size;

      // Actualizar localStorage y estado
      localStorage.setItem('monthlyAnalyses', JSON.stringify({
        count,
        month: currentMonth
      }));

      setAnalysisCount(count);
      setHasReachedLimit(count >= MONTHLY_LIMIT);

      // Si se alcanzó el límite, deshabilitar el botón
      if (count >= MONTHLY_LIMIT) {
        const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement | null;
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.classList.add('opacity-50', 'cursor-not-allowed');
        }
      }

      return count;
    } catch (error) {
      console.error('Error in checkAnalysisLimit:', error);
      return 0;
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar límite al montar y cuando cambie el usuario
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        checkAnalysisLimit();
      }
    });

    // También verificar cuando el componente se monte
    if (auth.currentUser) {
      checkAnalysisLimit();
    }

    return () => unsubscribe();
  }, []);

  // Verificar más frecuentemente
  useEffect(() => {
    const interval = setInterval(checkAnalysisLimit, 1000); // Verificar cada segundo
    return () => clearInterval(interval);
  }, []);

  return {
    analysisCount,
    hasReachedLimit,
    isLoading,
    monthlyLimit: MONTHLY_LIMIT,
    refreshLimit: checkAnalysisLimit
  };
}

export default function AnalysisLimit() {
  const { hasReachedLimit, analysisCount, monthlyLimit } = useAnalysisLimit();

  if (hasReachedLimit) {
    return (
      <div className="mb-4 p-4 bg-[#2D1B69] rounded-lg border-2 border-yellow-500/50">
        <p className="text-white text-base">
          ⚠️ Has alcanzado el límite de {monthlyLimit} análisis este mes. Podrás analizar más resúmenes el próximo mes.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-4 p-4 bg-[#2D1B69] rounded-lg border border-purple-500/50">
      <p className="text-white text-base">
        {analysisCount === 0 
          ? `Tienes ${monthlyLimit} análisis disponibles este mes`
          : analysisCount === 1
          ? "Te queda 1 análisis disponible este mes"
          : `Te quedan ${monthlyLimit - analysisCount} análisis disponibles este mes`
        }
      </p>
    </div>
  );
} 