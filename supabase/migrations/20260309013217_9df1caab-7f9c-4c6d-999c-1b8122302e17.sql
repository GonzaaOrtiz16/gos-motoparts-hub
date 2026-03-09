
-- Add new columns to products table
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS brand text,
  ADD COLUMN IF NOT EXISTS stock integer DEFAULT 10,
  ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS original_price numeric,
  ADD COLUMN IF NOT EXISTS free_shipping boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_on_sale boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS sizes text[] DEFAULT '{}'::text[];

-- Copy name to title where title is null
UPDATE public.products SET title = name WHERE title IS NULL;

-- Create categorias table
CREATE TABLE IF NOT EXISTS public.categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  slug text,
  tipo text DEFAULT 'repuestos',
  image text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categorias are viewable by everyone" ON public.categorias FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert categorias" ON public.categorias FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update categorias" ON public.categorias FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete categorias" ON public.categorias FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- Create site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  home_media_url text DEFAULT '',
  home_media_type text DEFAULT 'image',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site settings are viewable by everyone" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can update site_settings" ON public.site_settings FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert site_settings" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- Insert default settings row
INSERT INTO public.site_settings (home_media_url, home_media_type) VALUES ('', 'image');
