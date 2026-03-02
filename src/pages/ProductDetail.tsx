import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MessageCircle, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import ImageCarousel from "@/components/ImageCarousel";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";

const WHATSAPP_NUMBER = "5491165483728";

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      const { data } = await supabase.from("products").select("*").eq("id", id).single();
      if (data) setProduct(data as Product);
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleWhatsApp = () => {
    if (!product) return;
    const msg = encodeURIComponent(
      `¡Hola GOS MOTOS! 🏍️\nQuiero consultar por:\n\n*${product.name}*\nPrecio: $${product.price.toLocaleString("es-AR")}\n\n¡Gracias!`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />
      <div className="container py-6">
        <Link to="/" className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary font-body text-sm mb-6">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>

        {loading ? (
          <div className="bg-card rounded-3xl aspect-video animate-pulse" />
        ) : !product ? (
          <p className="text-center font-display text-2xl text-muted-foreground py-20">Producto no encontrado</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            <ImageCarousel images={product.image_urls} aspectRatio="aspect-[4/3]" />
            <div className="space-y-4">
              {product.category && (
                <span className="text-xs font-body uppercase tracking-wider text-muted-foreground">{product.category}</span>
              )}
              <h1 className="font-display text-4xl md:text-5xl text-foreground leading-none">{product.name}</h1>
              <p className="font-display text-4xl text-primary">${product.price.toLocaleString("es-AR")}</p>
              {product.description && (
                <p className="font-body text-muted-foreground leading-relaxed">{product.description}</p>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => addItem(product)}
                  className="flex-1 py-3 rounded-xl gradient-racing shadow-racing text-primary-foreground font-display text-lg flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                >
                  <ShoppingCart className="w-5 h-5" /> Agregar
                </button>
                <button
                  onClick={handleWhatsApp}
                  className="px-6 py-3 rounded-xl bg-secondary text-foreground font-display text-lg flex items-center justify-center gap-2 hover:bg-border transition-colors"
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
