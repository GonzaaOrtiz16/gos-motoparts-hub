import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { items } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "No items provided" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Process in batches of up to 10
    const batchSize = 10;
    const results: any[] = [];

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const itemsList = batch.map((item: any, idx: number) =>
        `${idx + 1}. Código: "${item.code}" | Descripción proveedor: "${item.description}"`
      ).join("\n");

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `Eres un experto en repuestos y accesorios de motos. Tu trabajo es limpiar y enriquecer descripciones de productos de proveedores para una tienda premium de motos llamada GO's Motos.

Para cada producto debes devolver EXACTAMENTE un JSON array con objetos que tengan estos campos:
- "name": nombre comercial limpio y atractivo en español (máx 60 chars)
- "moto_fit": array de strings con modelos de moto compatibles extraídos de la descripción (ej: ["Honda CG 150", "Yamaha YBR 125"]). Si no se puede determinar, devolver ["Universal"]
- "category": una categoría del producto. Opciones: "Frenos", "Motor", "Transmisión", "Estética", "Escapes", "Eléctrico", "Suspensión", "Filtros", "Lubricantes", "Neumáticos", "Accesorios"
- "search_keyword": un término de búsqueda en inglés preciso para encontrar una foto del repuesto (ej: "motorcycle brake pads", "motorcycle chain sprocket kit")

Responde SOLO con el JSON array, sin texto adicional, sin markdown, sin backticks.`
            },
            {
              role: "user",
              content: `Enriquecé estos ${batch.length} productos:\n\n${itemsList}`
            }
          ],
        }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit. Intentá en unos segundos." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (status === 402) {
          return new Response(JSON.stringify({ error: "Créditos de IA agotados." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`AI error: ${status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "[]";
      
      // Parse the JSON from the AI response
      let parsed: any[];
      try {
        // Clean potential markdown wrappers
        const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        parsed = JSON.parse(cleaned);
      } catch {
        console.error("Failed to parse AI response:", content);
        // Fallback: create basic entries
        parsed = batch.map((item: any) => ({
          name: item.description.substring(0, 60),
          moto_fit: ["Universal"],
          category: "Accesorios",
          search_keyword: "motorcycle part"
        }));
      }

      // Merge AI results with original items
      for (let j = 0; j < batch.length; j++) {
        const enriched = parsed[j] || {
          name: batch[j].description.substring(0, 60),
          moto_fit: ["Universal"],
          category: "Accesorios",
          search_keyword: "motorcycle part"
        };
        results.push({
          ...batch[j],
          ai_name: enriched.name,
          ai_moto_fit: enriched.moto_fit,
          ai_category: enriched.category,
          ai_search_keyword: enriched.search_keyword,
        });
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("enrich error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
