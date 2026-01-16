"use client";

// POC: Autenticación deshabilitada - sin límite de análisis
export function useAnalysisLimit() {
  return {
    analysisCount: 0,
    hasReachedLimit: false,
    isLoading: false,
    monthlyLimit: 999,
    refreshLimit: async () => {}
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