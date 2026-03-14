
-- Add vendedor access to stock_movements
CREATE POLICY "Vendedores can view stock movements" ON public.stock_movements
  FOR SELECT USING (public.has_role(auth.uid(), 'vendedor'::app_role));

CREATE POLICY "Vendedores can insert stock movements" ON public.stock_movements
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'vendedor'::app_role));
