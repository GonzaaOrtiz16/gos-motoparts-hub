import { ShoppingCart } from "lucide-react";
import { Product } from "@/types/product";
import { useCart } from "@/hooks/use-cart";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const images = product.image_urls || [];

  return (
    <div className="bg-card border border-border group hover:border-primary transition-all flex flex-col h-full">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <div className="flex overflow-x-auto snap-x snap-mandatory h-full no-scrollbar">
          {images.length > 0 ? (
            images.map((url, i) => (
              <img key={i} src={url} className="snap-center w-full h-full object-cover shrink-0" alt={product.name} />
            ))
          ) : (
            <div className="flex items-center justify-center w-full h-full text-muted-foreground text-xs italic">SIN IMAGEN</div>
          )}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1 text-center">
        <p className="text-[10px] text-muted-foreground uppercase font-bold">{product.category}</p>
        <h4 className="text-lg font-display italic mb-2 uppercase">{product.name}</h4>
        <div className="mt-auto">
          <span className="text-2xl font-display text-primary block mb-3 italic">${product.price.toLocaleString('es-AR')}</span>
          <button 
            onClick={() => addItem(product)}
            className="w-full bg-secondary hover:bg-primary text-foreground py-2 flex items-center justify-center gap-2 font-display italic transition-colors"
          >
            <ShoppingCart size={16} /> AGREGAR
          </button>
        </div>
      </div>
    </div>
  );
}
