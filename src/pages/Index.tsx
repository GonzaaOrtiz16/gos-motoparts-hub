import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/product";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("products").select("*");
      if (data) setProducts(data as Product[]);
    };
    fetch();
  }, []);

  const filtered = products?.filter(p => p.name.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Banner simplificado para evitar errores */}
      <section className="bg-black py-20 text-center border-b-4 border-primary">
        <h1 className="text-5xl md:text-7xl font-display italic text-white uppercase">
          REPUESTOS DE <span className="text-primary">MOTOS</span>
        </h1>
        <p className="text-gray-400 mt-4">@gos_motos - Bernal Oeste</p>
      </section>

      <div className="container mx-auto px-6 py-10 flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary border border-border text-sm"
            />
          </div>
        </aside>

        <main className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          {filtered.length === 0 && <p className="text-center py-20 italic">No se encontraron productos.</p>}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Index;
