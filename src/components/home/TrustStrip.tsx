import { motion } from "framer-motion";
import { Truck, Shield, CreditCard, Package } from "lucide-react";

const easeOut = [0.22, 1, 0.36, 1] as const;

export default function TrustStrip({ productCount }: { productCount: number }) {
  const items = [
    { icon: Truck, val: "Nacional", label: "Cobertura de envíos" },
    { icon: Shield, val: "100%", label: "Calidad garantizada" },
    { icon: CreditCard, val: "Flexible", label: "Formas de pago" },
    { icon: Package, val: `${productCount}+`, label: "Productos" },
  ];

  return (
    <section className="bg-foreground/[0.03] border-y border-border/50">
      <div className="container py-8 md:py-10 px-6 md:px-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {items.map(({ icon: Icon, val, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: easeOut }}
              className="flex items-center gap-4 group"
            >
              <div className="bg-foreground p-3 rounded-lg group-hover:bg-primary transition-colors duration-300">
                <Icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-lg font-condensed font-bold text-foreground uppercase">{val}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
