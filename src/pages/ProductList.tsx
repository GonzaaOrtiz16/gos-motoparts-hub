import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, Loader2, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { useState, useMemo, useEffect } from "react";
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
  const aiIds = params.get("ai_ids")?.split(",").filter(Boolean) || [];
  const aiMsg = params.get("ai_msg") || "";
  const aiCat = params.get("ai_cat") || "";
  const aiBrand = params.get("ai_brand") || "";

  const [brandFilter, setBrandFilter] = useState<string>(aiBrand);
  const [catFilter, setCatFilter] = useState<string>(aiCat);
  const [priceFilter, setPriceFilter] = useState<number>(-1);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>(aiIds.length > 0 ? "relevance" : "newest");

  // Reset AI filters when params change
  useEffect(() => {
    if (aiCat) setCatFilter(aiCat);
    if (aiBrand) setBrandFilter(aiBrand);
    if (aiIds.length > 0) setSortBy("relevance");
  }, [aiCat, aiBrand, aiIds.length]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['public-products-list'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const dynamicCategories = useMemo(() => {
    const cats = new Set(products.map((p: any) => p.category).filter(Boolean));
    return Array.from(cats).sort() as string[];
  }, [products]);

  const dynamicBrands = useMemo(() => {
    const brandSet = new Set(products.map((p: any) => p.brand).filter(Boolean));
    return Array.from(brandSet).sort() as string[];
  }, [products]);

  const activeCat = catParam || catFilter;

  const filtered = useMemo(() => {
    let result = products.filter((p: any) => {
      if (activeCat && p.category !== activeCat) return false;
      if (brandFilter && p.brand !== brandFilter) return false;
      if (priceFilter >= 0) {
        const range = priceRanges[priceFilter];
        if (p.price < range.min || p.price > range.max) return false;
      }
      // If we have AI results, filter by those IDs (unless user added extra filters)
      if (aiIds.length > 0 && !activeCat && !brandFilter && priceFilter < 0) {
        return aiIds.includes(p.id);
      }
      // Basic text search fallback
      if (qParam && aiIds.length === 0) {
        const searchText = `${p.title || ''} ${p.name || ''} ${p.category || ''} ${p.brand || ''} ${(p.moto_fit || []).join(' ')} ${p.description || ''}`.toLowerCase();
        return searchText.includes(qParam);
      }
      return true;
    });

    // Sort
    if (sortBy === "relevance" && aiIds.length > 0) {
      const idOrder = new Map(aiIds.map((id, i) => [id, i]));
      result.sort((a: any, b: any) => (idOrder.get(a.id) ?? 999) - (idOrder.get(b.id) ?? 999));
    } else if (sortBy === "price_asc") {
      result.sort((a: any, b: any) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      result.sort((a: any, b: any) => b.price - a.price);
    }
    // newest is default order from DB

    return result;
  }, [products, activeCat, qParam, brandFilter, priceFilter, aiIds, sortBy]);

  const hasActiveFilters = !!(brandFilter || catFilter || catParam || priceFilter >= 0);

  const clearFilters = () => {
    setBrandFilter("");
    setCatFilter("");
    setPriceFilter(-1);
    setSortBy("newest");
    setSearchParams({});
  };

  const FilterChip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      className={`text-xs font-medium px-3 py-2 rounded-lg transition-all duration-200 ${
        active 
          ? "bg-primary text-primary-foreground" 
          : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );

  const FilterSection = () => (
    <div className="space-y-6">
      {/* Sort */}
      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3 text-primary">Ordenar</h4>
        <div className="flex flex-wrap gap-1.5">
          {[
            { key: "newest", label: "Recientes" },
            { key: "price_asc", label: "Menor precio" },
            { key: "price_desc", label: "Mayor precio" },
            ...(aiIds.length > 0 ? [{ key: "relevance", label: "Relevancia IA" }] : []),
          ].map(s => (
            <FilterChip key={s.key} active={sortBy === s.key} onClick={() => setSortBy(s.key)}>
              {s.label}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3 text-primary">Categoría</h4>
        <div className="flex flex-wrap gap-1.5">
          {dynamicCategories.map((c) => (
            <FilterChip key={c} active={catFilter === c} onClick={() => setCatFilter(catFilter === c ? "" : c)}>
              {c}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* Brand */}
      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3 text-primary">Marca</h4>
        <div className="flex flex-wrap gap-1.5">
          {dynamicBrands.map((b) => (
            <FilterChip key={b} active={brandFilter === b} onClick={() => setBrandFilter(brandFilter === b ? "" : b)}>
              {b}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3 text-primary">Precio</h4>
        <div className="flex flex-wrap gap-1.5">
          {priceRanges.map((r, i) => (
            <FilterChip key={i} active={priceFilter === i} onClick={() => setPriceFilter(priceFilter === i ? -1 : i)}>
              {r.label}
            </FilterChip>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6 md:py-16 px-4 md:px-12">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: easeOut }}
          className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-6 md:mb-8 flex items-center gap-2"
        >
          <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-foreground">{activeCat || (qParam ? `"${qParam}"` : "Catálogo")}</span>
        </motion.nav>

        {/* Title + AI message */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, ease: easeOut }}
          className="mb-6 md:mb-10"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-[9px] tracking-[0.5em] font-bold uppercase text-muted-foreground mb-1">Productos</p>
              <h2 className="text-2xl md:text-4xl font-display font-bold tracking-tight">
                {activeCat || (qParam ? `Buscando: ${qParam}` : "Catálogo Completo")}
              </h2>
              <div className="w-12 md:w-16 h-[2px] bg-primary mt-3" />
            </div>
            <div className="flex items-center gap-2">
              <AnimatePresence>
                {hasActiveFilters && (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                    <Button variant="ghost" size="sm" className="rounded-lg text-xs font-medium" onClick={clearFilters}>
                      Limpiar
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
              <Button variant="outline" size="sm" className="lg:hidden rounded-lg text-xs" onClick={() => setShowFilters(!showFilters)}>
                <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" /> Filtros
              </Button>
            </div>
          </div>

          {/* AI insight banner */}
          {aiMsg && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-primary/5 border border-primary/10 rounded-lg"
            >
              <Sparkles size={14} className="text-primary shrink-0" />
              <p className="text-xs text-foreground">{aiMsg}</p>
            </motion.div>
          )}
        </motion.div>

        <div className="flex gap-8 lg:gap-12">
          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, ease: easeOut }}
            className="hidden lg:block w-52 flex-shrink-0"
          >
            <div className="sticky top-24">
              <h3 className="font-display font-bold text-sm mb-5 flex items-center gap-2">
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
                  className="bg-card w-80 max-w-[85vw] p-5 overflow-y-auto shadow-2xl"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="font-display font-bold text-sm">Filtros</h3>
                    <button onClick={() => setShowFilters(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                  <FilterSection />
                  <button
                    onClick={() => setShowFilters(false)}
                    className="w-full mt-6 bg-primary text-primary-foreground py-3 rounded-xl font-bold text-sm transition-colors hover:bg-primary/90"
                  >
                    Aplicar
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
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
                  className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground mb-5 md:mb-8"
                >
                  {filtered.length} productos encontrados
                </motion.p>

                {filtered.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16 md:py-24 bg-muted/50 rounded-xl border border-border"
                  >
                    <p className="text-base font-display font-bold text-muted-foreground mb-4">No hay resultados</p>
                    <p className="text-xs text-muted-foreground mb-4">Probá con otros términos o limpiá los filtros</p>
                    <Button variant="outline" className="rounded-lg text-xs font-medium" onClick={clearFilters}>Limpiar filtros</Button>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                    <AnimatePresence mode="popLayout">
                      {filtered.map((p: any, i: number) => (
                        <motion.div
                          key={p.id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.4, delay: Math.min(i * 0.03, 0.3), ease: easeOut }}
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
