import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SmartSearchProps {
  className?: string;
  placeholder?: string;
  variant?: "hero" | "header";
  onClose?: () => void;
}

export default function SmartSearch({ className = "", placeholder = "¿Qué estás buscando?", variant = "hero", onClose }: SmartSearchProps) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [suggestions] = useState([
    "Cascos para mujer",
    "Cubiertas Pirelli",
    "Kit de arrastre YBR",
    "Aceite 10W40",
  ]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<number>();

  useEffect(() => {
    if (variant === "header") {
      inputRef.current?.focus();
    }
  }, [variant]);

  const handleSmartSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setAiMessage("");
    
    try {
      const { data, error } = await supabase.functions.invoke("smart-search", {
        body: { query: searchQuery },
      });

      if (error) throw error;

      if (data?.product_ids?.length > 0) {
        setAiMessage(data.message || "");
        // Navigate with AI results
        const params = new URLSearchParams();
        params.set("q", searchQuery);
        params.set("ai_ids", data.product_ids.join(","));
        if (data.message) params.set("ai_msg", data.message);
        if (data.suggested_filters?.category) params.set("ai_cat", data.suggested_filters.category);
        if (data.suggested_filters?.brand) params.set("ai_brand", data.suggested_filters.brand);
        navigate(`/productos?${params.toString()}`);
        onClose?.();
      } else {
        // Fallback to basic search
        navigate(`/productos?q=${encodeURIComponent(searchQuery)}`);
        onClose?.();
      }
    } catch {
      // Fallback to basic search on error
      navigate(`/productos?q=${encodeURIComponent(searchQuery)}`);
      onClose?.();
    } finally {
      setIsSearching(false);
    }
  }, [navigate, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSmartSearch(query);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    handleSmartSearch(suggestion);
  };

  const isHero = variant === "hero";

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="flex items-center">
        <div className={`relative flex-1 flex items-center ${
          isHero 
            ? "bg-card/10 backdrop-blur-md border border-border/20 rounded-l-lg" 
            : "bg-primary-foreground/5 border-0"
        }`}>
          <Search className={`absolute left-3 md:left-4 h-4 w-4 ${isHero ? 'text-muted-foreground' : 'text-primary-foreground/30'}`} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setShowSuggestions(e.target.value.length === 0);
            }}
            onFocus={() => setShowSuggestions(query.length === 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={placeholder}
            className={`w-full pl-10 md:pl-12 pr-4 py-3 md:py-3.5 bg-transparent outline-none text-sm transition-colors ${
              isHero 
                ? "text-primary-foreground placeholder:text-muted-foreground" 
                : "text-primary-foreground placeholder:text-primary-foreground/30"
            }`}
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} className="absolute right-3 text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className={`shrink-0 px-4 md:px-6 py-3 md:py-3.5 font-condensed uppercase tracking-wider text-xs font-bold transition-all duration-300 flex items-center gap-2 ${
            isHero
              ? "bg-primary hover:bg-primary-glow text-primary-foreground rounded-r-lg"
              : "bg-primary hover:bg-primary-glow text-primary-foreground"
          }`}
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Buscar</span>
            </>
          )}
        </button>
      </form>

      {/* AI message feedback */}
      <AnimatePresence>
        {aiMessage && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-full left-0 right-0 mt-2 px-4 py-2 bg-primary/10 backdrop-blur-md border border-primary/20 rounded-lg"
          >
            <p className="text-xs text-primary flex items-center gap-2">
              <Sparkles size={12} /> {aiMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && !query && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-full left-0 right-0 mt-1 bg-card/95 backdrop-blur-xl border border-border rounded-lg shadow-xl overflow-hidden z-50"
          >
            <p className="px-4 pt-3 pb-1 text-[9px] font-condensed font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Sparkles size={10} className="text-primary" /> Búsquedas sugeridas
            </p>
            {suggestions.map((s) => (
              <button
                key={s}
                onMouseDown={() => handleSuggestionClick(s)}
                className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors flex items-center gap-2"
              >
                <Search size={12} className="text-muted-foreground" />
                {s}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
