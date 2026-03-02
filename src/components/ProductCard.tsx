import { ShoppingCart } from "lucide-react";
import { Product } from "@/types/product";
import { useCart } from "@/hooks/use-cart"; // Asegurate de que el hook exista o usá tu lógica de carrito

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();
  const images = product.image_urls || [];

  return (
    <div className="bg-card border border-border group hover:border-primary transition-all shadow-card flex flex-col h-full">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {/* Carrusel Simple */}
        <div className="flex overflow-x-auto snap-x snap-mandatory h-full no-scrollbar">
          {images.length > 0 ? (
            images.map((url, i) => (
              <img key={i} src={url} className="snap-center w-full h-full object-cover shrink-0" alt={product.name} />
            ))
          ) : (
            <div className="flex items-center justify-center w-full h-full text-muted-foreground text-xs uppercase italic">Sin foto</div>
          )}
        </div>
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary" />)}
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-1 text-center">
        <p className="text-[10px] text-muted-foreground uppercase mb-1 font-bold">{product.category}</p>
        <h4 className="text-xl font-display italic mb-4 uppercase leading-tight">{product.name}</h4>
        <div className="mt-auto">
          <span className="text-3xl font-display text-primary block mb-4 italic">${product.price.toLocaleString('es-AR')}</span>
          <button 
            onClick={() => addItem(product)}
            className="w-full bg-secondary hover:bg-primary text-foreground py-3 flex items-center justify-center gap-2 font-display text-lg italic transition-colors"
          >
            <ShoppingCart size={18} /> AGREGAR
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
