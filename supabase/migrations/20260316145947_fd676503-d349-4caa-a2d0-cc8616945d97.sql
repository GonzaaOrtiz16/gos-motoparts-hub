
-- Cascos integrales
UPDATE products SET images = ARRAY['https://ncuqyqkhsactolcjwbyk.supabase.co/storage/v1/object/public/repuestos/products%2Fcasco-integral.webp'], image_urls = ARRAY['https://ncuqyqkhsactolcjwbyk.supabase.co/storage/v1/object/public/repuestos/products%2Fcasco-integral.webp']
WHERE lower(name) LIKE '%integral%' AND category = 'Cascos';

-- Casco rebatible
UPDATE products SET images = ARRAY['https://ncuqyqkhsactolcjwbyk.supabase.co/storage/v1/object/public/repuestos/products%2Fcasco-rebatible.webp'], image_urls = ARRAY['https://ncuqyqkhsactolcjwbyk.supabase.co/storage/v1/object/public/repuestos/products%2Fcasco-rebatible.webp']
WHERE lower(name) LIKE '%rebatible%' AND category = 'Cascos';

-- Casco abierto
UPDATE products SET images = ARRAY['https://ncuqyqkhsactolcjwbyk.supabase.co/storage/v1/object/public/repuestos/products%2Fcasco-abierto.webp'], image_urls = ARRAY['https://ncuqyqkhsactolcjwbyk.supabase.co/storage/v1/object/public/repuestos/products%2Fcasco-abierto.webp']
WHERE lower(name) LIKE '%abierto%' AND category = 'Cascos';

-- Casco LS2 701 Explorer
UPDATE products SET images = ARRAY['https://ncuqyqkhsactolcjwbyk.supabase.co/storage/v1/object/public/repuestos/products%2Fcasco-integral.webp'], image_urls = ARRAY['https://ncuqyqkhsactolcjwbyk.supabase.co/storage/v1/object/public/repuestos/products%2Fcasco-integral.webp']
WHERE lower(name) LIKE '%701%' AND category = 'Cascos';

-- Casco Mac mujer
UPDATE products SET images = ARRAY['https://ncuqyqkhsactolcjwbyk.supabase.co/storage/v1/object/public/repuestos/products%2Fcasco-mujer.webp'], image_urls = ARRAY['https://ncuqyqkhsactolcjwbyk.supabase.co/storage/v1/object/public/repuestos/products%2Fcasco-mujer.webp']
WHERE lower(name) LIKE '%mac%' AND category = 'Cascos';

-- Casco bicicleta
UPDATE products SET images = ARRAY['https://ncuqyqkhsactolcjwbyk.supabase.co/storage/v1/object/public/repuestos/products%2Fcasco-bici.webp'], image_urls = ARRAY['https://ncuqyqkhsactolcjwbyk.supabase.co/storage/v1/object/public/repuestos/products%2Fcasco-bici.webp']
WHERE lower(name) LIKE '%bicicleta%' AND category = 'Cascos';

-- Cubiertas
UPDATE products SET images = ARRAY['https://ncuqyqkhsactolcjwbyk.supabase.co/storage/v1/object/public/repuestos/products%2Fcubierta.webp'], image_urls = ARRAY['https://ncuqyqkhsactolcjwbyk.supabase.co/storage/v1/object/public/repuestos/products%2Fcubierta.webp']
WHERE category = 'Cubiertas' AND lower(name) LIKE '%cubierta%';

-- Cámaras
UPDATE products SET images = ARRAY['https://ncuqyqkhsactolcjwbyk.supabase.co/storage/v1/object/public/repuestos/products%2Fcamara.webp'], image_urls = ARRAY['https://ncuqyqkhsactolcjwbyk.supabase.co/storage/v1/object/public/repuestos/products%2Fcamara.webp']
WHERE lower(name) LIKE '%mara%' AND category = 'Cubiertas';

-- Kit cubiertas
UPDATE products SET images = ARRAY['https://ncuqyqkhsactolcjwbyk.supabase.co/storage/v1/object/public/repuestos/products%2Fcubierta.webp'], image_urls = ARRAY['https://ncuqyqkhsactolcjwbyk.supabase.co/storage/v1/object/public/repuestos/products%2Fcubierta.webp']
WHERE category = 'Cubiertas' AND lower(name) LIKE '%kit%';

-- Escapes
UPDATE products SET images = ARRAY['https://ncuqyqkhsactolcjwbyk.supabase.co/storage/v1/object/public/repuestos/products%2Fescape.webp'], image_urls = ARRAY['https://ncuqyqkhsactolcjwbyk.supabase.co/storage/v1/object/public/repuestos/products%2Fescape.webp']
WHERE category = 'Escapes';

-- Baterías
UPDATE products SET images = ARRAY['https://ncuqyqkhsactolcjwbyk.supabase.co/storage/v1/object/public/repuestos/products%2Fbateria.webp'], image_urls = ARRAY['https://ncuqyqkhsactolcjwbyk.supabase.co/storage/v1/object/public/repuestos/products%2Fbateria.webp']
WHERE category = 'Baterías';

