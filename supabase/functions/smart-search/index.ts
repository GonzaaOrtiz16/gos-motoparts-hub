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
    const { query } = await req.json();
    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ error: "Query requerida" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all products for AI context
    const { data: products } = await supabase
      .from("products")
      .select("id, name, title, price, original_price, stock, category, brand, moto_fit, cc, is_on_sale, free_shipping, description")
      .gt("stock", 0)
      .limit(200);

    const productList = (products || []).map((p: any) =>
      `ID:${p.id} | ${p.title || p.name} | Marca:${p.brand || 'N/A'} | Cat:${p.category || 'N/A'} | $${p.price} | Fit:${(p.moto_fit || []).join(',')} | CC:${(p.cc || []).join(',')} | ${p.description?.slice(0, 80) || ''}`
    ).join("\n");

    const systemPrompt = `Eres un motor de búsqueda inteligente para GO's Motos (tienda de repuestos y accesorios de motos en Argentina).

Tu trabajo es interpretar la intención del usuario y devolver los IDs de productos más relevantes.

REGLAS:
- Entiende sinónimos: "cubre" = "cubierta", "tapa" = "carcasa", "aceite" = "lubricante", "farol" = "óptica/faro"
- Entiende modelos: "ybr" = "Yamaha YBR", "titan" = "Honda CG Titan", "rouser" = "Bajaj Rouser"
- Si buscan por moto, filtrá por moto_fit y CC compatibles
- Si buscan "barato" o "económico", priorizá precio bajo
- Si buscan "oferta" o "descuento", priorizá is_on_sale
- Si buscan "envío gratis", priorizá free_shipping
- Devolvé máximo 20 IDs, ordenados por relevancia
- Si no hay resultados relevantes, devolvé array vacío

INVENTARIO (${products?.length || 0} productos):
${productList}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_search_results",
              description: "Return the search results as an array of product IDs ordered by relevance, plus a short helpful message for the user.",
              parameters: {
                type: "object",
                properties: {
                  product_ids: {
                    type: "array",
                    items: { type: "string" },
                    description: "Array of product IDs sorted by relevance"
                  },
                  message: {
                    type: "string",
                    description: "Short helpful message for the user in Spanish (e.g. 'Encontré 5 cascos compatibles con tu YBR')"
                  },
                  suggested_filters: {
                    type: "object",
                    properties: {
                      category: { type: "string" },
                      brand: { type: "string" },
                      price_range: { type: "string", enum: ["low", "mid", "high"] }
                    },
                    description: "Suggested filters based on user intent"
                  }
                },
                required: ["product_ids", "message"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "return_search_results" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Demasiadas consultas. Intentá de nuevo." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA agotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const args = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(args), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ product_ids: [], message: "No encontré resultados." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("smart-search error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
