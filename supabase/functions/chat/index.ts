import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Eres el Asistente Técnico y Comercial Premium de GO's Motos. Tu objetivo es asesorar sobre accesorios, repuestos y compatibilidades.

REGLAS:
- Analiza el modelo de moto del cliente y recomienda solo productos compatibles según el contexto de inventario provisto.
- Tu tono es profesional, persuasivo y de alta gama.
- Si un producto no tiene stock, ofrécelo a pedido.
- Si la consulta requiere coordinación para el taller, instalación compleja o atención humana directa, deriva al cliente cortésmente al WhatsApp de ventas: https://wa.me/5491165483728
- Responde en español rioplatense.
- Sé conciso pero informativo. Usa formato markdown cuando ayude.
- Cuando muestres precios, usa formato moneda argentina (ARS).`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, motoModel } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // RAG: fetch relevant products from DB
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract search terms from latest user message
    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user")?.content || "";

    let query = supabase.from("products").select("name, title, price, original_price, stock, category, brand, moto_fit, cc, is_on_sale, free_shipping").gt("stock", 0);

    // If user mentions a moto model, filter by moto_fit
    if (motoModel) {
      query = query.contains("moto_fit", [motoModel]);
    }

    const { data: products } = await query.limit(50);

    // Build context
    const productContext = products && products.length > 0
      ? products.map((p: any) => `- ${p.title || p.name} | Marca: ${p.brand || 'N/A'} | Precio: $${p.price} ${p.is_on_sale && p.original_price ? `(antes $${p.original_price})` : ''} | Stock: ${p.stock} | Categoría: ${p.category || 'N/A'} | Compatible: ${(p.moto_fit || []).join(', ') || 'Universal'} | CC: ${(p.cc || []).join(', ') || 'N/A'} ${p.free_shipping ? '| Envío Gratis' : ''}`).join("\n")
      : "No se encontraron productos en inventario actualmente.";

    const contextPrompt = `\n\nINVENTARIO ACTUAL (${products?.length || 0} productos en stock):\n${productContext}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + contextPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const t = await response.text();
      console.error("AI gateway error:", status, t);

      if (status === 429) {
        return new Response(JSON.stringify({ error: "Demasiadas consultas. Intentá de nuevo en unos segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA agotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Error del asistente" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
