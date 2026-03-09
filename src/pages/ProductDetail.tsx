import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MessageCircle, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import ImageCarousel from "@/components/ImageCarousel";

const WHATSAPP_NUMBER = "5491165483728";

const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      // Try slug first, then id
      let { data } = await supabase.from("products").select("*").eq("slug", slug).single();
      if (!data) {
        const res = await supabase.from("products").select("*").eq("id", slug).single();
        data = res.data;
      }
      if (data) setProduct(data as unknown as Product);
      setLoading(false);
    };
    fetchProduct();
  }, [slug]);

  const handleWhatsApp = () => {
    if (!product) return;
    const msg = encodeURIComponent(
      `¡Hola GOS MOTOS! 🏍️\nQuiero consultar por:\n\n*${product.name}*\nPrecio: $${product.price.toLocaleString("es-AR")}\n\n¡Gracias!`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
  };

  const images = product?.image_urls || product?.images || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6">
        <Link to="/productos" className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary text-sm mb-6">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>

        {loading ? (
          <div className="bg-card rounded-3xl aspect-video animate-pulse" />
        ) : !product ? (
          <p className="text-center text-2xl text-muted-foreground py-20">Producto no encontrado</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            <ImageCarousel images={images} aspectRatio="aspect-[4/3]" />
            <div className="space-y-4">
              {product.category && (
                <span className="text-xs uppercase tracking-wider text-muted-foreground">{product.category}</span>
              )}
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-foreground leading-none">{product.name}</h1>
              <p className="text-4xl text-primary font-black">${product.price.toLocaleString("es-AR")}</p>
              {product.original_price && product.original_price > product.price && (
                <p className="text-lg text-muted-foreground line-through">${product.original_price.toLocaleString("es-AR")}</p>
              )}
              {product.description && (
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => addItem(product)}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-lg font-black flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" /> Agregar
                </button>
                <button
                  onClick={handleWhatsApp}
                  className="px-6 py-3 rounded-xl bg-secondary text-foreground text-lg font-bold flex items-center justify-center gap-2 hover:bg-border transition-colors"
                >
                  <MessageCircle className="w-5 h-5" /> WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
