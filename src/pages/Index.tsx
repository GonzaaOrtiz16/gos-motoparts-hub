import React, { useState, useEffect } from "react";
import { Search, Instagram, Phone, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/product";
import ProductCard from "@/components/ProductCard";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";

const Index: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        setProducts(data as Product[]);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[];

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !selectedCategory || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <CartDrawer />

      {/* Hero Section - Estilo Racing con el Casco */}
      <section className="relative h-[450px] flex items-center overflow-hidden border-b-4 border-primary">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1558981403-c5f91cbba527?q=80&w=2070" 
            className="w-full h-full object-cover opacity-40 grayscale hover:grayscale-0 transition-all duration-700"
            alt="Racing background"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
        </div>

        <div className="container relative z-10 px-6">
          <span className="inline-block bg-primary text-white px-4 py-1 skew-x-[-12deg] font-display text-sm mb-4 shadow-racing">
            ENVÍOS A TODO EL PAÍS
          </span>
          <h1 className="text-6xl md:text-8xl font-display leading-[0.8] mb-6 italic">
            REPUESTOS <br /> <span className="text-primary">DE CALIDAD</span>
          </h1>
          <p className="max-w-md text-muted-foreground font-body text-lg mb-8">
            Potencia y precisión para tu máquina. Especialistas en repuestos de alta gama. @gos_motos
          </p>
        </div>
      </section>

      {/* Contenedor Principal: Sidebar + Grilla */}
      <div className="container mx-auto px-6 py-12 flex flex-col md:flex-row gap-10">
        
        {/* Sidebar de Filtros (Izquierda, como la foto 2) */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-24 space-y-8">
            <div>
              <h3 className="text-2xl font-display mb-6 italic border-b-2 border-primary pb-2 inline-block">FILTRAR POR</h3>
              
              {/* Buscador Integrado en Sidebar */}
              <div className="relative mb-8">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-none focus:ring-1 focus:ring-primary outline-none text-sm"
                />
              </div>

              {/* Listado de Categorías con Checkboxes */}
              <div className="space-y-4">
                <p className="text-primary font-display text-xs tracking-widest mb-4">CATEGORÍA</p>
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className={`flex items-center gap-3 w-full text-left font-body text-sm hover:text-primary transition-colors ${!selectedCategory ? 'text-primary font-bold' : 'text-muted-foreground'}`}
                >
                  <div className={`w-4 h-4 border ${!selectedCategory ? 'bg-primary border-primary' : 'border-muted'}`} />
                  TODOS
                </button>
                {categories.map((cat) => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex items-center gap-3 w-full text-left font-body text-sm uppercase hover:text-primary transition-colors ${selectedCategory === cat ? 'text-primary font-bold' : 'text-muted-foreground'}`}
                  >
                    <div className={`w-4 h-4 border ${selectedCategory === cat ? 'bg-primary border-primary' : 'border-muted'}`} />
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Grilla de Productos (Derecha) */}
        <main className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-card rounded-none aspect-[4/5] animate-pulse border border-border" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border">
              <p className="font-display text-2xl text-muted-foreground italic">No se encontraron productos</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Footer Bordó Oscuro (Como la foto 2) */}
      <footer className="bg-[#121212] border-t-4 border-primary py-16 mt-auto">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h2 className="text-4xl font-display italic text-primary mb-4">GOS MOTOS</h2>
            <p className="text-muted-foreground font-body text-sm leading-relaxed">
              Líderes en repuestos de competición y calle. <br />
              Bernal Oeste, Buenos Aires.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-lg font-display tracking-widest text-white mb-4">CONTACTO</h4>
            <a href="https://instagram.com/gos_motos" target="_blank" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors text-sm">
              <Instagram size={18} /> @gos_motos
            </a>
            <div className="flex items-center gap-3 text-muted-foreground text-sm">
              <Phone size={18} /> 5491165483728
            </div>
          </div>
          <div>
            <h4 className="text-lg font-display tracking-widest text-white mb-4">ATENCIÓN</h4>
            <p className="text-muted-foreground font-body text-sm italic">Lun a Vie: 09:00 - 18:00hs</p>
            <p className="text-muted-foreground font-body text-sm italic">Sábados: 09:00 - 13:00hs</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
