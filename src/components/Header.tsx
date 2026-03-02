import React from "react";
import { ShoppingCart, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";

const Header: React.FC = () => {
  const { totalItems, setIsOpen } = useCart();
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full gradient-racing flex items-center justify-center">
            <span className="font-display text-primary-foreground text-sm">G</span>
          </div>
          <span className="font-display text-xl text-foreground tracking-wider">
            GOS MOTOS
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 font-body text-sm">
          <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Inicio</Link>
          <a href="https://instagram.com/gos_motos" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
            @gos_motos
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            className="relative p-2 text-foreground hover:text-primary transition-colors"
            aria-label="Carrito"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full gradient-racing text-primary-foreground text-xs flex items-center justify-center font-body font-bold">
                {totalItems}
              </span>
            )}
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-foreground"
            aria-label="Menú"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-3 font-body">
          <Link to="/" onClick={() => setMenuOpen(false)} className="block text-muted-foreground hover:text-primary">Inicio</Link>
          <a href="https://instagram.com/gos_motos" target="_blank" rel="noopener noreferrer" className="block text-muted-foreground hover:text-primary">
            @gos_motos
          </a>
        </div>
      )}
    </header>
  );
};

export default Header;
