import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const easeOut = [0.22, 1, 0.36, 1] as const;

export default function CtaBanner() {
  return (
    <section className="container px-4 md:px-16 py-12 md:py-28">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: easeOut }}
        className="relative overflow-hidden bg-foreground p-8 md:p-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-8"
      >
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[80px]" />
        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />

        <div className="relative z-10">
          <p className="text-primary font-condensed text-[10px] tracking-[0.4em] md:tracking-[0.5em] font-bold uppercase mb-2 md:mb-3">Catálogo completo</p>
          <h3 className="text-2xl md:text-5xl font-condensed font-bold text-background uppercase tracking-tight mb-2 md:mb-3">
            Encontrá lo que
            <span className="text-primary"> necesitás</span>
          </h3>
          <p className="text-muted-foreground text-xs md:text-sm">Repuestos, cascos, cubiertas y más para tu moto</p>
        </div>
        <Link to="/productos" className="relative z-10 w-full md:w-auto">
          <Button className="w-full md:w-auto bg-primary hover:bg-primary-glow text-primary-foreground h-12 md:h-14 px-8 md:px-10 text-sm font-condensed font-bold uppercase tracking-wider shadow-xl group transition-all duration-300" style={{ animation: 'pulse-glow 3s ease-in-out infinite' }}>
            Ver Catálogo
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </motion.div>
    </section>
  );
}
