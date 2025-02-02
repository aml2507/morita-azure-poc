import { Feature } from "@/types/feature";

const featuresData: Feature[] = [
  {
    id: 1,
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" className="fill-current">
        <path opacity="0.5" d="M20 30a10 10 0 100-20 10 10 0 000 20zm0-18a8 8 0 110 16 8 8 0 010-16z"/>
        <path d="M20 24a4 4 0 100-8 4 4 0 000 8z"/>
      </svg>
    ),
    title: "Análisis Inteligente",
    paragraph: "Morita analiza automáticamente tus gastos, identificando patrones y categorizando cada transacción para darte una visión clara de tus finanzas.",
  },
  {
    id: 2,
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" className="fill-current">
        <path opacity="0.5" d="M20 32c6.627 0 12-5.373 12-12S26.627 8 20 8 8 13.373 8 20s5.373 12 12 12z"/>
        <path d="M20 28a8 8 0 100-16 8 8 0 000 16zm1-12h-2v4h-4v2h6v-6z"/>
      </svg>
    ),
    title: "Consejos Personalizados",
    paragraph: "Recibe recomendaciones específicas basadas en tus hábitos de gasto. Morita te ayuda a tomar mejores decisiones financieras.",
  },
  {
    id: 3,
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" className="fill-current">
        <path opacity="0.5" d="M26 8H14v24h12V8zM12 8H6v24h6V8zm14 0h6v24h-6V8z"/>
        <path d="M18 16h4v8h-4v-8z"/>
      </svg>
    ),
    title: "Seguimiento de Gastos",
    paragraph: "Visualiza tus gastos mensuales de forma clara y organizada. Identifica áreas de mejora y oportunidades de ahorro.",
  },
  {
    id: 4,
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" className="fill-current">
        <path opacity="0.5" d="M20 9C12.268 9 6 15.268 6 23s6.268 14 14 14 14-6.268 14-14S27.732 9 20 9z"/>
        <path d="M18 28v-9h-3l5-6 5 6h-3v9h-4z"/>
      </svg>
    ),
    title: "Educación Financiera",
    paragraph: "Aprende mientras gestionas tus finanzas. Morita te explica conceptos financieros importantes y te ayuda a desarrollar mejores hábitos.",
  },
  {
    id: 5,
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" className="fill-current">
        <path opacity="0.5" d="M8 12h24v16H8V12z"/>
        <path d="M14 16h12v8H14v-8z"/>
      </svg>
    ),
    title: "Fácil de Usar",
    paragraph: "Simplemente sube tu resumen de tarjeta y Morita se encarga del resto. Interfaz intuitiva diseñada para todos los niveles de experiencia.",
  },
  {
    id: 6,
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" className="fill-current">
        <path opacity="0.5" d="M20 8c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12S26.627 8 20 8z"/>
        <path d="M20 24c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
      </svg>
    ),
    title: "Privacidad y Seguridad",
    paragraph: "Tu información financiera está segura con nosotros. Utilizamos encriptación de nivel bancario y nunca compartimos tus datos.",
  },
];

export default featuresData;
