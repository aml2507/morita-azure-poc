import { formatearNumero } from '@/utils/numberFormat';

interface AnalisisPagoProps {
  analysis: any;
}

export const AnalisisPago = ({ analysis }: AnalisisPagoProps) => {
  return (
    <div className="bg-[#2D1B69] rounded-3xl p-8">
      <h3 className="text-2xl text-white mb-6">¿Qué pasa si pagas solo el mínimo?</h3>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <h4 className="text-lg text-white/70 mb-2">El mes que viene...</h4>
            <p className="text-4xl font-bold text-red-400">
              $ {formatearNumero(Number(analysis.deudaActual * 1.15))}
            </p>
            <p className="text-sm text-white/50 mt-1">
              Tu deuda crecerá por los intereses acumulados
            </p>
          </div>
          <div>
            <p className="text-lg text-red-400 font-medium">
              Solo en intereses este mes: $ {formatearNumero(Number(analysis.deudaActual * 0.15))}
            </p>
            <p className="text-sm text-white/50">
              Casi todo tu pago mínimo se va en intereses, poco reduce tu deuda
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
            <h4 className="text-lg font-medium text-red-400 mb-2">⚠️ Importante entender</h4>
            <p className="text-sm text-white/70">
              Si solo pagas el mínimo (${formatearNumero(Number(analysis.pagoMinimo))}), la mayor parte va a intereses. 
              De tu pago, solo ${formatearNumero(Number(analysis.pagoMinimo * 0.15))} reduce tu deuda real.
              A este ritmo, podrías tardar más de 24 meses en cancelar tu deuda y
              terminarías pagando más del doble.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 