-- Create storage policies using Supabase's storage schema functions
-- These policies allow authenticated users to upload/manage empresa logos

-- Policy: Anyone can view empresa logos (public bucket)
CREATE POLICY "Anyone can view empresa logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'empresa-logos');

-- Policy: Authenticated users can upload empresa logos
CREATE POLICY "Authenticated users can upload logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'empresa-logos');

-- Policy: Authenticated users can update empresa logos
CREATE POLICY "Authenticated users can update logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'empresa-logos');

-- Policy: Authenticated users can delete empresa logos
CREATE POLICY "Authenticated users can delete logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'empresa-logos');