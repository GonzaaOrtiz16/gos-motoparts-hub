import React from "react";
import { X, Plus, Minus, Trash2, MessageCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";

const WHATSAPP_NUMBER = "5491165483728";

const CartDrawer: React.FC = () => {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, clearCart, totalPrice, totalItems } = useCart();

  const handleCheckout = () => {
    if (items.length === 0) return;
    const lines = items.map(
      (i) => `• ${i.name} x${i.quantity} — $${(i.price * i.quantity).toLocaleString("es-AR")}`
    );
    const msg = encodeURIComponent(
      `¡Hola GOS MOTOS! 🏍️\nQuiero consultar por estos productos:\n\n${lines.join("\n")}\n\n*Total: $${totalPrice.toLocaleString("es-AR")}*\n\n¡Gracias!`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-card border-l border-border flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-display text-xl text-foreground">Carrito ({totalItems})</h2>
          <button onClick={() => setIsOpen(false)} className="p-1 text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <p className="text-muted-foreground text-center py-10 font-body">Tu carrito está vacío</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3 bg-secondary rounded-xl p-3">
                <img
                  src={item.image_urls[0] || "/placeholder.svg"}
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-body font-semibold text-sm text-foreground truncate">{item.name}</h4>
                  <p className="font-display text-primary text-lg">${item.price.toLocaleString("es-AR")}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 rounded bg-muted text-foreground hover:bg-border">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-body text-sm text-foreground w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 rounded bg-muted text-foreground hover:bg-border">
                      <Plus className="w-3 h-3" />
                    </button>
                    <button onClick={() => removeItem(item.id)} className="ml-auto p-1 text-destructive hover:text-destructive/80">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t border-border space-y-3">
            <div className="flex justify-between font-display text-xl">
              <span className="text-foreground">Total</span>
              <span className="text-primary">${totalPrice.toLocaleString("es-AR")}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full py-3 rounded-xl gradient-racing shadow-racing text-primary-foreground font-display text-lg flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
            >
              <MessageCircle className="w-5 h-5" />
              Consultar por WhatsApp
            </button>
            <button
              onClick={clearCart}
              className="w-full py-2 rounded-xl bg-secondary text-muted-foreground font-body text-sm hover:bg-border transition-colors"
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
