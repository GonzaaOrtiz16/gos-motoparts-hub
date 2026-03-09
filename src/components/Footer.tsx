import { Link } from "react-router-dom";
import { MapPin, Phone, Clock, Instagram, MessageCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Footer = () => {
  const { data: categorias } = useQuery({
    queryKey: ['footer-categorias'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .eq('tipo', 'repuestos')
        .order('nombre');
      if (error) throw error;
      return data;
    }
  });

  return (
    <footer className="bg-foreground text-background mt-16">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Columna 1: Marca */}
          <div className="space-y-4">
            <h3 className="text-2xl font-display font-bold tracking-tighter">
              <span className="text-primary">GOS</span> MOTOS
            </h3>
            <p className="text-sm opacity-70 leading-relaxed">
              Repuestos de calidad y atención personalizada en Bernal Oeste. Pasión por las dos ruedas @gos_motos.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="https://instagram.com/gos_motos" target="_blank" className="hover:text-primary transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Columna 2: Categorías Dinámicas */}
          <div>
            <h4 className="font-bold mb-4 text-xs uppercase tracking-[0.2em] text-primary">Repuestos</h4>
            <div className="flex flex-col gap-3 text-sm opacity-70">
              {categorias?.map((cat: any) => (
                <Link key={cat.id} to={`/productos?categoria=${cat.nombre}`} className="hover:text-primary transition-colors">
                  {cat.nombre}
                </Link>
              ))}
            </div>
          </div>

          {/* Columna 3: Contacto */}
          <div>
            <h4 className="font-bold mb-4 text-xs uppercase tracking-[0.2em] text-primary">Contacto</h4>
            <div className="flex flex-col gap-4 text-sm">
              <div className="flex items-start gap-3 opacity-70">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <span>Bernal Oeste, Buenos Aires</span>
              </div>
              
              <a href="https://wa.me/5491165483728" target="_blank" className="flex items-center gap-3 group">
                <MessageCircle className="h-5 w-5 text-success" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold opacity-50">WhatsApp</span>
                  <span className="group-hover:text-primary transition-colors">5491165483728</span>
                </div>
              </a>

              <div className="flex items-center gap-3 opacity-70 pt-2 border-t border-muted/10">
                <Clock className="h-5 w-5 text-primary" />
                <span>Lun - Vie: 9:00 - 18:00<br />Sáb: 9:00 - 13:00</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-muted/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest opacity-40">
          <span>© 2026 GOS Motos.</span>
          <span>Bernal Oeste, Buenos Aires</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