-- Accesorios
UPDATE products SET images = ARRAY['https://ncuqyqkhsactolcjwbyk.supabase.co/storage/v1/object/public/repuestos/products%2Fbaul.webp'], image_urls = ARRAY['https://ncuqyqkhsactolcjwbyk.supabase.co/storage/v1/object/public/repuestos/products%2Fbaul.webp']
WHERE category = 'Accesorios';

-- Lubricantes
UPDATE products SET images = ARRAY['https://ncuqyqkhsactolcjwbyk.supabase.co/storage/v1/object/public/repuestos/products%2Faceite.webp'], image_urls = ARRAY['https://ncuqyqkhsactolcjwbyk.supabase.co/storage/v1/object/public/repuestos/products%2Faceite.webp']
WHERE category = 'Lubricantes';

-- Indumentaria camperas
UPDATE products SET images = ARRAY['https://ncuqyqkhsactolcjwbyk.supabase.co/storage/v1/object/public/repuestos/products%2Fcampera.webp'], image_urls = ARRAY['https://ncuqyqkhsactolcjwbyk.supabase.co/storage/v1/object/public/repuestos/products%2Fcampera.webp']
WHERE category = 'Indumentaria' AND (lower(name) LIKE '%campera%' OR lower(name) LIKE '%chaleco%');

-- Indumentaria guantes
UPDATE products SET images = ARRAY['https://ncuqyqkhsactolcjwbyk.supabase.co/storage/v1/object/public/repuestos/products%2Fguantes.webp'], image_urls = ARRAY['https://ncuqyqkhsactolcjwbyk.supabase.co/storage/v1/object/public/repuestos/products%2Fguantes.webp']
WHERE category = 'Indumentaria' AND lower(name) LIKE '%guante%';

-- Indumentaria fallback
UPDATE products SET images = ARRAY['https://ncuqyqkhsactolcjwbyk.supabase.co/storage/v1/object/public/repuestos/products%2Fcampera.webp'], image_urls = ARRAY['https://ncuqyqkhsactolcjwbyk.supabase.co/storage/v1/object/public/repuestos/products%2Fcampera.webp']
WHERE category = 'Indumentaria' AND (images IS NULL OR array_length(images, 1) IS NULL OR images[1] LIKE '%mitiendanube%');

-- Repuestos pastillas
UPDATE products SET images = ARRAY['https://ncuqyqkhsactolcjwbyk.supabase.co/storage/v1/object/public/repuestos/products%2Fpastillas-freno.webp'], image_urls = ARRAY['https://ncuqyqkhsactolcjwbyk.supabase.co/storage/v1/object/public/repuestos/products%2Fpastillas-freno.webp']
WHERE category = 'Repuestos' AND (lower(name) LIKE '%pastilla%' OR lower(name) LIKE '%freno%');

-- Repuestos kit transmision
UPDATE products SET images = ARRAY['https://ncuqyqkhsactolcjwbyk.supabase.co/storage/v1/object/public/repuestos/products%2Fkit-transmision.webp'], image_urls = ARRAY['https://ncuqyqkhsactolcjwbyk.supabase.co/storage/v1/object/public/repuestos/products%2Fkit-transmision.webp']
WHERE category = 'Repuestos' AND (lower(name) LIKE '%transmisi%' OR lower(name) LIKE '%cadena%' OR lower(name) LIKE '%corona%');

-- Repuestos faro/led
UPDATE products SET images = ARRAY['https://ncuqyqkhsactolcjwbyk.supabase.co/storage/v1/object/public/repuestos/products%2Ffaro-led.webp'], image_urls = ARRAY['https://ncuqyqkhsactolcjwbyk.supabase.co/storage/v1/object/public/repuestos/products%2Ffaro-led.webp']
WHERE category = 'Repuestos' AND (lower(name) LIKE '%faro%' OR lower(name) LIKE '%led%' OR lower(name) LIKE '%luz%');

-- Repuestos fallback
UPDATE products SET images = ARRAY['https://ncuqyqkhsactolcjwbyk.supabase.co/storage/v1/object/public/repuestos/products%2Fpastillas-freno.webp'], image_urls = ARRAY['https://ncuqyqkhsactolcjwbyk.supabase.co/storage/v1/object/public/repuestos/products%2Fpastillas-freno.webp']
WHERE category = 'Repuestos' AND (images IS NULL OR array_length(images, 1) IS NULL OR images[1] LIKE '%mitiendanube%');

-- Cubiertas fallback (delantera sin match)
UPDATE products SET images = ARRAY['https://ncuqyqkhsactolcjwbyk.supabase.co/storage/v1/object/public/repuestos/products%2Fcubierta.webp'], image_urls = ARRAY['https://ncuqyqkhsactolcjwbyk.supabase.co/storage/v1/object/public/repuestos/products%2Fcubierta.webp']
WHERE category = 'Cubiertas' AND (images IS NULL OR array_length(images, 1) IS NULL OR images[1] LIKE '%mitiendanube%');
