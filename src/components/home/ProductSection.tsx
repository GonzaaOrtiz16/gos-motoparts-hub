import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import { SectionHeader } from "./CategoryGrid";

const easeOut = [0.22, 1, 0.36, 1] as const;

interface ProductSectionProps {
  eyebrow: string;
  title: string;
  link?: string;
  products: any[];
  dark?: boolean;
  icon?: any;
}

export default function ProductSection({ eyebrow, title, link, products, dark, icon }: ProductSectionProps) {
  if (products.length === 0) return null;

  return (
    <section className={`${dark ? 'bg-foreground' : ''} py-20 md:py-28 relative overflow-hidden`}>
      {dark && <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[100px]" />}
      <div className="container px-6 md:px-16 relative z-10">
        <SectionHeader eyebrow={eyebrow} title={title} link={link} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.slice(0, 8).map((p: any, i: number) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: easeOut }}
            >
              <ProductCard product={p} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
