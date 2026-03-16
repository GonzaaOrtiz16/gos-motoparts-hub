import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Sparkles, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "¿Cuántos productos tengo sin stock?",
  "Subí un 10% los precios de cascos",
  "Dame un resumen del inventario",
  "¿Qué marcas tengo cargadas?",
];

export default function AdminAiDrawer() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    const userMsg: Msg = { role: "user", content: msg };
    setInput("");
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Sesión expirada. Volvé a iniciar sesión." }]);
        setLoading(false);
        return;
      }

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-ai`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            messages: [...messages, userMsg].map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        }
      );

      const data = await resp.json();
      if (!resp.ok) {
        setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ ${data.error || "Error del asistente"}` }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Error de conexión." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground p-3.5 rounded-2xl shadow-2xl shadow-primary/30 border border-primary/20"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Asistente IA Admin"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={22} />
            </motion.div>
          ) : (
            <motion.div key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Bot size={22} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-6 z-50 w-[420px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[75vh] bg-card/95 backdrop-blur-xl border border-border rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-border flex items-center gap-3 bg-card">
              <div className="bg-primary/10 p-2 rounded-xl">
                <Sparkles size={18} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-foreground uppercase tracking-wide">Cerebro Admin</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">IA con acceso total a la DB</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground p-1">
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-8 space-y-4">
                  <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto">
                    <Bot size={28} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">¿Qué necesitás, jefe?</p>
                    <p className="text-xs text-muted-foreground mt-1">Puedo consultar, modificar precios, gestionar stock y más</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {SUGGESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => send(q)}
                        className="text-[11px] px-3 py-1.5 bg-muted text-muted-foreground rounded-xl hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[88%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}
                  >
                    {m.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0 [&>ul]:my-1 [&>ol]:my-1 [&>table]:text-xs">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    ) : (
                      m.content
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground">Procesando...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); send(); }}
              className="px-4 py-3 border-t border-border flex gap-2 bg-card"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Dameuna orden..."
                className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/30 transition-shadow"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-primary text-primary-foreground p-2.5 rounded-xl disabled:opacity-40 hover:bg-primary/90 transition-colors"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
