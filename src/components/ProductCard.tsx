import React from "react";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import ImageCarousel from "./ImageCarousel";
import { Link } from "react-router-dom";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();

  return (
    <div className="bg-card rounded-3xl overflow-hidden shadow-card animate-fade-in group">
      <Link to={`/producto/${product.id}`}>
        <ImageCarousel images={product.image_urls} />
      </Link>
      <div className="p-4 space-y-2">
        <Link to={`/producto/${product.id}`}>
          <h3 className="font-display text-lg leading-tight text-foreground hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        {product.category && (
          <span className="text-xs font-body text-muted-foreground uppercase tracking-wider">
            {product.category}
          </span>
        )}
        <div className="flex items-center justify-between pt-2">
          <span className="font-display text-2xl text-primary">
            ${product.price.toLocaleString("es-AR")}
          </span>
          <button
            onClick={() => addItem(product)}
            className="p-2.5 rounded-full gradient-racing shadow-racing text-primary-foreground hover:scale-110 transition-transform"
            aria-label="Agregar al carrito"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
