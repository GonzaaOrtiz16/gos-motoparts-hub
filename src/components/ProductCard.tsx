import { Link } from "react-router-dom";
import { Truck, Tag, Box, Wrench } from "lucide-react";

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
    <Link to={`/producto/${product.slug || product.id}`} className="group block">
      <div className="relative bg-card border border-border/50 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1.5 hover:border-primary/20">
        {/* Image container */}
        <div className="aspect-[3/4] overflow-hidden bg-muted relative">
          <img
            src={images[0] || "/placeholder.svg"}
            alt={displayTitle}
            className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110"
            loading="lazy"
          />
          {/* Second image crossfade */}
          {images[1] && (
            <img
              src={images[1]}
              alt={displayTitle}
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out"
              loading="lazy"
            />
          )}

          {/* Dark gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Discount badge — angular style */}
          {hasDiscount && (
            <div className="absolute top-0 left-0 z-10 bg-primary text-primary-foreground px-4 py-2 text-[10px] font-condensed font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Tag size={10} />
              {discountPercentage}% OFF
            </div>
          )}

          {/* Stock */}
          <div className="absolute top-2 right-2 z-10">
            <div className={`px-2 py-1 text-[9px] font-bold uppercase flex items-center gap-1 backdrop-blur-md ${
              stock <= 0 ? 'bg-destructive/90 text-destructive-foreground' :
              stock <= 5 ? 'bg-warning/90 text-warning-foreground' :
              'bg-success/90 text-success-foreground'
            }`}>
              <Box size={9} />
              {stock <= 0 ? 'Agotado' : stock}
            </div>
          </div>

          {/* Free shipping */}
          {product.free_shipping && (
            <div className="absolute bottom-0 left-0 z-10 bg-success text-success-foreground px-3 py-1.5 text-[9px] font-condensed font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Truck size={10} strokeWidth={2.5} />
              Envío Gratis
            </div>
          )}

          {/* Racing accent line on hover */}
          <div className="absolute bottom-0 left-0 w-0 group-hover:w-full h-[3px] bg-primary transition-all duration-500 z-10" />
        </div>

        {/* Info */}
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-condensed font-bold text-primary uppercase tracking-[0.2em]">
              {product.brand || "Original"}
            </p>
            {motoFit.length > 0 && (
              <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-medium">
                <Wrench size={9} className="text-primary" />
                <span className="truncate max-w-[70px]">{motoFit[0]}{motoFit.length > 1 ? ` +${motoFit.length - 1}` : ''}</span>
              </div>
            )}
          </div>

          <p className="text-sm text-foreground font-medium leading-snug line-clamp-2 min-h-[2.5rem]">
            {displayTitle}
          </p>

          <div className="flex items-center gap-2 pt-1 border-t border-border/50">
            <p className="text-lg font-condensed font-bold text-foreground">
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
