-- Create function to search products by semantic similarity
CREATE OR REPLACE FUNCTION search_produtos_by_embedding(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  empresa_id_param uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  descricao text,
  complemento text,
  categoria text,
  departamento text,
  grupo text,
  subgrupo text,
  preco1 numeric,
  preco2 numeric,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.descricao,
    p.complemento,
    p.categoria,
    p.departamento,
    p.grupo,
    p.subgrupo,
    p.preco1,
    p.preco2,
    1 - (p.embedding <=> query_embedding) as similarity
  FROM public.produtos p
  WHERE 
    p.ativo = true
    AND p.embedding IS NOT NULL
    AND (empresa_id_param IS NULL OR p.empresa_id = empresa_id_param)
    AND 1 - (p.embedding <=> query_embedding) > match_threshold
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;