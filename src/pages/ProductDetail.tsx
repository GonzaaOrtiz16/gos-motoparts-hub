import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Truck, Shield, MessageCircle, Box, ArrowLeft, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import ProductCard from "@/components/ProductCard";

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
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="container py-20 text-center">
      <p className="text-xl font-bold mb-4">Producto no encontrado</p>
      <Button asChild><Link to="/productos">Ir al catálogo</Link></Button>
    </div>
  );

  const productImages = product.images || product.image_urls || [];
  const productTitle = product.title || product.name;
  const hasSizes = product.sizes && product.sizes.length > 0;

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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container py-10 px-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <Link to="/productos" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary font-black uppercase text-[10px] tracking-widest"><ArrowLeft size={14} /> Volver</Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="sticky top-24">
          <div className="aspect-square bg-muted rounded-[3rem] overflow-hidden border border-border shadow-2xl relative">
            <img src={productImages[activeImage] || '/placeholder.svg'} alt={productTitle} className="w-full h-full object-cover" />
            {hasDiscount && <div className="absolute top-6 left-6 bg-primary text-primary-foreground font-black px-4 py-2 rounded-2xl italic text-lg shadow-lg">{discountPercent}% OFF</div>}
          </div>
          {productImages.length > 1 && (
            <div className="flex gap-4 mt-6 overflow-x-auto pb-2 px-2">
              {productImages.map((img: string, i: number) => (
                <button key={i} onClick={() => setActiveImage(i)} className={`w-24 h-24 flex-shrink-0 rounded-[1.5rem] overflow-hidden border-4 transition-all ${i === activeImage ? "border-primary scale-95 shadow-lg" : "border-transparent opacity-50 hover:opacity-100"}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col lg:pl-6">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-foreground text-background text-[10px] font-black uppercase px-3 py-1.5 rounded-lg tracking-widest">{product.category}</span>
              <span className="text-primary font-black text-[10px] uppercase tracking-widest border border-primary/20 px-3 py-1.5 rounded-lg">{product.brand || 'Original'}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.85] italic text-foreground">{productTitle}</h1>
          </div>
          <div className="mb-10 bg-muted p-8 rounded-[2.5rem] border border-border">
            {hasDiscount && <p className="text-xl text-muted-foreground line-through font-bold mb-1">{formatPrice(product.original_price)}</p>}
            <div className="text-6xl font-black text-foreground tracking-tighter leading-none mb-4">{formatPrice(product.price)}</div>
            <div className="flex items-center gap-2 text-muted-foreground font-bold text-sm"><Box size={18} className="text-primary" /> Stock: <span className="text-foreground">{product.stock} uds</span></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {product.free_shipping && (
              <div className="flex items-center gap-4 p-5 bg-success/10 rounded-3xl border border-success/20">
                <Truck className="h-8 w-8 text-success" /><div><p className="text-xs font-black uppercase text-success">Envío Gratis</p></div>
              </div>
            )}
            <div className="flex items-center gap-4 p-5 bg-primary/10 rounded-3xl border border-primary/20">
              <Shield className="h-8 w-8 text-primary" /><div><p className="text-xs font-black uppercase text-primary">Garantía GOS</p></div>
            </div>
          </div>
          {hasSizes && (
            <div className="mb-6">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 block">Seleccioná tu talle</label>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size: string) => (
                  <button key={size} onClick={() => setSelectedSize(size)} className={`px-5 py-3 rounded-2xl font-black uppercase text-sm border-2 transition-all ${selectedSize === size ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground hover:border-primary/50'}`}>{size}</button>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-col gap-4">
            <Button onClick={handleAddToCart} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-20 rounded-[2.5rem] text-xl font-black uppercase tracking-tighter shadow-2xl active:scale-95 group">
              <ShoppingCart size={28} className="mr-4" /> Agregar al Carrito
            </Button>
            <Button onClick={handleWhatsAppClick} variant="outline" className="w-full border-2 border-border hover:border-primary h-16 rounded-[2.5rem] text-lg font-black uppercase tracking-tighter active:scale-95 group">
              <MessageCircle size={24} className="mr-4" /> Consultar por WhatsApp
            </Button>
          </div>
        </div>
      </div>
      {product.description && (
        <div className="mt-24 max-w-3xl">
          <h3 className="text-3xl font-black uppercase tracking-tighter italic mb-8">Detalles <span className="text-primary">Técnicos</span></h3>
          <div className="bg-card p-10 rounded-[3rem] border-2 border-border shadow-sm">
            <p className="text-muted-foreground text-xl leading-relaxed font-medium whitespace-pre-line">{product.description}</p>
          </div>
        </div>
      )}
      {related.length > 0 && (
        <section className="mt-24">
          <h3 className="text-3xl font-black uppercase tracking-tighter italic mb-12">Productos Relacionados</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </motion.div>
  );
};

export default ProductDetail;
