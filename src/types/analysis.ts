export interface AnalysisResult {
  informacionBasica: {
    entidadBancaria: string;
    numeroTarjeta: string | null;
    titular: string | null;
  };
  fechas: {
    cierre: string;
    vencimiento: string;
    proximoCierre: string | null;
  };
  montos: {
    deudaTotal: number;
    pagoMinimo: number;
    saldoAnterior: number | null;
    nuevosSaldos: number | null;
    creditoDisponible: number | null;
  };
  tasas: {
    tem: number;
    tea: number;
    cft: number;
    tna: number;
  };
  gastosYConsumos: {
    totalPeriodo: number;
    categorias: Array<{
      nombre: string;
      monto: number;
      porcentaje: number;
    }>;
  };
  planesEspeciales: {
    nombre: string | null;
    descripcion: string | null;
    requisitos: string[] | null;
    beneficios: string[] | null;
  };
  alertas: {
    cargosInusuales: string[] | null;
    tasasAltas: string[] | null;
    advertencias: string[] | null;
  };
  recomendaciones?: {
    urgentes: string[] | null;
    generales: string[] | null;
  };
  analisisFinanciero: {
    situacionActual: string;
    tendencias: string[] | null;
    riesgos: string[] | null;
    oportunidades: string[] | null;
  };
  deudaActual: number;
  fechaVencimiento: string;
  timestamp?: number;
} 