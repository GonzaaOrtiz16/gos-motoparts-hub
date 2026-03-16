import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get heatmap data from the last 7 days
    const periodEnd = new Date();
    const periodStart = new Date(Date.now() - 7 * 86400000);

    const { data: events, error: eventsErr } = await supabase
      .from("heatmap_events")
      .select("*")
      .gte("created_at", periodStart.toISOString())
      .lte("created_at", periodEnd.toISOString());

    if (eventsErr) throw eventsErr;
    if (!events || events.length === 0) {
      console.log("No heatmap events found for this period");
      return new Response(JSON.stringify({ message: "Sin datos suficientes para analizar" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Aggregate stats
    const pageViews: Record<string, number> = {};
    const clicksByElement: Record<string, number> = {};
    const scrollDepths: Record<string, number[]> = {};
    let totalClicks = 0;
    let totalScrolls = 0;

    for (const e of events) {
      // Page views
      pageViews[e.page_path] = (pageViews[e.page_path] || 0) + 1;

      if (e.event_type === "click") {
        totalClicks++;
        const key = `${e.element_tag || "unknown"}:${(e.element_text || "").slice(0, 50)}`;
        clicksByElement[key] = (clicksByElement[key] || 0) + 1;
      }

      if (e.event_type === "scroll" && e.scroll_depth != null) {
        totalScrolls++;
        if (!scrollDepths[e.page_path]) scrollDepths[e.page_path] = [];
        scrollDepths[e.page_path].push(e.scroll_depth);
      }
    }

    // Top clicked elements
    const topClicks = Object.entries(clicksByElement)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([el, count]) => `${el} (${count} clics)`);

    // Average scroll depth per page
    const avgScrollByPage = Object.entries(scrollDepths).map(([page, depths]) => ({
      page,
      avgScroll: Math.round(depths.reduce((s, d) => s + d, 0) / depths.length),
      maxScroll: Math.max(...depths),
    }));

    // Top pages
    const topPages = Object.entries(pageViews)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([page, count]) => `${page}: ${count} eventos`);

    // Also fetch product stats for context
    const { data: products } = await supabase.from("products").select("name, price, stock, category, is_on_sale").limit(100);
    const outOfStock = products?.filter(p => (p.stock || 0) <= 0).length || 0;
    const lowStock = products?.filter(p => p.stock && p.stock > 0 && p.stock <= 3).length || 0;

    const rawStats = {
      total_events: events.length,
      total_clicks: totalClicks,
      total_scrolls: totalScrolls,
      unique_pages: Object.keys(pageViews).length,
      top_pages: topPages,
      top_clicked_elements: topClicks,
      scroll_depths: avgScrollByPage,
      products_total: products?.length || 0,
      products_out_of_stock: outOfStock,
      products_low_stock: lowStock,
    };

    // Send to AI for analysis
    const prompt = `Sos un consultor experto en e-commerce y UX para una tienda de repuestos de motos (GO's Motos). Analizá estos datos de la última semana y dame consejos accionables.

DATOS DEL HEATMAP (última semana):
- Total eventos: ${events.length}
- Clics totales: ${totalClicks}
- Scrolls registrados: ${totalScrolls}
- Páginas únicas visitadas: ${Object.keys(pageViews).length}

PÁGINAS MÁS VISITADAS:
${topPages.join("\n")}

ELEMENTOS MÁS CLICKEADOS:
${topClicks.join("\n")}

PROFUNDIDAD DE SCROLL POR PÁGINA:
${avgScrollByPage.map(s => `${s.page}: promedio ${s.avgScroll}%, máx ${s.maxScroll}%`).join("\n")}

ESTADO DEL INVENTARIO:
- Total productos: ${products?.length || 0}
- Sin stock: ${outOfStock}
- Stock bajo (≤3): ${lowStock}

Dame exactamente:
1. Un RESUMEN ejecutivo de 2-3 oraciones sobre el comportamiento de los usuarios
2. Exactamente 5 RECOMENDACIONES accionables y específicas en formato JSON array, cada una con "title" (corto), "description" (1-2 oraciones), y "priority" ("alta", "media", "baja")

Respondé SOLO con un JSON válido así:
{
  "summary": "...",
  "recommendations": [{"title": "...", "description": "...", "priority": "alta|media|baja"}]
}`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!aiResp.ok) throw new Error(`AI error: ${aiResp.status}`);
    const aiResult = await aiResp.json();
    let content = aiResult.choices?.[0]?.message?.content || "";

    // Clean markdown code blocks if present
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { summary: content, recommendations: [] };
    }

    // Store insight
    const { error: insertErr } = await supabase.from("heatmap_insights").insert({
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      total_events: events.length,
      summary: parsed.summary || "Análisis completado",
      recommendations: parsed.recommendations || [],
      raw_stats: rawStats,
    });

    if (insertErr) console.error("Insert error:", insertErr);

    return new Response(JSON.stringify({ success: true, summary: parsed.summary, recommendations: parsed.recommendations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("analyze-heatmap error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
