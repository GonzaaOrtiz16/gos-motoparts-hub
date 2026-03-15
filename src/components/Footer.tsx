import { Link } from "react-router-dom";
import { MapPin, Phone, Clock, Instagram, MessageCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Footer = () => {
  const { data: categorias } = useQuery({
    queryKey: ['footer-categorias'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categorias').select('*').eq('tipo', 'repuestos').order('nombre');
      if (error) throw error;
      return data;
    }
  });

  return (
    <footer className="bg-foreground text-background">
      <div className="container py-16 md:py-20 px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          {/* Brand */}
          <div className="space-y-5">
            <h3 className="text-2xl font-display font-bold tracking-tight">
              <span className="text-primary">GOS</span> MOTOS
            </h3>
            <p className="text-sm opacity-50 leading-relaxed max-w-xs">
              Repuestos de calidad y atención personalizada en Bernal Oeste. Pasión por las dos ruedas.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="https://instagram.com/gos_motos" target="_blank" className="opacity-50 hover:opacity-100 hover:text-primary transition-all">
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-6">Repuestos</h4>
            <div className="flex flex-col gap-3">
              {categorias?.map((cat: any) => (
                <Link key={cat.id} to={`/productos?categoria=${cat.nombre}`} className="text-sm opacity-50 hover:opacity-100 hover:text-primary transition-all">
                  {cat.nombre}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-6">Contacto</h4>
            <div className="flex flex-col gap-5 text-sm">
              <div className="flex items-start gap-3 opacity-50">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>Bernal Oeste, Buenos Aires</span>
              </div>

              <a href="https://wa.me/5491165483728" target="_blank" className="flex items-center gap-3 group">
                <MessageCircle className="h-4 w-4 text-success" />
                <div>
                  <span className="text-[9px] uppercase font-bold opacity-30 block">WhatsApp</span>
                  <span className="opacity-50 group-hover:opacity-100 group-hover:text-primary transition-all">5491165483728</span>
                </div>
              </a>

              <div className="flex items-center gap-3 opacity-50 pt-3 border-t border-background/10">
                <Clock className="h-4 w-4 text-primary" />
                <span>Lun - Vie: 9:00 - 18:00<br />Sáb: 9:00 - 13:00</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] uppercase tracking-[0.3em] opacity-30">
          <span>© 2026 GOS Motos.</span>
          <span>Bernal Oeste, Buenos Aires</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
