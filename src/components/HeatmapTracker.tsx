import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Lightweight heatmap tracker — records click positions and max scroll depth.
 * Data is batched and sent to a `heatmap_events` table every 10 seconds.
 * Falls back gracefully if the table doesn't exist yet.
 */

interface HeatEvent {
  type: "click" | "scroll";
  x?: number;
  y?: number;
  scroll_depth?: number;
  path: string;
  viewport_w: number;
  viewport_h: number;
  element_tag?: string;
  element_text?: string;
  ts: number;
}

export default function HeatmapTracker() {
  const buffer = useRef<HeatEvent[]>([]);
  const maxScroll = useRef(0);
  const lastScrollSent = useRef(0);

  const flush = useCallback(async () => {
    if (buffer.current.length === 0) return;
    const batch = [...buffer.current];
    buffer.current = [];

    try {
      await supabase.from("heatmap_events" as any).insert(
        batch.map((e) => ({
          event_type: e.type,
          x: e.x ?? null,
          y: e.y ?? null,
          scroll_depth: e.scroll_depth ?? null,
          page_path: e.path,
          viewport_width: e.viewport_w,
          viewport_height: e.viewport_h,
          element_tag: e.element_tag ?? null,
          element_text: e.element_text ?? null,
          created_at: new Date(e.ts).toISOString(),
        }))
      );
    } catch {
      // table may not exist yet — silently ignore
    }
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      buffer.current.push({
        type: "click",
        x: Math.round(e.pageX),
        y: Math.round(e.pageY),
        path: window.location.pathname,
        viewport_w: window.innerWidth,
        viewport_h: window.innerHeight,
        element_tag: el.tagName.toLowerCase(),
        element_text: el.textContent?.slice(0, 50) || undefined,
        ts: Date.now(),
      });
    };

    const onScroll = () => {
      const depth = Math.round(
        ((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100
      );
      if (depth > maxScroll.current) maxScroll.current = depth;
    };

    const sendScroll = () => {
      if (maxScroll.current > lastScrollSent.current) {
        buffer.current.push({
          type: "scroll",
          scroll_depth: maxScroll.current,
          path: window.location.pathname,
          viewport_w: window.innerWidth,
          viewport_h: window.innerHeight,
          ts: Date.now(),
        });
        lastScrollSent.current = maxScroll.current;
      }
    };

    document.addEventListener("click", onClick, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    const interval = setInterval(() => {
      sendScroll();
      flush();
    }, 10_000);

    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onScroll);
      sendScroll();
      flush();
      clearInterval(interval);
    };
  }, [flush]);

  return null;
}
