import React, { useState, useEffect } from "react";
import { Search, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/product";
import ProductCard from "@/components/ProductCard";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";

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

      {/* HERO BANNER - ESTILO RACING */}
      <section className="relative h-[400px] flex items-center overflow-hidden border-b-4 border-primary bg-black">
        <div className="absolute inset-0 opacity-40">
          <img src="https://images.unsplash.com/photo-1558981403-c5f91cbba527?q=80&w=2070" className="w-full h-full object-cover" alt="Banner" />
        </div>
        <div className="container relative z-10 px-6">
          <span className="bg-primary text-white px-4 py-1 skew-x-[-12deg] font-display text-sm mb-4 inline-block">ENVÍOS A TODO EL PAÍS</span>
          <h1 className="text-6xl md:text-8xl font-display italic leading-none text-white">REPUESTOS <br/> <span className="text-primary">DE CALIDAD</span></h1>
        </div>
      </section>

      {/* CUERPO: SIDEBAR + GRILLA */}
      <div className="container mx-auto px-6 py-12 flex flex-col md:flex-row gap-10">
        {/* SIDEBAR DE FILTROS */}
        <aside className="w-full md:w-64 shrink-0">
          <h3 className="text-2xl font-display mb-6 italic border-b-2 border-primary pb-2 inline-block">FILTRAR POR</h3>
          <div className="space-y-6">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-none text-sm"
              />
            </div>
            <div className="space-y-3">
              <p className="text-primary font-display text-xs tracking-widest uppercase">Categoría</p>
              <button onClick={() => setSelectedCategory(null)} className={`block w-full text-left text-sm ${!selectedCategory ? 'text-primary font-bold' : 'text-muted-foreground'}`}>TODOS</button>
              {categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`block w-full text-left text-sm uppercase ${selectedCategory === cat ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* GRILLA DE PRODUCTOS */}
        <main className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1,2,3].map(i => <div key={i} className="bg-card aspect-[4/5] border border-border" />)}
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
      <Footer />
    </div>
  );
};

export default Index;
