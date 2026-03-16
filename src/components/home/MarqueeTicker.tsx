import { Flame, Truck, Shield, Zap } from "lucide-react";

const items = [
  { icon: Flame, text: "OFERTAS IMPERDIBLES" },
  { icon: Truck, text: "ENVÍOS A TODO EL PAÍS" },
  { icon: Shield, text: "CALIDAD GARANTIZADA" },
  { icon: Zap, text: "REPUESTOS ORIGINALES" },
  { icon: Flame, text: "CASCOS · CUBIERTAS · LUBRICANTES" },
  { icon: Truck, text: "ENVÍO GRATIS EN PRODUCTOS SELECCIONADOS" },
  { icon: Shield, text: "TODAS LAS MARCAS" },
  { icon: Zap, text: "ATENCIÓN PERSONALIZADA" },
];

export default function MarqueeTicker() {
  const doubled = [...items, ...items];

  return (
    <div className="bg-primary overflow-hidden py-2.5 select-none">
      <div className="marquee-track">
        {doubled.map(({ icon: Icon, text }, i) => (
          <span key={i} className="flex items-center gap-2 px-8 text-primary-foreground">
            <Icon size={12} strokeWidth={2.5} />
            <span className="text-[10px] font-condensed font-bold tracking-[0.2em] uppercase whitespace-nowrap">
              {text}
            </span>
            <span className="text-primary-foreground/30 mx-4">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
