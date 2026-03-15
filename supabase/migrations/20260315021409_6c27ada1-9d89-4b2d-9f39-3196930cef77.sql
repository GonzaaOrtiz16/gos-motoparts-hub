
CREATE TABLE public.heatmap_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  x integer,
  y integer,
  scroll_depth integer,
  page_path text NOT NULL,
  viewport_width integer,
  viewport_height integer,
  element_tag text,
  element_text text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.heatmap_events ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (anonymous tracking)
CREATE POLICY "Anyone can insert heatmap events" ON public.heatmap_events
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Only admins can read
CREATE POLICY "Admins can read heatmap events" ON public.heatmap_events
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
