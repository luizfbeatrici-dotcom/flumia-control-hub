-- Allow public read access to planos table for the landing page
CREATE POLICY "Anyone can view planos"
ON public.planos
FOR SELECT
USING (true);