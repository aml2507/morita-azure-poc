"use client";

import { useEffect, useState } from "react";

export function useAnalysisLimit() {
  const [hasReachedLimit, setHasReachedLimit] = useState(false);

  useEffect(() => {
    const checkLimit = () => {
      // Obtener el mes actual
      const currentMonth = new Date().getMonth();
      
      // Obtener análisis guardados del localStorage
      const savedAnalyses = JSON.parse(localStorage.getItem('monthlyAnalyses') || '{}');
      
      // Si el mes guardado es diferente al actual, resetear el contador
      if (savedAnalyses.month !== currentMonth) {
        localStorage.setItem('monthlyAnalyses', JSON.stringify({
          month: currentMonth,
          count: 0
        }));
        setHasReachedLimit(false);
        return;
      }

      // Verificar si se alcanzó el límite
      setHasReachedLimit(savedAnalyses.count >= 2);
    };

    checkLimit();
  }, []);

  const incrementAnalysisCount = () => {
    const savedAnalyses = JSON.parse(localStorage.getItem('monthlyAnalyses') || '{}');
    const currentMonth = new Date().getMonth();
    
    const newCount = (savedAnalyses.month === currentMonth ? savedAnalyses.count : 0) + 1;
    
    localStorage.setItem('monthlyAnalyses', JSON.stringify({
      month: currentMonth,
      count: newCount
    }));

    setHasReachedLimit(newCount >= 2);
  };

  return { hasReachedLimit, incrementAnalysisCount };
}

export default function AnalysisLimit() {
  const { hasReachedLimit } = useAnalysisLimit();

  return (
    <div className="text-center mb-4">
      <p className="text-white/70">
        {hasReachedLimit ? "Has alcanzado el límite de 2 análisis por mes" : "Te quedan análisis gratuitos"}
      </p>
    </div>
  );
} 