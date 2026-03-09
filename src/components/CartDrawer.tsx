import React from "react";
import { X, Plus, Minus, Trash2, MessageCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";

const WHATSAPP_NUMBER = "5491165483728";

const CartDrawer: React.FC = () => {
  const { items, isOpen, closeCart, removeItem, updateQuantity, clearCart, total, itemCount } = useCart();

  const handleCheckout = () => {
    if (items.length === 0) return;
    const lines = items.map(
      (i) => `• ${i.product.name} x${i.quantity} — $${(i.product.price * i.quantity).toLocaleString("es-AR")}`
    );
    const msg = encodeURIComponent(
      `¡Hola GOS MOTOS! 🏍️\nQuiero consultar por estos productos:\n\n${lines.join("\n")}\n\n*Total: $${total.toLocaleString("es-AR")}*\n\n¡Gracias!`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={closeCart} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-card border-l border-border flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-black uppercase tracking-tight text-foreground">Carrito ({itemCount})</h2>
          <button onClick={closeCart} className="p-1 text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <p className="text-muted-foreground text-center py-10">Tu carrito está vacío</p>
          ) : (
            items.map((item) => {
              const imgUrl = (item.product as any).image_urls?.[0] || (item.product as any).images?.[0] || "/placeholder.svg";
              return (
                <div key={item.product.id} className="flex gap-3 bg-secondary rounded-xl p-3">
                  <img
                    src={imgUrl}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-foreground truncate">{item.product.name}</h4>
                    <p className="text-primary text-lg font-black">${item.product.price.toLocaleString("es-AR")}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-1 rounded bg-muted text-foreground hover:bg-border">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm text-foreground w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-1 rounded bg-muted text-foreground hover:bg-border">
                        <Plus className="w-3 h-3" />
                      </button>
                      <button onClick={() => removeItem(item.product.id)} className="ml-auto p-1 text-destructive hover:text-destructive/80">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t border-border space-y-3">
            <div className="flex justify-between text-xl font-black">
              <span className="text-foreground">Total</span>
              <span className="text-primary">${total.toLocaleString("es-AR")}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-lg font-black flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Consultar por WhatsApp
            </button>
            <button
              onClick={clearCart}
              className="w-full py-2 rounded-xl bg-secondary text-muted-foreground text-sm hover:bg-border transition-colors"
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
