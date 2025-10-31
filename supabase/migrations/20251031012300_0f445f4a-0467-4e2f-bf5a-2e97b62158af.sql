-- Enable pgvector extension for vector embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to produtos table
ALTER TABLE public.produtos 
ADD COLUMN embedding vector(1536);

-- Create index for faster similarity search
CREATE INDEX IF NOT EXISTS produtos_embedding_idx 
ON public.produtos 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Add comment to document the column
COMMENT ON COLUMN public.produtos.embedding IS 'Vector embedding (1536 dimensions) for semantic product search';