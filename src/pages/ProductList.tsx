import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const easeOut = [0.22, 1, 0.36, 1] as const;

const priceRanges = [
  { label: "Hasta $20.000", min: 0, max: 20000 },
  { label: "$20.000 - $50.000", min: 20000, max: 50000 },
  { label: "$50.000 - $100.000", min: 50000, max: 100000 },
  { label: "Más de $100.000", min: 100000, max: Infinity },
];

const ProductList = () => {
  const [params, setSearchParams] = useSearchParams();
  const catParam = params.get("categoria");
  const qParam = params.get("q")?.toLowerCase() || "";

  const [brandFilter, setBrandFilter] = useState<string>("");
  const [catFilter, setCatFilter] = useState<string>("");
  const [priceFilter, setPriceFilter] = useState<number>(-1);
  const [showFilters, setShowFilters] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['public-products-list'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias', 'repuestos'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categorias').select('*').eq('tipo', 'repuestos').order('nombre');
      if (error) throw error;
      return data;
    }
  });

  const dynamicBrands = useMemo(() => {
    const brandSet = new Set(products.map((p: any) => p.brand).filter(Boolean));
    return Array.from(brandSet).sort();
  }, [products]);

  const activeCat = catParam || catFilter;

  const filtered = useMemo(() => {
    return products.filter((p: any) => {
      if (activeCat && p.category !== activeCat) return false;
      if (qParam && !(p.title || p.name || '').toLowerCase().includes(qParam) && !(p.category || '').toLowerCase().includes(qParam) && !(p.brand || '').toLowerCase().includes(qParam)) return false;
      if (brandFilter && p.brand !== brandFilter) return false;
      if (priceFilter >= 0) {
        const range = priceRanges[priceFilter];
        if (p.price < range.min || p.price > range.max) return false;
      }
      return true;
    });
  }, [products, activeCat, qParam, brandFilter, priceFilter]);

  const hasActiveFilters = !!(brandFilter || catFilter || catParam || priceFilter >= 0);

  const clearFilters = () => {
    setBrandFilter("");
    setCatFilter("");
    setPriceFilter(-1);
    setSearchParams({});
  };

  const FilterButton = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      className={`block w-full text-left text-xs font-medium px-3 py-2.5 rounded-lg transition-all duration-300 ${
        active ? "bg-foreground text-background" : "hover:bg-muted text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );

  const FilterSection = () => (
    <div className="space-y-8">
      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3 text-primary">Categoría</h4>
        <div className="space-y-0.5">
          {categorias.map((c: any) => (
            <FilterButton key={c.id} active={catFilter === c.nombre} onClick={() => setCatFilter(catFilter === c.nombre ? "" : c.nombre)}>
              {c.nombre}
            </FilterButton>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3 text-primary">Marca</h4>
        <div className="space-y-0.5">
          {dynamicBrands.map((b: any) => (
            <FilterButton key={b} active={brandFilter === b} onClick={() => setBrandFilter(brandFilter === b ? "" : b)}>
              {b}
            </FilterButton>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3 text-primary">Precio</h4>
        <div className="space-y-0.5">
          {priceRanges.map((r, i) => (
            <FilterButton key={i} active={priceFilter === i} onClick={() => setPriceFilter(priceFilter === i ? -1 : i)}>
              {r.label}
            </FilterButton>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-10 md:py-16 px-6 md:px-12">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: easeOut }}
          className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-8 flex items-center gap-2"
        >
          <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-foreground">{activeCat || (qParam ? `"${qParam}"` : "Catálogo")}</span>
        </motion.nav>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, ease: easeOut }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <p className="text-[9px] tracking-[0.5em] font-bold uppercase text-muted-foreground mb-2">Productos</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
              {activeCat || (qParam ? `Buscando: ${qParam}` : "Catálogo Completo")}
            </h2>
            <div className="w-16 h-[2px] bg-primary mt-4" />
          </div>
          <div className="flex items-center gap-2">
            <AnimatePresence>
              {hasActiveFilters && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                  <Button variant="ghost" size="sm" className="rounded-lg text-xs font-medium" onClick={clearFilters}>
                    Limpiar filtros
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            <Button variant="outline" size="sm" className="lg:hidden rounded-lg" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className="h-4 w-4 mr-2" /> Filtros
            </Button>
          </div>
        </motion.div>

        <div className="flex gap-10 lg:gap-16">
          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, ease: easeOut }}
            className="hidden lg:block w-56 flex-shrink-0"
          >
            <div className="sticky top-24">
              <h3 className="font-display font-bold text-sm mb-6 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-primary" /> Filtros
              </h3>
              <FilterSection />
            </div>
          </motion.aside>

          {/* Mobile filters drawer */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-50 lg:hidden flex justify-end"
                onClick={() => setShowFilters(false)}
              >
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="bg-card w-80 p-6 overflow-y-auto shadow-2xl"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-display font-bold">Filtros</h3>
                    <button onClick={() => setShowFilters(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                  <FilterSection />
                  <button
                    onClick={() => setShowFilters(false)}
                    className="w-full mt-8 bg-primary text-primary-foreground py-3 rounded-xl font-bold text-sm transition-colors hover:bg-primary/90"
                  >
                    Aplicar
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Products Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-28">
                <Loader2 className="text-primary mb-4 animate-spin" size={32} />
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Cargando repuestos...</p>
              </div>
            ) : (
              <>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground mb-8"
                >
                  {filtered.length} productos encontrados
                </motion.p>

                {filtered.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-24 bg-muted/50 rounded-2xl border border-border"
                  >
                    <p className="text-lg font-display font-bold text-muted-foreground mb-4">No hay resultados</p>
                    <Button variant="outline" className="rounded-lg text-xs font-medium" onClick={clearFilters}>Limpiar filtros</Button>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-8">
                    <AnimatePresence mode="popLayout">
                      {filtered.map((p: any, i: number) => (
                        <motion.div
                          key={p.id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.5, delay: Math.min(i * 0.05, 0.4), ease: easeOut }}
                          layout
                        >
                          <ProductCard product={p} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
