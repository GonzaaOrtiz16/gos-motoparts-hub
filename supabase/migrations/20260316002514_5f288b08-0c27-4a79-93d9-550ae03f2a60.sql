CREATE TABLE public.heatmap_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  total_events integer DEFAULT 0,
  summary text NOT NULL,
  recommendations jsonb DEFAULT '[]'::jsonb,
  raw_stats jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE public.heatmap_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read heatmap insights"
ON public.heatmap_insights
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service can insert heatmap insights"
ON public.heatmap_insights
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));