import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

const easeOut = [0.22, 1, 0.36, 1] as const;

const categoryIcons: Record<string, string> = {
  Cascos: "🪖", Cubiertas: "🛞", Lubricantes: "🛢️", Repuestos: "⚙️",
  Accesorios: "🎒", Indumentaria: "🧥", Baterías: "🔋", Escapes: "💨",
};

interface CategoryData {
  name: string;
  count: number;
  image: string | null;
}

export default function CategoryGrid({ categories, isLoading }: { categories: CategoryData[]; isLoading: boolean }) {
  const [emblaRef] = useEmblaCarousel(
    { loop: true, align: "start", dragFree: true }
  );

  if (isLoading) return null;

  const CategoryCard = ({ cat, i }: { cat: CategoryData; i: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: i * 0.06, ease: easeOut }}
    >
      <Link to={`/productos?categoria=${cat.name}`} className="group block relative overflow-hidden">
        <div className="aspect-[4/3] bg-foreground relative">
          {cat.image ? (
            <img src={cat.image} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 opacity-70 group-hover:opacity-90" alt={cat.name} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-foreground">
              <span className="text-4xl md:text-5xl opacity-60">{categoryIcons[cat.name] || "📦"}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="font-condensed text-primary-foreground text-sm md:text-xl font-bold uppercase tracking-wide leading-tight">{cat.name}</p>
                <p className="text-primary-foreground/40 text-[9px] md:text-[10px] font-bold uppercase tracking-wider">{cat.count} producto{cat.count !== 1 ? 's' : ''}</p>
              </div>
              <ArrowRight size={14} className="text-primary opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 hidden md:block" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-0 group-hover:w-full h-[3px] bg-primary transition-all duration-500" />
        </div>
      </Link>
    </motion.div>
  );

  return (
    <section className="container py-16 md:py-28 px-4 md:px-16">
      <SectionHeader eyebrow="Explorá" title="Categorías" link="/productos" />

      {categories.length > 0 ? (
        <>
          {/* Mobile & Tablet: Carousel */}
          <div ref={emblaRef} className="overflow-hidden lg:hidden -mx-1">
            <div className="flex">
              {categories.map((cat, i) => (
                <div key={cat.name} className="flex-[0_0_42%] sm:flex-[0_0_30%] min-w-0 px-1.5">
                  <CategoryCard cat={cat} i={i} />
                </div>
              ))}
            </div>
          </div>

          {/* Desktop: Grid — all in one row */}
          <div
            className="hidden lg:grid gap-3"
            style={{ gridTemplateColumns: `repeat(${Math.min(categories.length, 8)}, 1fr)` }}
          >
            {categories.map((cat, i) => (
              <CategoryCard key={cat.name} cat={cat} i={i} />
            ))}
          </div>
        </>
      ) : (
        <div className="py-16 text-center border-2 border-dashed border-border rounded-lg">
          <p className="text-muted-foreground text-sm">Creá categorías desde el panel Admin</p>
        </div>
      )}
    </section>
  );
}

function SectionHeader({ eyebrow, title, link }: { eyebrow: string; title: string; link?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: easeOut }}
      className="mb-8 md:mb-14"
    >
      <div className="flex items-end justify-between">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-1 h-10 md:h-12 bg-primary rounded-full" />
          <div>
            <p className="text-[9px] tracking-[0.4em] md:tracking-[0.5em] font-condensed font-bold uppercase text-muted-foreground">{eyebrow}</p>
            <h3 className="text-2xl md:text-5xl font-condensed font-bold uppercase tracking-tight text-foreground">{title}</h3>
          </div>
        </div>
        {link && (
          <Link to={link} className="text-[10px] md:text-xs font-bold text-primary hover:text-primary-glow flex items-center gap-1 pb-1 uppercase tracking-wider transition-colors">
            Ver todo <ArrowRight size={14} />
          </Link>
        )}
      </div>
    </motion.div>
  );
}

export { SectionHeader };
