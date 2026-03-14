
-- 1. Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text DEFAULT '',
  phone text DEFAULT '',
  wants_newsletter boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Allow insert for trigger" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- 2. Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, wants_newsletter)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE((NEW.raw_user_meta_data->>'wants_newsletter')::boolean, false)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Motorcycles table
CREATE TABLE IF NOT EXISTS public.motorcycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  brand text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL,
  kilometers integer NOT NULL DEFAULT 0,
  price numeric NOT NULL,
  images text[] DEFAULT '{}',
  condition text NOT NULL DEFAULT 'Usada',
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.motorcycles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Motorcycles are viewable by everyone" ON public.motorcycles
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert motorcycles" ON public.motorcycles
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update motorcycles" ON public.motorcycles
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete motorcycles" ON public.motorcycles
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 4. Stock movements (admin-only for now)
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  quantity integer NOT NULL,
  movement_type text NOT NULL,
  reason text,
  seller_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage stock movements" ON public.stock_movements
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 5. Add missing product columns
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS barcode text DEFAULT NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cc text[] DEFAULT '{}'::text[];
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS moto_fit text[] DEFAULT '{}'::text[];
