import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
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
  const [emblaRef] = useEmblaCarousel({ loop: false, align: "start", dragFree: true });

  if (products.length === 0) return null;

  const items = products.slice(0, 8);

  return (
    <section className={`${dark ? 'bg-foreground' : ''} py-16 md:py-28 relative overflow-hidden`}>
      {dark && <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[100px]" />}
      <div className="container px-4 md:px-16 relative z-10">
        <SectionHeader eyebrow={eyebrow} title={title} link={link} />

        {/* Mobile & Tablet: horizontal carousel */}
        <div ref={emblaRef} className="overflow-hidden lg:hidden -mx-1">
          <div className="flex">
            {items.map((p: any, i: number) => (
              <div key={p.id} className="flex-[0_0_48%] sm:flex-[0_0_35%] min-w-0 px-1.5">
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.04, ease: easeOut }}
                >
                  <ProductCard product={p} />
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: 4-column grid */}
        <div className="hidden lg:grid grid-cols-4 gap-6">
          {items.map((p: any, i: number) => (
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
