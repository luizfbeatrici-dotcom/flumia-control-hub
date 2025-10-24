import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PessoaData {
  nome: string;
  cnpjf?: string;
  celular?: string;
  email?: string;
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
    const pessoas = Array.isArray(body) ? body : [body];

    const results = [];
    const errors = [];

    for (const pessoa of pessoas) {
      try {
        // Validar campos obrigatórios
        if (!pessoa.nome) {
          errors.push({
            cnpjf: pessoa.cnpjf,
            error: 'Campo "nome" é obrigatório'
          });
          continue;
        }

        // Preparar dados da pessoa
        const pessoaData: PessoaData & { empresa_id: string } = {
          empresa_id: empresaId,
          nome: pessoa.nome,
          cnpjf: pessoa.cnpjf || null,
          celular: pessoa.celular || null,
          email: pessoa.email || null,
        };

        if (req.method === 'POST') {
          // Inserir nova pessoa
          const { data, error } = await supabase
            .from('pessoas')
            .insert(pessoaData)
            .select()
            .single();

          if (error) {
            console.error('Erro ao inserir pessoa:', error);
            errors.push({
              nome: pessoa.nome,
              cnpjf: pessoa.cnpjf,
              error: error.message
            });
          } else {
            results.push(data);
          }
        } else if (req.method === 'PUT') {
          // Atualizar pessoa existente (buscar por CPF/CNPJ ou email)
          if (!pessoa.cnpjf && !pessoa.email) {
            errors.push({
              nome: pessoa.nome,
              error: 'CPF/CNPJ ou email é obrigatório para atualização (PUT)'
            });
            continue;
          }

          let query = supabase
            .from('pessoas')
            .update(pessoaData)
            .eq('empresa_id', empresaId);

          if (pessoa.cnpjf) {
            query = query.eq('cnpjf', pessoa.cnpjf);
          } else if (pessoa.email) {
            query = query.eq('email', pessoa.email);
          }

          const { data, error } = await query.select().single();

          if (error) {
            console.error('Erro ao atualizar pessoa:', error);
            errors.push({
              nome: pessoa.nome,
              cnpjf: pessoa.cnpjf,
              email: pessoa.email,
              error: error.message
            });
          } else if (!data) {
            errors.push({
              nome: pessoa.nome,
              cnpjf: pessoa.cnpjf,
              email: pessoa.email,
              error: 'Pessoa não encontrada'
            });
          } else {
            results.push(data);
          }
        }
      } catch (err) {
        errors.push({
          nome: pessoa.nome,
          error: err instanceof Error ? err.message : 'Erro desconhecido'
        });
      }
    }

    // Retornar resposta
    const response = {
      success: results.length > 0,
      total: pessoas.length,
      processados: results.length,
      erros: errors.length,
      resultados: results,
      ...(errors.length > 0 && { falhas: errors })
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: errors.length === pessoas.length ? 400 : 200,
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
