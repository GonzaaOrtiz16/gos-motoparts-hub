-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  image_urls TEXT[] DEFAULT '{}',
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Products are viewable by everyone"
  ON public.products FOR SELECT USING (true);

-- Admin policies (allow all for authenticated users for MVP)
CREATE POLICY "Authenticated users can insert products"
  ON public.products FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update products"
  ON public.products FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete products"
  ON public.products FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('repuestos', 'repuestos', true);

-- Storage policies
CREATE POLICY "Product images are publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'repuestos');

CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'repuestos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete product images"
  ON storage.objects FOR DELETE USING (bucket_id = 'repuestos' AND auth.uid() IS NOT NULL);