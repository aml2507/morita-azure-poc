import SectionTitle from "../Common/SectionTitle";
import SingleFeature from "./SingleFeature";
import featuresData from "./featuresData";

const Features = () => {
  return (
    <section className="py-20 lg:py-25">
      <div className="container mx-auto px-4">
        {/* Título principal y explicación del problema */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-white text-center mb-4">
            ¿Por qué creamos Morita?
          </h2>
          <p className="text-lg text-white/80 text-center max-w-3xl mx-auto">
            En Latinoamérica, muchos recibimos nuestra primera tarjeta de crédito sin entender realmente cómo funcionan
            los intereses, el pago mínimo o los cargos. Esta falta de información nos puede llevar a decisiones financieras
            que afectan nuestro futuro. Morita nace para cambiar esto.
          </p>
        </div>

        {/* Grid de características */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Simple y Directo */}
          <div className="bg-[#2D1B69]/80 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <div className="text-[#FF00FF] mb-6 text-3xl">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Simple y Directo
            </h3>
            <p className="text-white/80 leading-relaxed">
              Solo sube tu resumen de tarjeta y te explicamos en lenguaje claro qué significan esos números. 
              Sin términos complicados, sin letra chica. Información que realmente puedes usar.
            </p>
          </div>

          {/* Seguridad Primero */}
          <div className="bg-[#2D1B69]/80 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <div className="text-[#FF00FF] mb-6 text-3xl">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Seguridad Primero
            </h3>
            <p className="text-white/80 leading-relaxed">
              Protegemos tus datos usando encriptación y nunca guardamos información sensible 
              de tus tarjetas. Solo extraemos los números necesarios para ayudarte a entender 
              mejor tu situación financiera.
            </p>
          </div>

          {/* Educación Real */}
          <div className="bg-[#2D1B69]/80 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <div className="text-[#FF00FF] mb-6 text-3xl">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Educación Real
            </h3>
            <p className="text-white/80 leading-relaxed">
              Te mostramos el impacto real del pago mínimo y los intereses en tu bolsillo. 
              Queremos que tomes decisiones informadas antes de que los gastos se vuelvan una carga.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
