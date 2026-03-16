import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { useRef, useState } from "react";

interface MediaBannerProps {
  mediaUrl: string;
  mediaType: string | null;
}

export default function MediaBanner({ mediaUrl, mediaType }: MediaBannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  const handleToggleSound = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
      if (!newMuted) videoRef.current.play().catch(() => {});
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1 }}
      className="relative w-full h-[50vh] md:h-[65vh] overflow-hidden"
    >
      {mediaType === 'video' ? (
        <>
          <video ref={videoRef} src={mediaUrl} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />
          <button
            onClick={handleToggleSound}
            className="absolute top-6 right-6 z-20 flex items-center gap-2 bg-foreground/80 backdrop-blur-sm hover:bg-foreground text-primary-foreground px-4 py-2.5 rounded-lg text-xs font-bold transition-colors"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            <span className="hidden sm:inline font-condensed uppercase tracking-wider">{isMuted ? "Sonido" : "Silenciar"}</span>
          </button>
        </>
      ) : (
        <img src={mediaUrl} alt="Banner GOS Motos" className="absolute inset-0 w-full h-full object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-foreground/30" />
      <div className="absolute bottom-10 left-8 md:bottom-16 md:left-16 z-10">
        <h3 className="text-3xl md:text-5xl font-condensed font-bold text-primary-foreground uppercase leading-tight mb-2">
          Potenciamos <span className="text-primary">tu viaje</span>
        </h3>
        <p className="text-muted-foreground text-xs md:text-sm">
          Repuestos originales · Envíos a todo el país
        </p>
      </div>
      {/* Racing stripe */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary z-20" />
    </motion.section>
  );
}
