import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Search, Truck, Shield, CreditCard, ArrowRight, Volume2, VolumeX, Flame, Star, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const Home = () => {
  const [q, setQ] = useState("");
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const handleToggleSound = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
      if (!newMuted) videoRef.current.play().catch(() => {});
    }
  };

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['public-products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categorias', 'repuestos'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categorias').select('*').eq('tipo', 'repuestos').order('nombre');
      if (error) throw error;
      return data;
    }
  });

  const { data: siteSettings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('site_settings').select('*').limit(1).single();
      if (error) throw error;
      return data;
    }
  });

  const featured = products.filter((p: any) => p.is_on_sale === true);
  const freeShipping = products.filter((p: any) => p.free_shipping === true);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate(`/productos?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero — full-bleed diagonal split */}
      <section ref={heroRef} className="relative min-h-[80vh] flex items-center overflow-hidden">
        <motion.div style={{ scale: heroScale }} className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground/95 to-primary/30" />
        {/* Decorative diagonal */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-[20%] top-0 w-[70%] h-full bg-primary/10 skew-x-[-12deg] origin-top-right" />
          <div className="absolute -right-[10%] bottom-0 w-[40%] h-[60%] bg-primary/5 skew-x-[8deg]" />
        </div>

        <motion.div style={{ opacity: heroOpacity }} className="container relative z-10 py-20 md:py-32 px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6">
                <Star size={12} fill="currentColor" /> Repuestos & Accesorios
              </motion.div>
              <motion.h2 variants={fadeUp} className="text-4xl md:text-7xl font-black text-primary-foreground leading-[0.95] mb-6">
                Todo para <br />
                <span className="text-primary">tu moto</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-muted-foreground text-base md:text-lg mb-10 max-w-md leading-relaxed">
                Encontrá repuestos originales, accesorios y todo lo que necesitás. Envíos a todo el país.
              </motion.p>
              <motion.form variants={fadeUp} onSubmit={handleSearch} className="flex max-w-md bg-card/10 backdrop-blur-sm border border-border/20 rounded-xl p-1">
                <input
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder="¿Qué estás buscando?"
                  className="flex-1 px-4 py-3 text-primary-foreground placeholder:text-muted-foreground bg-transparent outline-none text-sm font-medium"
                />
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-6 font-bold">
                  <Search className="h-4 w-4" />
                </Button>
              </motion.form>
            </motion.div>

            {/* Stats column */}
            <motion.div initial="hidden" animate="visible" variants={stagger} className="hidden md:grid grid-cols-2 gap-4">
              {[
                { icon: Truck, val: "Nacional", label: "Cobertura de envíos" },
                { icon: Shield, val: "100%", label: "Calidad garantizada" },
                { icon: CreditCard, val: "Flexible", label: "Formas de pago" },
                { icon: Package, val: `${products.length}+`, label: "Productos disponibles" },
              ].map(({ icon: Icon, val, label }) => (
                <motion.div key={label} variants={fadeUp} className="bg-card/5 backdrop-blur-sm border border-border/10 rounded-2xl p-5 text-center group hover:bg-primary/10 transition-colors duration-300">
                  <Icon className="h-5 w-5 text-primary mx-auto mb-3" />
                  <p className="text-2xl font-black text-primary-foreground">{val}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">{label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Trust strip — mobile */}
      <section className="md:hidden bg-muted/50 border-b">
        <div className="container py-4 px-6 flex items-center justify-around">
          {[
            { icon: Truck, t: "Envíos" },
            { icon: Shield, t: "Garantía" },
            { icon: CreditCard, t: "Pagos" },
          ].map(({ icon: Icon, t }) => (
            <div key={t} className="flex flex-col items-center gap-1">
              <Icon className="h-4 w-4 text-primary" />
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{t}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Categorías — horizontal scroll cards */}
      <section className="container py-16 px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}>
          <motion.div variants={fadeUp} className="flex items-center justify-between mb-8">
            <div>
              <p className="text-primary text-xs font-black uppercase tracking-[0.15em] mb-1">Navegá por</p>
              <h3 className="text-2xl md:text-3xl font-black tracking-tight">Categorías</h3>
            </div>
            <Link to="/productos" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              Ver todas <ArrowRight size={14} />
            </Link>
          </motion.div>

          {categories.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 snap-x snap-mandatory scrollbar-hide">
              {categories.map((cat: any) => (
                <motion.div key={cat.id} variants={fadeUp} className="snap-start flex-shrink-0 w-[140px] md:w-[180px]">
                  <Link to={`/productos?categoria=${cat.nombre}`} className="group block">
                    <div className="aspect-square rounded-2xl overflow-hidden bg-muted border-2 border-transparent group-hover:border-primary transition-all duration-300 mb-3 relative">
                      {cat.image ? (
                        <img src={cat.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={cat.nombre} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-accent text-accent-foreground font-black text-2xl">
                          {cat.nombre[0]}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-xs font-bold text-center text-foreground">{cat.nombre}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center border-2 border-dashed border-border rounded-2xl">
              <p className="text-muted-foreground text-sm font-medium">Creá categorías desde el panel Admin</p>
            </div>
          )}
        </motion.div>
      </section>

      {/* Ofertas — accent bg section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={stagger}
        className="bg-accent/50 py-16 px-6"
      >
        <div className="container">
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-10">
            <div className="bg-primary text-primary-foreground p-2.5 rounded-xl">
              <Flame size={20} />
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-black tracking-tight">Ofertas destacadas</h3>
              <p className="text-xs text-muted-foreground font-medium">Los mejores precios en repuestos seleccionados</p>
            </div>
            <Link to="/productos" className="ml-auto">
              <Button variant="outline" size="sm" className="font-bold text-xs">
                Ver más <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="h-72 bg-muted animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {featured.slice(0, 4).map((p: any) => (
                <motion.div key={p.id} variants={fadeUp}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center border-2 border-dashed border-border rounded-2xl bg-card">
              <p className="text-muted-foreground font-medium text-sm">Próximamente nuevas ofertas</p>
            </div>
          )}
        </div>
      </motion.section>

      {/* Envío Gratis */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={stagger}
        className="container py-16 px-6"
      >
        <motion.div variants={fadeUp} className="flex items-center gap-3 mb-10">
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="bg-success/10 text-success p-2.5 rounded-xl"
          >
            <Truck size={20} />
          </motion.div>
          <div>
            <h3 className="text-2xl md:text-3xl font-black tracking-tight">Envío sin cargo</h3>
            <p className="text-xs text-muted-foreground font-medium">Productos seleccionados con envío gratis a todo el país</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {!isLoading && freeShipping.length > 0 ? (
            freeShipping.slice(0, 4).map((p: any) => (
              <motion.div key={p.id} variants={fadeUp}>
                <ProductCard product={p} />
              </motion.div>
            ))
          ) : (
            <motion.p variants={fadeUp} className="col-span-full text-center text-muted-foreground py-10 font-medium text-sm bg-muted rounded-2xl">
              Consultá costos de envío por WhatsApp
            </motion.p>
          )}
        </div>
      </motion.section>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="container px-6 pb-16"
      >
        <div className="bg-foreground rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl md:text-3xl font-black text-background tracking-tight mb-2">
              Explorá todo el catálogo
            </h3>
            <p className="text-muted-foreground text-sm">Encontrá el repuesto que necesitás para tu moto</p>
          </div>
          <Link to="/productos">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground h-14 px-10 rounded-2xl text-base font-black shadow-xl shadow-primary/30 group">
              Ver Catálogo
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Banner Multimedia */}
      {siteSettings?.home_media_url && (
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden"
        >
          {siteSettings.home_media_type === 'video' ? (
            <>
              <video ref={videoRef} src={siteSettings.home_media_url} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />
              <button
                onClick={handleToggleSound}
                className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-card/80 backdrop-blur-sm hover:bg-card text-foreground px-4 py-2.5 rounded-full text-xs font-bold shadow-lg transition-colors"
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                <span className="hidden sm:inline">{isMuted ? "Activar sonido" : "Silenciar"}</span>
              </button>
            </>
          ) : (
            <img src={siteSettings.home_media_url} alt="Banner GOS Motos" className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-foreground/20" />
          <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 z-10">
            <h3 className="text-xl md:text-3xl font-black text-primary-foreground leading-tight mb-1">
              Potenciamos <span className="text-primary">tu viaje</span>
            </h3>
            <p className="text-muted-foreground text-xs md:text-sm">
              Repuestos originales · Envíos a todo el país
            </p>
          </div>
        </motion.section>
      )}
    </div>
  );
};

export default Home;
