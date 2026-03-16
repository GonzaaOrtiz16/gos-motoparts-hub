import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Flame, Truck, Sparkles } from "lucide-react";

import HeroSection from "@/components/home/HeroSection";
import MarqueeTicker from "@/components/home/MarqueeTicker";
import TrustStrip from "@/components/home/TrustStrip";
import CategoryGrid from "@/components/home/CategoryGrid";
import ProductSection from "@/components/home/ProductSection";
import CtaBanner from "@/components/home/CtaBanner";
import MediaBanner from "@/components/home/MediaBanner";

const Home = () => {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['public-products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias-home'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categorias').select('*').eq('tipo', 'repuestos').order('nombre');
      if (error) throw error;
      return data;
    }
  });

  const dynamicCategories = useMemo(() => {
    const countMap = new Map<string, number>();
    products.forEach((p: any) => {
      if (!p.category) return;
      countMap.set(p.category, (countMap.get(p.category) || 0) + 1);
    });

    return categorias.map((cat: any) => ({
      name: cat.nombre,
      count: countMap.get(cat.nombre) || 0,
      image: cat.image || null,
    })).sort((a: any, b: any) => b.count - a.count);
  }, [products, categorias]);

  const featured = products.filter((p: any) => p.is_on_sale === true);
  const freeShipping = products.filter((p: any) => p.free_shipping === true);
  const latestProducts = products.slice(0, 8);

  const productsByCategory = useMemo(() => {
    const map = new Map<string, any[]>();
    products.forEach((p: any) => {
      if (!p.category) return;
      const arr = map.get(p.category) || [];
      arr.push(p);
      map.set(p.category, arr);
    });
    return map;
  }, [products]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <HeroSection />
      <MarqueeTicker />
      <TrustStrip productCount={products.length} />
      <CategoryGrid categories={dynamicCategories} isLoading={isLoading} />

      <ProductSection
        eyebrow="Recién llegados"
        title="Nuevos Productos"
        icon={Sparkles}
        link="/productos"
        products={latestProducts}
      />

      {featured.length > 0 && (
        <ProductSection
          eyebrow="Los mejores precios"
          title="Ofertas"
          icon={Flame}
          link="/productos"
          products={featured}
        />
      )}

      {dynamicCategories.slice(0, 2).map((cat) => {
        const catProducts = productsByCategory.get(cat.name) || [];
        if (catProducts.length === 0) return null;
        return (
          <ProductSection
            key={cat.name}
            eyebrow={`${cat.count} productos`}
            title={cat.name}
            link={`/productos?categoria=${cat.name}`}
            products={catProducts}
          />
        );
      })}

      {freeShipping.length > 0 && (
        <ProductSection
          eyebrow="Envío sin cargo"
          title="Envío Gratis"
          icon={Truck}
          link="/productos"
          products={freeShipping}
        />
      )}

      <CtaBanner />

      {siteSettings?.home_media_url && (
        <MediaBanner
          mediaUrl={siteSettings.home_media_url}
          mediaType={siteSettings.home_media_type}
        />
      )}
    </div>
  );
};

export default Home;
