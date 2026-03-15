import { Link } from "react-router-dom";
import { Truck, Tag, Box, Wrench } from "lucide-react";
import { motion } from "framer-motion";

interface Product {
  id: string;
  title: string;
  price: number;
  original_price?: number | null;
  images: string[];
  category: string;
  brand: string;
  free_shipping: boolean;
  is_on_sale: boolean;
  slug: string;
  stock?: number | null;
  moto_fit?: string[] | null;
}

const formatPrice = (n: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);

const ProductCard = ({ product }: { product: Product }) => {
  const hasDiscount = product.is_on_sale && product.original_price && product.original_price > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
    : 0;
  const stock = product.stock ?? 0;
  const motoFit = product.moto_fit || [];

  return (
    <Link to={`/producto/${product.slug}`} className="group block">
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="bg-card rounded-[2rem] overflow-hidden border border-border shadow-sm hover:shadow-xl transition-shadow duration-300 relative"
      >
        {hasDiscount && (
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: -2 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="absolute top-3 left-3 z-10"
          >
            <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full font-black text-[10px] uppercase italic shadow-lg flex items-center gap-1">
              <Tag size={10} fill="currentColor" />
              {discountPercentage}% OFF
            </div>
          </motion.div>
        )}

        {/* Stock badge */}
        <div className="absolute top-3 right-3 z-10">
          <div className={`px-2 py-1 rounded-full text-[9px] font-black uppercase flex items-center gap-1 ${
            stock <= 0 ? 'bg-destructive/90 text-destructive-foreground' :
            stock <= 5 ? 'bg-warning/90 text-warning-foreground' :
            'bg-success/90 text-success-foreground'
          }`}>
            <Box size={10} />
            {stock <= 0 ? 'Agotado' : stock}
          </div>
        </div>

        <div className="aspect-square overflow-hidden bg-muted relative">
          <img
            src={product.images?.[0] || "/placeholder.svg"}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300" />
        </div>

        <div className="p-4 space-y-2">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest italic">
              {product.brand || "Original"}
            </p>
          </div>

          <p className="text-sm text-foreground font-black uppercase italic leading-tight line-clamp-2 min-h-[2.5rem]">
            {product.title}
          </p>

          {/* Compatibility */}
          {motoFit.length > 0 && (
            <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-bold">
              <Wrench size={10} className="text-primary flex-shrink-0" />
              <span className="truncate">{motoFit.slice(0, 2).join(', ')}{motoFit.length > 2 ? ` +${motoFit.length - 2}` : ''}</span>
            </div>
          )}

          <div className="space-y-0.5">
            {hasDiscount && (
              <p className="text-[11px] text-muted-foreground line-through font-bold">
                {formatPrice(product.original_price!)}
              </p>
            )}
            <div className="flex items-center justify-between">
              <p className="text-xl font-black text-foreground italic tracking-tighter">
                {formatPrice(product.price)}
              </p>
              {product.free_shipping && (
                <div className="bg-success/10 p-1.5 rounded-full text-success shadow-sm">
                  <Truck className="h-4 w-4" strokeWidth={3} />
                </div>
              )}
            </div>
          </div>

          {product.free_shipping && (
            <p className="text-[9px] font-black text-success uppercase tracking-tighter">
              Envío Gratis
            </p>
          )}
        </div>

        <div className="h-1.5 w-full bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
      </motion.div>
    </Link>
  );
};

export default ProductCard;
