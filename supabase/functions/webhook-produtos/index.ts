import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProdutoData {
  descricao: string;
  sku?: string;
  complemento?: string;
  preco1?: number;
  preco2?: number;
  unidade?: string;
  categoria?: string;
  departamento?: string;
  grupo?: string;
  subgrupo?: string;
  visibilidade?: 'visible' | 'hidden' | 'catalog_only';
  ativo?: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validar método
    if (req.method !== 'POST' && req.method !== 'PUT') {
      return new Response(
        JSON.stringify({ error: 'Método não permitido. Use POST ou PUT.' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Obter token do header Authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Token de autenticação não fornecido' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Inicializar Supabase client com service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validar token e obter empresa_id
    const { data: tokenData, error: tokenError } = await supabase
      .from('api_tokens')
      .select('empresa_id, ativo')
      .eq('token', token)
      .eq('ativo', true)
      .single();

    if (tokenError || !tokenData) {
      console.error('Token inválido:', tokenError);
      return new Response(
        JSON.stringify({ error: 'Token inválido ou inativo' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const empresaId = tokenData.empresa_id;

    // Parse do body
    const body = await req.json();
    const produtos = Array.isArray(body) ? body : [body];

    const results = [];
    const errors = [];

    for (const produto of produtos) {
      try {
        // Validar campos obrigatórios
        if (!produto.descricao) {
          errors.push({
            sku: produto.sku,
            error: 'Campo "descricao" é obrigatório'
          });
          continue;
        }

        // Preparar dados do produto
        const produtoData: ProdutoData & { empresa_id: string } = {
          empresa_id: empresaId,
          descricao: produto.descricao,
          sku: produto.sku || null,
          complemento: produto.complemento || null,
          preco1: produto.preco1 || null,
          preco2: produto.preco2 || null,
          unidade: produto.unidade || null,
          categoria: produto.categoria || null,
          departamento: produto.departamento || null,
          grupo: produto.grupo || null,
          subgrupo: produto.subgrupo || null,
          visibilidade: produto.visibilidade || 'visible',
          ativo: produto.ativo !== undefined ? produto.ativo : true,
        };

        if (req.method === 'POST') {
          // Inserir novo produto
          const { data, error } = await supabase
            .from('produtos')
            .insert(produtoData)
            .select()
            .single();

          if (error) {
            console.error('Erro ao inserir produto:', error);
            errors.push({
              sku: produto.sku,
              error: error.message
            });
          } else {
            results.push(data);
          }
        } else if (req.method === 'PUT') {
          // Atualizar produto existente (buscar por SKU)
          if (!produto.sku) {
            errors.push({
              descricao: produto.descricao,
              error: 'SKU é obrigatório para atualização (PUT)'
            });
            continue;
          }

          const { data, error } = await supabase
            .from('produtos')
            .update(produtoData)
            .eq('empresa_id', empresaId)
            .eq('sku', produto.sku)
            .select()
            .single();

          if (error) {
            console.error('Erro ao atualizar produto:', error);
            errors.push({
              sku: produto.sku,
              error: error.message
            });
          } else if (!data) {
            errors.push({
              sku: produto.sku,
              error: 'Produto não encontrado'
            });
          } else {
            results.push(data);
          }
        }
      } catch (err) {
        errors.push({
          sku: produto.sku,
          error: err instanceof Error ? err.message : 'Erro desconhecido'
        });
      }
    }

    // Retornar resposta
    const response = {
      success: results.length > 0,
      total: produtos.length,
      processados: results.length,
      erros: errors.length,
      resultados: results,
      ...(errors.length > 0 && { falhas: errors })
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: errors.length === produtos.length ? 400 : 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erro no webhook:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
