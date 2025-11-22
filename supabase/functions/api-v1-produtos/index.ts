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
  limite_venda?: number;
  saldo?: number;
  saldo_minimo?: number;
  saldo_maximo?: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    // Handle GET request
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const sku = url.searchParams.get('sku');
      const id = url.searchParams.get('id');
      const limit = parseInt(url.searchParams.get('limit') || '100');
      const offset = parseInt(url.searchParams.get('offset') || '0');

      let query = supabase
        .from('produtos')
        .select(`
          *,
          estoque (
            saldo,
            saldo_minimo,
            saldo_maximo
          )
        `)
        .eq('empresa_id', empresaId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (id) {
        query = query.eq('id', id);
        const { data, error } = await query.single();
        
        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Flatten estoque data
        const produtoComEstoque = {
          ...data,
          saldo: data.estoque?.[0]?.saldo || 0,
          saldo_minimo: data.estoque?.[0]?.saldo_minimo || null,
          saldo_maximo: data.estoque?.[0]?.saldo_maximo || null,
          estoque: undefined
        };
        
        return new Response(
          JSON.stringify(produtoComEstoque),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (sku) {
        query = query.eq('sku', sku);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Erro ao buscar produtos:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Flatten estoque data for all products
      const produtosComEstoque = data.map(produto => ({
        ...produto,
        saldo: produto.estoque?.[0]?.saldo || 0,
        saldo_minimo: produto.estoque?.[0]?.saldo_minimo || null,
        saldo_maximo: produto.estoque?.[0]?.saldo_maximo || null,
        estoque: undefined
      }));

      return new Response(
        JSON.stringify({
          success: true,
          total: count || data.length,
          limit,
          offset,
          produtos: produtosComEstoque
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar método para POST e PUT
    if (req.method !== 'POST' && req.method !== 'PUT') {
      return new Response(
        JSON.stringify({ error: 'Método não permitido. Use GET, POST ou PUT.' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
          limite_venda: produto.limite_venda || null,
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
            // Criar ou atualizar estoque
            const estoqueData: any = {
              empresa_id: empresaId,
              produto_id: data.id,
              saldo: produto.saldo !== undefined ? produto.saldo : 0,
            };

            if (produto.saldo_minimo !== undefined) {
              estoqueData.saldo_minimo = produto.saldo_minimo;
            }
            if (produto.saldo_maximo !== undefined) {
              estoqueData.saldo_maximo = produto.saldo_maximo;
            }

            const { error: estoqueError } = await supabase
              .from('estoque')
              .upsert(estoqueData, {
                onConflict: 'produto_id,empresa_id'
              });

            if (estoqueError) {
              console.error('Erro ao criar estoque:', estoqueError);
            }

            results.push({
              id: data.id,
              sku: data.sku,
              descricao: data.descricao,
              saldo: produto.saldo || 0,
              created_at: data.created_at
            });
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
            // Atualizar estoque se fornecido
            if (produto.saldo !== undefined || produto.saldo_minimo !== undefined || produto.saldo_maximo !== undefined) {
              const estoqueData: any = {
                empresa_id: empresaId,
                produto_id: data.id,
              };

              if (produto.saldo !== undefined) {
                estoqueData.saldo = produto.saldo;
              }
              if (produto.saldo_minimo !== undefined) {
                estoqueData.saldo_minimo = produto.saldo_minimo;
              }
              if (produto.saldo_maximo !== undefined) {
                estoqueData.saldo_maximo = produto.saldo_maximo;
              }

              const { error: estoqueError } = await supabase
                .from('estoque')
                .upsert(estoqueData, {
                  onConflict: 'produto_id,empresa_id'
                });

              if (estoqueError) {
                console.error('Erro ao atualizar estoque:', estoqueError);
              }
            }

            results.push({
              id: data.id,
              sku: data.sku,
              descricao: data.descricao,
              saldo: produto.saldo,
              updated_at: data.updated_at
            });
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
    console.error('Erro na API:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
