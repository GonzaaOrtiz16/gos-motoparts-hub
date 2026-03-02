import React, { useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageCarouselProps {
  images: string[];
  className?: string;
  aspectRatio?: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, className = "", aspectRatio = "aspect-square" }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const fallback = "/placeholder.svg";
  const imgs = images.length > 0 ? images : [fallback];

  return (
    <div className={`relative group overflow-hidden rounded-3xl ${className}`}>
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {imgs.map((src, i) => (
            <div key={i} className={`flex-[0_0_100%] min-w-0 ${aspectRatio}`}>
              <img
                src={src}
                alt={`Imagen ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      {imgs.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {imgs.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === selectedIndex ? "bg-primary w-4" : "bg-foreground/40"}`}
                aria-label={`Ir a imagen ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ImageCarousel;
