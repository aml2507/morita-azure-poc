import { formatearNumero } from '@/utils/numberFormat';

interface ResumenCardsProps {
  analysis: any;
}

export const ResumenCards = ({ analysis }: ResumenCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-[#2D1B69] rounded-3xl p-6 flex flex-col">
        <h3 className="text-xl text-white/70">DeudActual</h3>
        <div className="text-[2.5rem] font-bold text-white mt-auto">
          ${formatearNumero(Number(analysis.deudaActual))}
        </div>
      </div>

      <div className="bg-[#2D1B69] rounded-3xl p-6 flex flex-col">
        <h3 className="text-xl text-white/70">Pago Mínimo</h3>
        <div className="text-[2.5rem] font-bold text-white mt-auto">
          ${formatearNumero(Number(analysis.pagoMinimo))}
        </div>
      </div>

      <div className="bg-[#2D1B69] rounded-3xl p-6 flex flex-col">
        <h3 className="text-xl text-white/70">Vencimiento</h3>
        <div className="text-[2.5rem] font-bold text-white mt-auto whitespace-nowrap">
          {analysis.fechaVencimiento}
        </div>
      </div>
    </div>
  );
}; 