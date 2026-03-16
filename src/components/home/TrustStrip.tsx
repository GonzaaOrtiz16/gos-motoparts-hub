import { motion } from "framer-motion";
import { Truck, Shield, CreditCard, Package } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

const easeOut = [0.22, 1, 0.36, 1] as const;

export default function TrustStrip({ productCount }: { productCount: number }) {
  const [emblaRef] = useEmblaCarousel(
    { loop: true, align: "start" },
    [Autoplay({ delay: 2500, stopOnInteraction: false })]
  );

  const items = [
    { icon: Truck, val: "Nacional", label: "Cobertura de envíos" },
    { icon: Shield, val: "100%", label: "Calidad garantizada" },
    { icon: CreditCard, val: "Flexible", label: "Formas de pago" },
    { icon: Package, val: `${productCount}+`, label: "Productos" },
  ];

  const TrustItem = ({ icon: Icon, val, label, i }: { icon: any; val: string; label: string; i: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: i * 0.08, ease: easeOut }}
      className="flex items-center gap-3 md:gap-4 group"
    >
      <div className="bg-foreground p-2.5 md:p-3 rounded-lg group-hover:bg-primary transition-colors duration-300 shrink-0">
        <Icon className="h-4 w-4 md:h-5 md:w-5 text-primary-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-base md:text-lg font-condensed font-bold text-foreground uppercase">{val}</p>
        <p className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
      </div>
    </motion.div>
  );

  return (
    <section className="bg-foreground/[0.03] border-y border-border/50">
      <div className="container py-6 md:py-10 px-4 md:px-16">
        {/* Mobile: auto-scrolling carousel */}
        <div ref={emblaRef} className="overflow-hidden md:hidden">
          <div className="flex">
            {items.map(({ icon, val, label }, i) => (
              <div key={label} className="flex-[0_0_65%] min-w-0 px-2">
                <TrustItem icon={icon} val={val} label={label} i={i} />
              </div>
            ))}
          </div>
        </div>

        {/* Tablet & Desktop: grid */}
        <div className="hidden md:grid grid-cols-4 gap-6 md:gap-8">
          {items.map(({ icon, val, label }, i) => (
            <TrustItem key={label} icon={icon} val={val} label={label} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
