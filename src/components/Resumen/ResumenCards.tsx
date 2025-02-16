import { formatearNumero } from '@/utils/numberFormat';

interface ResumenCardsProps {
  analysis: {
    deudaActual: number;
    pagoMinimo: number;
    fechaVencimiento: string;
    entidadBancaria: string;
  };
}

export const ResumenCards = ({ analysis }: ResumenCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-[#2D1B69] rounded-3xl p-6 flex flex-col">
        <h3 className="text-xl text-white/70">Deuda Actual</h3>
        <div className="text-[2.5rem] font-bold text-white mt-auto">
          ${formatearNumero(analysis.deudaActual)}
        </div>
      </div>

      <div className="bg-[#2D1B69] rounded-3xl p-6 flex flex-col">
        <h3 className="text-xl text-white/70">Pago Mínimo</h3>
        <div className="text-[2.5rem] font-bold text-white mt-auto">
          ${formatearNumero(analysis.pagoMinimo)}
        </div>
      </div>

      <div className="bg-[#2D1B69] rounded-3xl p-6 flex flex-col">
        <h3 className="text-xl text-white/70">
          {analysis.entidadBancaria} - Vence
        </h3>
        <div className="text-[2.5rem] font-bold text-white mt-auto">
          {analysis.fechaVencimiento}
        </div>
      </div>
    </div>
  );
}; 