import { Instagram, Phone, MapPin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#0b0b0b] border-t-4 border-red-600 py-12 mt-auto">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Branding */}
        <div className="space-y-4">
          <h2 className="text-3xl font-display italic text-red-600 tracking-tighter">GOS MOTOS</h2>
          <p className="text-gray-400 font-body text-sm leading-relaxed max-w-xs">
            Especialistas en repuestos de alta gama y competición. Potenciamos tu pasión sobre dos ruedas.
          </p>
        </div>

        {/* Contacto */}
        <div className="space-y-4">
          <h4 className="text-lg font-display tracking-widest text-white border-b border-red-600/30 pb-1 inline-block uppercase">Contacto</h4>
          <ul className="space-y-3 text-sm font-body text-gray-400">
            <li className="flex items-center gap-3">
              <Phone size={16} className="text-red-600" /> 5491165483728
            </li>
            <li className="flex items-center gap-3">
              <Instagram size={16} className="text-red-600" /> @gos_motos
            </li>
            <li className="flex items-center gap-3">
              <MapPin size={16} className="text-red-600" /> Bernal Oeste, Buenos Aires
            </li>
          </ul>
        </div>

        {/* Horarios */}
        <div className="space-y-4">
          <h4 className="text-lg font-display tracking-widest text-white border-b border-red-600/30 pb-1 inline-block uppercase">Atención</h4>
          <div className="space-y-1 text-sm font-body text-gray-400 italic">
            <p>Lunes a Viernes: 09:00 - 18:00hs</p>
            <p>Sábados: 09:00 - 13:00hs</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
