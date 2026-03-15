import { Link } from "react-router-dom";
import { Truck, Tag, Box, Wrench } from "lucide-react";
import { motion } from "framer-motion";

interface Product {
  id: string;
  title: string;
  name?: string;
  price: number;
  original_price?: number | null;
  images: string[];
  image_urls?: string[];
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
  const images = product.images || product.image_urls || [];
  const displayTitle = product.title || product.name || '';

  return (
    <Link to={`/producto/${product.slug}`} className="group block">
      <div className="relative">
        {/* Image container — Aura-style 3:4 aspect ratio */}
        <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-muted relative">
          {/* Primary image */}
          <img
            src={images[0] || "/placeholder.svg"}
            alt={displayTitle}
            className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.04]"
            loading="lazy"
          />
          {/* Second image crossfade on hover */}
          {images[1] && (
            <img
              src={images[1]}
              alt={displayTitle}
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out"
              loading="lazy"
            />
          )}

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Discount badge */}
          {hasDiscount && (
            <div className="absolute top-3 left-3 z-10 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Tag size={10} />
              {discountPercentage}% OFF
            </div>
          )}

          {/* Stock badge */}
          <div className="absolute top-3 right-3 z-10">
            <div className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase flex items-center gap-1 backdrop-blur-sm ${
              stock <= 0 ? 'bg-destructive/90 text-destructive-foreground' :
              stock <= 5 ? 'bg-warning/90 text-warning-foreground' :
              'bg-success/90 text-success-foreground'
            }`}>
              <Box size={9} />
              {stock <= 0 ? 'Agotado' : stock}
            </div>
          </div>

          {/* Free shipping floating badge */}
          {product.free_shipping && (
            <div className="absolute bottom-3 left-3 z-10 bg-success/90 text-success-foreground backdrop-blur-sm px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase flex items-center gap-1">
              <Truck size={10} strokeWidth={2.5} />
              Envío Gratis
            </div>
          )}
        </div>

        {/* Info — clean, breathable */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.15em]">
              {product.brand || "Original"}
            </p>
            {motoFit.length > 0 && (
              <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-medium">
                <Wrench size={9} className="text-primary" />
                <span className="truncate max-w-[80px]">{motoFit[0]}{motoFit.length > 1 ? ` +${motoFit.length - 1}` : ''}</span>
              </div>
            )}
          </div>

          <p className="text-sm text-foreground font-medium leading-snug line-clamp-2 min-h-[2.5rem]">
            {displayTitle}
          </p>

          <div className="flex items-center gap-2">
            <p className="text-base font-display font-bold text-foreground">
              {formatPrice(product.price)}
            </p>
            {hasDiscount && (
              <p className="text-xs text-muted-foreground line-through">
                {formatPrice(product.original_price!)}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
