import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Truck, Shield, MessageCircle, Box, ArrowLeft, ShoppingCart, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import ProductCard from "@/components/ProductCard";

const easeOut = [0.22, 1, 0.36, 1] as const;

const formatPrice = (n: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

const ProductDetail = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const { addItem } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      let { data } = await supabase.from('products').select('*').eq('slug', slug).single();
      if (!data) {
        const res = await supabase.from('products').select('*').eq('id', slug).single();
        data = res.data;
      }
      if (data) {
        setProduct(data);
        const { data: relData } = await supabase.from('products').select('*').eq('category', data.category).not('id', 'eq', data.id).limit(4);
        setRelated(relData || []);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="container py-28 text-center">
      <p className="text-xl font-display font-bold mb-4">Producto no encontrado</p>
      <Button asChild><Link to="/productos">Ir al catálogo</Link></Button>
    </div>
  );

  const productImages = product.images || product.image_urls || [];
  const productTitle = product.title || product.name;
  const hasSizes = product.sizes && product.sizes.length > 0;
  const motoFit = product.moto_fit || [];

  const handleAddToCart = () => {
    if (hasSizes && !selectedSize) { toast.error("Seleccioná un talle"); return; }
    addItem({ id: product.id, title: productTitle, slug: product.slug, price: product.price, original_price: product.original_price, images: productImages, category: product.category, brand: product.brand, free_shipping: product.free_shipping, description: product.description || '', stock: product.stock || 0, is_on_sale: product.is_on_sale }, selectedSize || undefined);
    toast.success("¡Agregado al carrito!");
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(`¡Hola GOS Motos! 👋 Me interesa: ${productTitle}. ¿Tienen stock?`);
    window.open(`https://wa.me/5491165483728?text=${message}`, '_blank');
  };

  const hasDiscount = product.original_price && product.original_price > product.price;
  const discountPercent = hasDiscount ? Math.round((1 - product.price / product.original_price) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="container px-6 md:px-12 pt-8 pb-4">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: easeOut }}
        >
          <Link to="/productos" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary text-xs font-medium tracking-wider uppercase transition-colors">
            <ArrowLeft size={14} /> Volver al catálogo
          </Link>
        </motion.div>
      </div>

      <div className="container px-6 md:px-12 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: easeOut }}
            className="sticky top-24"
          >
            <div className="aspect-square bg-muted rounded-2xl overflow-hidden relative">
              <img
                src={productImages[activeImage] || '/placeholder.svg'}
                alt={productTitle}
                className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-[1.03]"
              />
              {hasDiscount && (
                <div className="absolute top-5 left-5 bg-primary text-primary-foreground font-bold px-4 py-2 rounded-xl text-sm">
                  {discountPercent}% OFF
                </div>
              )}
            </div>
            {productImages.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                {productImages.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                      i === activeImage ? "border-primary opacity-100" : "border-transparent opacity-50 hover:opacity-80"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: easeOut }}
            className="flex flex-col"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary border border-primary/20 px-3 py-1 rounded-lg">{product.brand || 'Original'}</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground bg-muted px-3 py-1 rounded-lg">{product.category}</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-foreground leading-tight mb-6">
              {productTitle}
            </h1>

            {/* Price */}
            <div className="mb-8 p-6 bg-muted/50 rounded-2xl border border-border">
              {hasDiscount && <p className="text-lg text-muted-foreground line-through mb-1">{formatPrice(product.original_price)}</p>}
              <div className="text-4xl md:text-5xl font-display font-bold text-foreground tracking-tight leading-none mb-3">{formatPrice(product.price)}</div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Box size={16} className="text-primary" /> Stock: <strong className="text-foreground">{product.stock} uds</strong></span>
                {motoFit.length > 0 && (
                  <span className="flex items-center gap-1.5"><Wrench size={14} className="text-primary" /> {motoFit.join(', ')}</span>
                )}
              </div>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {product.free_shipping && (
                <div className="flex items-center gap-3 p-4 bg-success/10 rounded-xl border border-success/20">
                  <Truck className="h-5 w-5 text-success" />
                  <p className="text-xs font-bold uppercase text-success">Envío Gratis</p>
                </div>
              )}
              <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-xl border border-primary/20">
                <Shield className="h-5 w-5 text-primary" />
                <p className="text-xs font-bold uppercase text-primary">Garantía GOS</p>
              </div>
            </div>

            {/* Sizes */}
            {hasSizes && (
              <div className="mb-8">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 block">Seleccioná tu talle</label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size: string) => (
                    <button key={size} onClick={() => setSelectedSize(size)} className={`px-5 py-2.5 rounded-xl font-bold uppercase text-sm border-2 transition-all duration-300 ${selectedSize === size ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground hover:border-primary/50'}`}>{size}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Button onClick={handleAddToCart} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-16 rounded-xl text-base font-bold shadow-lg shadow-primary/20 active:scale-[0.98] transition-all group">
                <ShoppingCart size={22} className="mr-3" /> Agregar al Carrito
              </Button>
              <Button onClick={handleWhatsAppClick} variant="outline" className="w-full border-2 border-border hover:border-primary h-14 rounded-xl text-sm font-bold active:scale-[0.98] transition-all group">
                <MessageCircle size={20} className="mr-3" /> Consultar por WhatsApp
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Description */}
        {product.description && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: easeOut }}
            className="mt-20 md:mt-28 max-w-3xl"
          >
            <h3 className="text-2xl font-display font-bold tracking-tight mb-6">Detalles <span className="text-primary italic">Técnicos</span></h3>
            <div className="bg-muted/50 p-8 rounded-2xl border border-border">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          </motion.div>
        )}

        {/* Related */}
        {related.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: easeOut }}
            className="mt-20 md:mt-28"
          >
            <h3 className="text-2xl font-display font-bold tracking-tight mb-10">Productos Relacionados</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8">
              {related.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: easeOut }}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
