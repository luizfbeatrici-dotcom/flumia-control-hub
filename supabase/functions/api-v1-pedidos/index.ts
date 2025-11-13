import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
      const id = url.searchParams.get('id');
      const numero = url.searchParams.get('numero');
      const status = url.searchParams.get('status');
      const pessoa_id = url.searchParams.get('pessoa_id');
      const data_inicial = url.searchParams.get('data_inicial');
      const data_final = url.searchParams.get('data_final');
      const limit = parseInt(url.searchParams.get('limit') || '100');
      const offset = parseInt(url.searchParams.get('offset') || '0');

      let query = supabase
        .from('pedidos')
        .select(`
          *,
          pessoa:pessoas(id, nome, cnpjf, celular, email),
          endereco:pessoa_enderecos(id, endereco, complemento, bairro, cidade, cep),
          itens:pedido_itens(
            id,
            quantidade,
            valor_unitario,
            valor_total,
            produto:produtos(id, descricao, sku, preco1, preco2)
          ),
          tipo_entrega:empresa_tipos_entrega(
            id,
            valor_frete,
            prazo_estimado,
            tipo_entrega:tipos_entrega(nome, descricao)
          ),
          pagamento:pagamentos(
            id,
            id_transacao,
            status,
            pix_url,
            date_created,
            date_approved
          )
        `)
        .eq('empresa_id', empresaId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Filtro por ID específico
      if (id) {
        query = query.eq('id', id);
        const { data, error } = await query.single();
        
        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return new Response(
          JSON.stringify(data),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Filtros opcionais
      if (numero) {
        query = query.eq('numero', parseInt(numero));
      }

      if (status) {
        query = query.eq('status', status);
      }

      if (pessoa_id) {
        query = query.eq('pessoa_id', pessoa_id);
      }

      if (data_inicial) {
        query = query.gte('created_at', data_inicial);
      }

      if (data_final) {
        query = query.lte('created_at', data_final);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Erro ao buscar pedidos:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          total: count || data.length,
          limit,
          offset,
          pedidos: data
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Método não permitido. Use GET.' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Erro na API:', err);
    const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
