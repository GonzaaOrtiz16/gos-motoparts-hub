import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Eres el Asistente Administrativo Premium de GO's Motos. Sos un cerebro operativo con acceso total a la base de datos.

CAPACIDADES:
- Consultar productos, stock, categorías, motos, movimientos de stock
- Modificar precios (individuales o masivos), stock, descripciones
- Analizar datos de negocio (productos sin stock, más vendidos, etc.)
- Enriquecer catálogo (mejorar descripciones, asignar categorías, moto_fit)
- Generar reportes y resúmenes

REGLAS:
- Respondé en español rioplatense, tono profesional pero cercano.
- Usá formato markdown cuando ayude.
- Cuando modifiques datos, confirmá exactamente qué vas a cambiar ANTES de hacerlo.
- Mostrá precios en formato ARS.
- Sé conciso y eficiente.
- Si no podés hacer algo, explicá por qué y sugerí alternativas.

Tenés acceso a herramientas (tools) para interactuar con la base de datos. Usalas para responder consultas y ejecutar operaciones.`;

const tools = [
  {
    type: "function",
    function: {
      name: "query_products",
      description: "Buscar productos en la base de datos. Puede filtrar por nombre, categoría, marca, stock, precio, etc.",
      parameters: {
        type: "object",
        properties: {
          search: { type: "string", description: "Texto de búsqueda en nombre/título" },
          category: { type: "string", description: "Filtrar por categoría" },
          brand: { type: "string", description: "Filtrar por marca" },
          low_stock: { type: "boolean", description: "Si true, solo muestra productos con stock <= 3" },
          out_of_stock: { type: "boolean", description: "Si true, solo muestra productos sin stock" },
          limit: { type: "number", description: "Cantidad máxima de resultados (default 20)" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_product",
      description: "Actualizar uno o más campos de un producto por su ID",
      parameters: {
        type: "object",
        properties: {
          product_id: { type: "string", description: "ID del producto a actualizar" },
          updates: {
            type: "object",
            description: "Campos a actualizar",
            properties: {
              name: { type: "string" },
              title: { type: "string" },
              price: { type: "number" },
              original_price: { type: "number" },
              stock: { type: "number" },
              category: { type: "string" },
              brand: { type: "string" },
              description: { type: "string" },
              is_on_sale: { type: "boolean" },
              free_shipping: { type: "boolean" },
              moto_fit: { type: "array", items: { type: "string" } },
              cc: { type: "array", items: { type: "string" } },
            },
          },
        },
        required: ["product_id", "updates"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "bulk_update_prices",
      description: "Actualizar precios masivamente por categoría, marca, o todos. Puede ser un porcentaje de aumento/descuento o un precio fijo.",
      parameters: {
        type: "object",
        properties: {
          filter_by: { type: "string", enum: ["category", "brand", "all"], description: "Tipo de filtro" },
          filter_value: { type: "string", description: "Valor del filtro (nombre de categoría o marca)" },
          action: { type: "string", enum: ["increase_percent", "decrease_percent", "set_price"], description: "Tipo de acción" },
          value: { type: "number", description: "Porcentaje o precio fijo" },
          set_on_sale: { type: "boolean", description: "Si true, marca los productos como en oferta y guarda el precio anterior" },
        },
        required: ["filter_by", "action", "value"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_stats",
      description: "Obtener estadísticas del negocio: total productos, valor de inventario, productos sin stock, categorías, etc.",
      parameters: {
        type: "object",
        properties: {
          stat_type: {
            type: "string",
            enum: ["overview", "by_category", "by_brand", "low_stock_report", "stock_movements"],
            description: "Tipo de estadística",
          },
          days: { type: "number", description: "Para stock_movements: últimos N días (default 7)" },
        },
        required: ["stat_type"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_categories",
      description: "Listar todas las categorías disponibles",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "query_motorcycles",
      description: "Buscar motos en la base de datos",
      parameters: {
        type: "object",
        properties: {
          search: { type: "string", description: "Búsqueda por marca/modelo/título" },
          brand: { type: "string", description: "Filtrar por marca" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_product",
      description: "Crear un nuevo producto en la base de datos",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          price: { type: "number" },
          title: { type: "string" },
          stock: { type: "number" },
          category: { type: "string" },
          brand: { type: "string" },
          description: { type: "string" },
          moto_fit: { type: "array", items: { type: "string" } },
          cc: { type: "array", items: { type: "string" } },
          barcode: { type: "string" },
          is_on_sale: { type: "boolean" },
          free_shipping: { type: "boolean" },
        },
        required: ["name", "price"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_product",
      description: "Eliminar un producto por su ID. Usar con precaución.",
      parameters: {
        type: "object",
        properties: {
          product_id: { type: "string", description: "ID del producto a eliminar" },
        },
        required: ["product_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_heatmap_insights",
      description: "Obtener los últimos insights/consejos generados por IA a partir del mapa de calor de la web. Incluye resumen de comportamiento de usuarios y recomendaciones.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Cantidad de insights a traer (default 3)" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_heatmap_raw",
      description: "Consultar datos crudos del mapa de calor: clics, scroll, páginas más visitadas. Útil para análisis detallado.",
      parameters: {
        type: "object",
        properties: {
          days: { type: "number", description: "Últimos N días (default 7)" },
          page_path: { type: "string", description: "Filtrar por página específica" },
        },
      },
    },
  },
];

// Tool execution functions
async function executeToolCall(supabase: any, name: string, args: any): Promise<string> {
  try {
    switch (name) {
      case "query_products": {
        let query = supabase.from("products").select("id, name, title, price, original_price, stock, category, brand, moto_fit, cc, is_on_sale, free_shipping, barcode, description");
        if (args.search) query = query.or(`name.ilike.%${args.search}%,title.ilike.%${args.search}%`);
        if (args.category) query = query.eq("category", args.category);
        if (args.brand) query = query.ilike("brand", `%${args.brand}%`);
        if (args.low_stock) query = query.lte("stock", 3).gt("stock", 0);
        if (args.out_of_stock) query = query.lte("stock", 0);
        const { data, error } = await query.limit(args.limit || 20);
        if (error) return JSON.stringify({ error: error.message });
        return JSON.stringify({ count: data.length, products: data });
      }

      case "update_product": {
        const { data, error } = await supabase.from("products").update(args.updates).eq("id", args.product_id).select().single();
        if (error) return JSON.stringify({ error: error.message });
        return JSON.stringify({ success: true, updated: data });
      }

      case "bulk_update_prices": {
        let query = supabase.from("products").select("id, name, price, original_price, category, brand");
        if (args.filter_by === "category") query = query.eq("category", args.filter_value);
        if (args.filter_by === "brand") query = query.ilike("brand", `%${args.filter_value}%`);
        const { data: products, error: fetchErr } = await query;
        if (fetchErr) return JSON.stringify({ error: fetchErr.message });
        if (!products?.length) return JSON.stringify({ error: "No se encontraron productos con ese filtro" });

        let updated = 0;
        for (const p of products) {
          let newPrice = p.price;
          if (args.action === "increase_percent") newPrice = Math.round(p.price * (1 + args.value / 100));
          else if (args.action === "decrease_percent") newPrice = Math.round(p.price * (1 - args.value / 100));
          else if (args.action === "set_price") newPrice = args.value;

          const updateData: any = { price: newPrice };
          if (args.set_on_sale) {
            updateData.is_on_sale = true;
            updateData.original_price = p.price;
          }
          const { error } = await supabase.from("products").update(updateData).eq("id", p.id);
          if (!error) updated++;
        }
        return JSON.stringify({ success: true, total_found: products.length, updated, action: args.action, value: args.value });
      }

      case "query_stats": {
        if (args.stat_type === "overview") {
          const { data: products } = await supabase.from("products").select("price, stock");
          const total = products?.length || 0;
          const outOfStock = products?.filter((p: any) => (p.stock || 0) <= 0).length || 0;
          const lowStock = products?.filter((p: any) => p.stock > 0 && p.stock <= 3).length || 0;
          const totalValue = products?.reduce((s: number, p: any) => s + (p.price || 0) * (p.stock || 0), 0) || 0;
          const avgPrice = total ? Math.round(products.reduce((s: number, p: any) => s + p.price, 0) / total) : 0;
          return JSON.stringify({ total_products: total, out_of_stock: outOfStock, low_stock: lowStock, inventory_value_ars: totalValue, avg_price: avgPrice });
        }
        if (args.stat_type === "by_category") {
          const { data } = await supabase.from("products").select("category, price, stock");
          const cats: Record<string, { count: number; value: number }> = {};
          data?.forEach((p: any) => {
            const c = p.category || "Sin categoría";
            if (!cats[c]) cats[c] = { count: 0, value: 0 };
            cats[c].count++;
            cats[c].value += (p.price || 0) * (p.stock || 0);
          });
          return JSON.stringify(cats);
        }
        if (args.stat_type === "by_brand") {
          const { data } = await supabase.from("products").select("brand, price, stock");
          const brands: Record<string, { count: number; value: number }> = {};
          data?.forEach((p: any) => {
            const b = p.brand || "Sin marca";
            if (!brands[b]) brands[b] = { count: 0, value: 0 };
            brands[b].count++;
            brands[b].value += (p.price || 0) * (p.stock || 0);
          });
          return JSON.stringify(brands);
        }
        if (args.stat_type === "low_stock_report") {
          const { data } = await supabase.from("products").select("id, name, stock, category, brand").lte("stock", 3).order("stock", { ascending: true }).limit(30);
          return JSON.stringify(data);
        }
        if (args.stat_type === "stock_movements") {
          const days = args.days || 7;
          const since = new Date(Date.now() - days * 86400000).toISOString();
          const { data } = await supabase.from("stock_movements").select("*, products(name)").gte("created_at", since).order("created_at", { ascending: false }).limit(50);
          return JSON.stringify(data);
        }
        return JSON.stringify({ error: "Tipo de estadística no válido" });
      }

      case "query_categories": {
        const { data, error } = await supabase.from("categorias").select("*");
        if (error) return JSON.stringify({ error: error.message });
        return JSON.stringify(data);
      }

      case "query_motorcycles": {
        let query = supabase.from("motorcycles").select("*");
        if (args.search) query = query.or(`brand.ilike.%${args.search}%,model.ilike.%${args.search}%,title.ilike.%${args.search}%`);
        if (args.brand) query = query.ilike("brand", `%${args.brand}%`);
        const { data, error } = await query.limit(20);
        if (error) return JSON.stringify({ error: error.message });
        return JSON.stringify(data);
      }

      case "create_product": {
        const { data, error } = await supabase.from("products").insert({
          name: args.name,
          price: args.price,
          title: args.title || args.name,
          stock: args.stock ?? 0,
          category: args.category,
          brand: args.brand,
          description: args.description,
          moto_fit: args.moto_fit,
          cc: args.cc,
          barcode: args.barcode,
          is_on_sale: args.is_on_sale ?? false,
          free_shipping: args.free_shipping ?? false,
        }).select().single();
        if (error) return JSON.stringify({ error: error.message });
        return JSON.stringify({ success: true, created: data });
      }

      case "delete_product": {
        const { error } = await supabase.from("products").delete().eq("id", args.product_id);
        if (error) return JSON.stringify({ error: error.message });
        return JSON.stringify({ success: true, deleted_id: args.product_id });
      }

      default:
        return JSON.stringify({ error: `Tool ${name} not found` });
    }
  } catch (e) {
    return JSON.stringify({ error: e instanceof Error ? e.message : "Error ejecutando herramienta" });
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Verify auth - must be admin
    const authHeader = req.headers.get("authorization");
    if (!authHeader) throw new Error("No autorizado");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Verify user is admin
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) throw new Error("No autorizado");

    const serviceClient = createClient(supabaseUrl, supabaseKey);
    const { data: roles } = await serviceClient.from("user_roles").select("role").eq("user_id", user.id);
    const isAdmin = roles?.some((r: any) => r.role === "admin");
    if (!isAdmin) throw new Error("Se requiere rol de administrador");

    const { messages } = await req.json();

    // Call AI with tools
    let aiMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages,
    ];

    // Loop for tool calls (max 5 iterations)
    for (let i = 0; i < 5; i++) {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: aiMessages,
          tools,
        }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 429) return new Response(JSON.stringify({ error: "Demasiadas consultas, intentá en unos segundos." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (status === 402) return new Response(JSON.stringify({ error: "Créditos de IA agotados." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        throw new Error("Error del asistente IA");
      }

      const result = await response.json();
      const choice = result.choices?.[0];

      if (!choice) throw new Error("Sin respuesta del modelo");

      // If the model wants to call tools
      if (choice.finish_reason === "tool_calls" && choice.message?.tool_calls?.length) {
        aiMessages.push(choice.message);

        // Execute all tool calls
        for (const tc of choice.message.tool_calls) {
          const args = typeof tc.function.arguments === "string" ? JSON.parse(tc.function.arguments) : tc.function.arguments;
          console.log(`Executing tool: ${tc.function.name}`, args);
          const result = await executeToolCall(serviceClient, tc.function.name, args);
          aiMessages.push({
            role: "tool",
            tool_call_id: tc.id,
            content: result,
          });
        }
        continue; // Loop back to get AI's response with tool results
      }

      // Final text response
      const content = choice.message?.content || "No pude generar una respuesta.";
      return new Response(JSON.stringify({ content }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ content: "Se alcanzó el límite de operaciones. Intentá una consulta más específica." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("admin-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
