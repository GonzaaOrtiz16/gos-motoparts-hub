import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, Phone, User, LogOut, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import SmartSearch from "@/components/SmartSearch";

const Header = () => {
  const { itemCount, openCart } = useCart();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ['categorias', 'repuestos'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categorias').select('*').eq('tipo', 'repuestos').order('nombre');
      if (error) throw error;
      return data;
    }
  });

  return (
    <header className="sticky top-0 z-50 bg-foreground border-b border-border/5">
      <div className="h-[3px] bg-primary" />

      {/* Top bar */}
      <div className="border-b border-border/5">
        <div className="container flex items-center justify-between py-1.5 px-4 md:px-16 text-[10px] text-primary-foreground/40 uppercase tracking-wider">
          <span className="flex items-center gap-1.5 font-condensed"><Phone className="h-3 w-3" /> (011) 15 6548-3728</span>
          <span className="hidden sm:inline font-condensed font-medium tracking-[0.3em]">Lun a Sáb 9:00 - 19:00</span>
        </div>
      </div>

      {/* Main nav */}
      <div className="container flex items-center gap-3 md:gap-4 py-2.5 md:py-3 px-4 md:px-16">
        <button className="lg:hidden text-primary-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link to="/" className="flex-shrink-0">
          <h1 className="text-lg md:text-2xl font-condensed font-bold text-primary-foreground tracking-tight uppercase">
            <span className="text-primary">GOS</span> Motos
          </h1>
        </Link>

        <div className="hidden md:block flex-1 max-w-lg mx-6">
          <SmartSearch variant="header" placeholder="Buscar repuestos, cascos, cubiertas..." />
        </div>

        <div className="flex items-center gap-0.5 ml-auto">
          {user ? (
            <div className="flex items-center gap-0.5">
              <span className="hidden sm:inline text-[10px] text-primary-foreground/40 truncate max-w-[80px] font-condensed">{user.email}</span>
              <button onClick={signOut} className="p-2 text-primary-foreground/50 hover:text-primary transition-colors">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link to="/auth" className="p-2 text-primary-foreground/50 hover:text-primary transition-colors">
              <User className="h-4 w-4 md:h-5 md:w-5" />
            </Link>
          )}
          <button onClick={openCart} className="relative p-2 text-primary-foreground/50 hover:text-primary transition-colors">
            <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[9px] font-bold h-4 w-4 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Categories nav */}
      <nav className="hidden lg:block border-t border-border/5">
        <div className="container flex items-center gap-0 px-6 md:px-16">
          {categories.map((cat: any) => (
            <Link
              key={cat.id}
              to={`/productos?categoria=${cat.nombre}`}
              className="relative text-[11px] text-primary-foreground/50 hover:text-primary transition-colors font-condensed font-bold uppercase tracking-[0.2em] px-5 py-3 group"
            >
              {cat.nombre}
              <span className="absolute bottom-0 left-0 w-0 group-hover:w-full h-[2px] bg-primary transition-all duration-300" />
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden border-t border-border/5 bg-foreground overflow-hidden"
          >
            <div className="p-4">
              <SmartSearch variant="header" placeholder="Buscar..." onClose={() => setMobileMenuOpen(false)} />
            </div>
            <div className="flex flex-col pb-4">
              {categories.map((cat: any) => (
                <Link
                  key={cat.id}
                  to={`/productos?categoria=${cat.nombre}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-5 py-3 text-sm text-primary-foreground/70 hover:text-primary hover:bg-primary-foreground/5 transition-colors font-condensed uppercase tracking-wider"
                >
                  {cat.nombre}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
