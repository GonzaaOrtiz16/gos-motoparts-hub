import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Menu, Phone, User, LogOut, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
  const { itemCount, openCart } = useCart();
  const { user, signOut } = useAuth();
  const [query, setQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const { data: categories = [] } = useQuery({
    queryKey: ['categorias', 'repuestos'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categorias').select('*').eq('tipo', 'repuestos').order('nombre');
      if (error) throw error;
      return data;
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/productos?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-header border-b border-border/10 backdrop-blur-sm">
      {/* Top bar */}
      <div className="border-b border-border/10">
        <div className="container flex items-center justify-between py-1.5 px-6 md:px-12 text-[10px] text-header-foreground/60 uppercase tracking-wider">
          <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> (011) 15 6548-3728</span>
          <span className="hidden sm:inline font-medium">Lun a Sáb 9:00 - 19:00</span>
        </div>
      </div>

      {/* Main nav */}
      <div className="container flex items-center gap-4 py-3.5 px-6 md:px-12">
        <button className="lg:hidden text-header-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link to="/" className="flex-shrink-0">
          <h1 className="text-xl md:text-2xl font-display font-bold text-header-foreground tracking-tight">
            <span className="text-primary">GOS</span> Motos
          </h1>
        </Link>

        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-6">
          <div className="flex w-full">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar repuestos..."
              className="flex-1 rounded-l-lg border-0 bg-card/10 text-header-foreground placeholder:text-header-foreground/40 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            />
            <Button type="submit" className="rounded-l-none rounded-r-lg px-4 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>

        <div className="flex items-center gap-1 ml-auto">
          {user ? (
            <div className="flex items-center gap-1">
              <span className="hidden sm:inline text-[10px] text-header-foreground/60 truncate max-w-[100px]">{user.email}</span>
              <button onClick={signOut} className="p-2.5 text-header-foreground/70 hover:text-primary transition-colors">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link to="/auth" className="p-2.5 text-header-foreground/70 hover:text-primary transition-colors">
              <User className="h-5 w-5" />
            </Link>
          )}
          <button onClick={openCart} className="relative p-2.5 text-header-foreground/70 hover:text-primary transition-colors">
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Categories nav */}
      <nav className="hidden lg:block border-t border-border/10">
        <div className="container flex items-center gap-8 py-2.5 px-6 md:px-12">
          {categories.map((cat: any) => (
            <Link
              key={cat.id}
              to={`/productos?categoria=${cat.nombre}`}
              className="text-[11px] text-header-foreground/60 hover:text-primary transition-colors font-medium uppercase tracking-wider"
            >
              {cat.nombre}
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
            className="lg:hidden border-t border-border/10 bg-card overflow-hidden"
          >
            <form onSubmit={handleSearch} className="p-4">
              <div className="flex">
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Buscar..."
                  className="flex-1 rounded-l-lg border border-border bg-background text-foreground px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Button type="submit" size="sm" className="rounded-l-none rounded-r-lg bg-primary text-primary-foreground">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>
            <div className="flex flex-col pb-4">
              {categories.map((cat: any) => (
                <Link
                  key={cat.id}
                  to={`/productos?categoria=${cat.nombre}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-5 py-3 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
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
