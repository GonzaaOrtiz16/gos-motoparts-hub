import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Search, Truck, Shield, CreditCard, ArrowRight, Volume2, VolumeX, Flame, Star, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const easeOut = [0.22, 1, 0.36, 1] as const;

const Home = () => {
  const [q, setQ] = useState("");
  const [isMuted, setIsMuted] = useState(true);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    const t = setTimeout(() => setHeroLoaded(true), 150);
    return () => clearTimeout(t);
  }, []);

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
      {/* ─── CINEMATIC HERO ─── */}
      <section ref={heroRef} className="relative h-[92vh] md:h-screen flex items-end overflow-hidden">
        <motion.div style={{ scale: heroScale }} className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground/95 to-primary/20" />
          {/* Geometric accents */}
          <div className="absolute -right-[15%] top-[10%] w-[50%] h-[80%] bg-primary/8 rounded-[100px] blur-3xl" />
          <div className="absolute left-[5%] bottom-[5%] w-[30%] h-[40%] bg-primary/5 rounded-full blur-2xl" />
        </motion.div>

        <motion.div style={{ opacity: heroOpacity }} className="container relative z-10 px-6 md:px-12 pb-16 md:pb-28">
          <div className="max-w-3xl">
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={heroLoaded ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.3, ease: easeOut }}
              className="text-primary text-[10px] md:text-xs tracking-[0.5em] font-bold uppercase mb-6"
            >
              <Star size={10} className="inline mr-2" fill="currentColor" />
              Repuestos & Accesorios
            </motion.p>

            <h2 className="text-primary-foreground leading-[0.9] mb-8">
              <motion.span
                initial={{ opacity: 0, y: 40 }}
                animate={heroLoaded ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.9, delay: 0.5, ease: easeOut }}
                className="block text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight"
              >
                Todo para
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 40 }}
                animate={heroLoaded ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.9, delay: 0.7, ease: easeOut }}
                className="block text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight text-primary italic"
              >
                tu moto
              </motion.span>
            </h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={heroLoaded ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="text-muted-foreground text-sm md:text-base font-light max-w-md leading-relaxed mb-10"
            >
              Repuestos originales, accesorios premium y todo lo que necesitás. Envíos a todo el país.
            </motion.p>

            <motion.form
              initial={{ opacity: 0, y: 16 }}
              animate={heroLoaded ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 1.1 }}
              onSubmit={handleSearch}
              className="flex max-w-md bg-card/10 backdrop-blur-sm border border-border/20 rounded-xl p-1"
            >
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="¿Qué estás buscando?"
                className="flex-1 px-5 py-3.5 text-primary-foreground placeholder:text-muted-foreground bg-transparent outline-none text-sm"
              />
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-6">
                <Search className="h-4 w-4" />
              </Button>
            </motion.form>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={heroLoaded ? { opacity: 0.4 } : {}}
          transition={{ delay: 1.8, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        >
          <div className="w-px h-10 bg-primary-foreground animate-pulse" />
          <p className="text-[7px] text-primary-foreground tracking-[0.4em] uppercase font-bold">Scroll</p>
        </motion.div>
      </section>

      {/* ─── TRUST STRIP ─── */}
      <section className="border-b border-border">
        <div className="container py-8 md:py-10 px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { icon: Truck, val: "Nacional", label: "Cobertura de envíos" },
              { icon: Shield, val: "100%", label: "Calidad garantizada" },
              { icon: CreditCard, val: "Flexible", label: "Formas de pago" },
              { icon: Package, val: `${products.length}+`, label: "Productos disponibles" },
            ].map(({ icon: Icon, val, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: easeOut }}
                className="flex items-center gap-4"
              >
                <div className="bg-accent p-3 rounded-xl">
                  <Icon className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-lg font-display font-bold text-foreground">{val}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CATEGORÍAS ─── */}
      <section className="container py-20 md:py-28 px-6 md:px-12">
        <SectionTitle eyebrow="Navegá por" title="Categorías" link="/productos" />

        {categories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-8">
            {categories.map((cat: any, i: number) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: easeOut }}
              >
                <Link to={`/productos?categoria=${cat.nombre}`} className="group block">
                  <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-muted relative">
                    {cat.image ? (
                      <img src={cat.image} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" alt={cat.nombre} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-accent text-accent-foreground font-display font-bold text-3xl">
                        {cat.nombre[0]}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <p className="text-primary-foreground text-sm font-bold tracking-wide">{cat.nombre}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center border-2 border-dashed border-border rounded-2xl">
            <p className="text-muted-foreground text-sm">Creá categorías desde el panel Admin</p>
          </div>
        )}
      </section>

      {/* ─── OFERTAS ─── */}
      <section className="bg-accent/30 py-20 md:py-28">
        <div className="container px-6 md:px-12">
          <SectionTitle eyebrow="Los mejores precios" title="Ofertas destacadas" icon={Flame} />

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="aspect-[3/4] bg-muted animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8">
              {featured.slice(0, 4).map((p: any, i: number) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: easeOut }}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-border rounded-2xl bg-card">
              <p className="text-muted-foreground text-sm">Próximamente nuevas ofertas</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── ENVÍO GRATIS ─── */}
      <section className="container py-20 md:py-28 px-6 md:px-12">
        <SectionTitle eyebrow="Envío sin cargo" title="Productos seleccionados" icon={Truck} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8">
          {!isLoading && freeShipping.length > 0 ? (
            freeShipping.slice(0, 4).map((p: any, i: number) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: easeOut }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))
          ) : (
            <p className="col-span-full text-center text-muted-foreground py-12 bg-muted rounded-2xl text-sm">
              Consultá costos de envío por WhatsApp
            </p>
          )}
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="container px-6 md:px-12 pb-20 md:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: easeOut }}
          className="relative overflow-hidden bg-foreground rounded-3xl p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/10 rounded-l-[100px] blur-3xl" />
          <div className="relative z-10">
            <h3 className="text-3xl md:text-4xl font-display font-bold text-background tracking-tight mb-3">
              Explorá todo el catálogo
            </h3>
            <p className="text-muted-foreground text-sm">Encontrá el repuesto que necesitás para tu moto</p>
          </div>
          <Link to="/productos" className="relative z-10">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground h-14 px-10 rounded-xl text-sm font-bold shadow-xl shadow-primary/30 group transition-all duration-300">
              Ver Catálogo
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* ─── BANNER MULTIMEDIA ─── */}
      {siteSettings?.home_media_url && (
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative w-full h-[50vh] md:h-[65vh] overflow-hidden"
        >
          {siteSettings.home_media_type === 'video' ? (
            <>
              <video ref={videoRef} src={siteSettings.home_media_url} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />
              <button
                onClick={handleToggleSound}
                className="absolute top-6 right-6 z-20 flex items-center gap-2 bg-card/80 backdrop-blur-sm hover:bg-card text-foreground px-4 py-2.5 rounded-full text-xs font-medium shadow-lg transition-colors"
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                <span className="hidden sm:inline">{isMuted ? "Activar sonido" : "Silenciar"}</span>
              </button>
            </>
          ) : (
            <img src={siteSettings.home_media_url} alt="Banner GOS Motos" className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-foreground/20" />
          <div className="absolute bottom-10 left-8 md:bottom-16 md:left-12 z-10">
            <h3 className="text-2xl md:text-4xl font-display font-bold text-primary-foreground leading-tight mb-2">
              Potenciamos <span className="text-primary italic">tu viaje</span>
            </h3>
            <p className="text-muted-foreground text-xs md:text-sm">
              Repuestos originales · Envíos a todo el país
            </p>
          </div>
        </motion.section>
      )}

      {/* Breathable spacing before footer */}
      <div className="h-8" />
    </div>
  );
};

/* ─── Reusable Section Title ─── */
function SectionTitle({ eyebrow, title, link, icon: Icon }: { eyebrow: string; title: string; link?: string; icon?: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mb-12 md:mb-16"
    >
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {Icon && <Icon size={14} className="text-primary" />}
            <p className="text-[9px] tracking-[0.5em] font-bold uppercase text-muted-foreground">{eyebrow}</p>
          </div>
          <h3 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-foreground">{title}</h3>
        </div>
        {link && (
          <Link to={link} className="text-xs font-bold text-primary hover:underline flex items-center gap-1 pb-1">
            Ver todo <ArrowRight size={14} />
          </Link>
        )}
      </div>
      <div className="w-16 h-[2px] bg-primary mt-4" />
    </motion.div>
  );
}

export default Home;
