import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Brain, TrendingUp, AlertTriangle, Lightbulb, RefreshCw, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Recommendation = {
  title: string;
  description: string;
  priority: "alta" | "media" | "baja";
};

const priorityConfig = {
  alta: { color: "text-red-500 bg-red-500/10", icon: AlertTriangle },
  media: { color: "text-amber-500 bg-amber-500/10", icon: TrendingUp },
  baja: { color: "text-emerald-500 bg-emerald-500/10", icon: Lightbulb },
};

export default function HeatmapInsightsCard() {
  const [generating, setGenerating] = useState(false);

  const { data: insight, isLoading, refetch } = useQuery({
    queryKey: ["heatmap-insights-latest"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("heatmap_insights")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-heatmap`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error);
      toast.success("Análisis generado correctamente");
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Error al generar análisis");
    } finally {
      setGenerating(false);
    }
  };

  const recommendations = (insight?.recommendations || []) as Recommendation[];
  const daysAgo = insight
    ? Math.round((Date.now() - new Date(insight.created_at).getTime()) / 86400000)
    : null;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2.5 rounded-xl">
            <Brain size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wide text-foreground">Insights IA</h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {daysAgo !== null ? `Último análisis: hace ${daysAgo === 0 ? "hoy" : `${daysAgo}d`}` : "Sin análisis previo"}
              {insight?.total_events ? ` · ${insight.total_events} eventos` : ""}
            </p>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
        >
          {generating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          {generating ? "Analizando..." : "Generar ahora"}
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
        </div>
      ) : !insight ? (
        <div className="text-center py-6 space-y-2">
          <Brain size={32} className="mx-auto text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No hay análisis todavía</p>
          <p className="text-xs text-muted-foreground/70">Hacé clic en "Generar ahora" para el primer reporte</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-foreground/90 leading-relaxed bg-muted/50 rounded-xl p-4">
            {insight.summary}
          </p>

          {recommendations.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Recomendaciones</p>
              {recommendations.map((rec, i) => {
                const config = priorityConfig[rec.priority] || priorityConfig.media;
                const Icon = config.icon;
                return (
                  <div key={i} className="flex gap-3 items-start p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className={`p-1.5 rounded-lg flex-shrink-0 ${config.color}`}>
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground">{rec.title}</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{rec.description}</p>
                    </div>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${config.color}`}>
                      {rec.priority}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
