"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export function useAnalysisLimit() {
  const [analysisCount, setAnalysisCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const FREE_LIMIT = 2;

  useEffect(() => {
    async function fetchAnalysisCount() {
      if (!auth.currentUser) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "analyses"),
          where("userId", "==", auth.currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        setAnalysisCount(querySnapshot.size);
      } catch (error) {
        console.error("Error fetching analysis count:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalysisCount();
  }, []);

  return {
    analysisCount,
    remainingAnalyses: FREE_LIMIT - analysisCount,
    hasReachedLimit: analysisCount >= FREE_LIMIT,
    loading
  };
}

export default function AnalysisLimit() {
  const { remainingAnalyses, loading } = useAnalysisLimit();

  if (loading) return null;

  return (
    <div className="text-center mb-4">
      <p className="text-white/70">
        Te quedan <span className="text-[#FF00FF] font-bold">{remainingAnalyses}</span> análisis gratuitos
      </p>
    </div>
  );
} 