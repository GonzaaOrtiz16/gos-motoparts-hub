import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import SmartSearch from "@/components/SmartSearch";

const easeOut = [0.22, 1, 0.36, 1] as const;

export default function HeroSection() {
  const [heroLoaded, setHeroLoaded] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  useEffect(() => {
    const t = setTimeout(() => setHeroLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section ref={heroRef} className="relative h-[85vh] md:h-screen flex items-end pb-16 md:items-center md:pb-0 overflow-hidden bg-foreground">
      {/* Background image with parallax */}
      <motion.div style={{ scale: heroScale, y: heroY }} className="absolute inset-0">
        <img
          src="/wheelie-hero.webp"
          alt="Moto de calle haciendo wheelie"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/40 to-foreground/60" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-primary/10 blur-[120px]" />
      </motion.div>

      {/* Content */}
      <motion.div style={{ opacity: heroOpacity }} className="container relative z-10 px-5 md:px-16">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={heroLoaded ? { opacity: 1, width: "auto" } : {}}
            transition={{ duration: 0.8, delay: 0.3, ease: easeOut }}
            className="flex items-center gap-3 mb-5 md:mb-8"
          >
            <div className="h-[2px] w-8 md:w-12 bg-primary" />
            <p className="text-primary font-condensed text-[10px] md:text-xs tracking-[0.4em] md:tracking-[0.5em] font-bold uppercase">
              Repuestos & Accesorios
            </p>
          </motion.div>

          <h2 className="text-primary-foreground leading-[0.85] mb-5 md:mb-8 text-shadow-hero">
            <motion.span
              initial={{ opacity: 0, y: 60 }}
              animate={heroLoaded ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, delay: 0.5, ease: easeOut }}
              className="block text-[3.2rem] md:text-8xl lg:text-[7rem] font-condensed font-bold uppercase tracking-tight"
            >
              Todo para
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 60 }}
              animate={heroLoaded ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, delay: 0.7, ease: easeOut }}
              className="block text-[3.2rem] md:text-8xl lg:text-[7rem] font-condensed font-bold uppercase tracking-tight text-primary text-shadow-glow"
            >
              tu moto
            </motion.span>
          </h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={heroLoaded ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="text-muted-foreground text-xs md:text-base font-light max-w-sm md:max-w-md leading-relaxed mb-6 md:mb-10"
          >
            Repuestos originales, accesorios premium y todo lo que necesitás.
            <span className="text-primary font-medium"> Envíos a todo el país.</span>
          </motion.p>

          {/* Smart Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="max-w-lg"
          >
            <SmartSearch variant="hero" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={heroLoaded ? { opacity: 1 } : {}}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="mt-5 md:mt-8 flex items-center gap-6"
          >
            <a href="/productos" className="text-[10px] md:text-xs text-primary font-bold uppercase tracking-wider flex items-center gap-2 hover:gap-3 transition-all group">
              Ver catálogo completo
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={heroLoaded ? { opacity: 0.5 } : {}}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1"
      >
        <ChevronDown className="h-5 w-5 text-primary-foreground animate-bounce" />
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary z-20" />
    </section>
  );
}
