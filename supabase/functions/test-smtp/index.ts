import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Início do teste SMTP ===');
    
    // Get JWT token from header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Token de autorização não fornecido');
    }

    console.log('Authorization header presente');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verify JWT and get user
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(jwt);

    console.log('User verificado:', user?.id);

    if (userError || !user) {
      console.error('Erro ao verificar usuário:', userError);
      throw new Error('Não autorizado');
    }

    // Verify user is admin_master
    console.log('Verificando role admin_master para user:', user.id);
    const { data: roles, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin_master')
      .single();

    console.log('Roles encontradas:', roles);

    if (roleError || !roles) {
      console.error('Erro ao verificar role:', roleError);
      throw new Error('Acesso negado. Apenas admin_master pode testar SMTP.');
    }

    const { toEmail } = await req.json();

    if (!toEmail) {
      throw new Error('Email de destino não fornecido');
    }

    // Get SMTP configuration
    const { data: config, error: configError } = await supabaseClient
      .from('platform_config')
      .select('*')
      .single();

    if (configError || !config) {
      throw new Error('Configuração SMTP não encontrada');
    }

    if (!config.smtp_host || !config.smtp_user || !config.smtp_password) {
      throw new Error('Configuração SMTP incompleta. Preencha todos os campos obrigatórios.');
    }

    console.log('Configurações SMTP:', {
      host: config.smtp_host,
      port: config.smtp_port,
      user: config.smtp_user,
      from: config.smtp_from_email,
      fromName: config.smtp_from_name,
      useTls: config.smtp_use_tls,
    });

    // Create SMTP client using denomailer
    const client = new SMTPClient({
      connection: {
        hostname: config.smtp_host,
        port: config.smtp_port || 587,
        tls: false, // Start with non-TLS, will use STARTTLS
        auth: {
          username: config.smtp_user,
          password: config.smtp_password,
        },
      },
    });

    // Create email content
    const fromEmail = config.smtp_from_email || config.smtp_user;
    const fromName = config.smtp_from_name || 'Flum.ia';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #6A0DAD, #9370DB); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    .success-icon { font-size: 48px; margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="success-icon">✅</div>
      <h1 style="margin: 0;">Teste de SMTP Bem-Sucedido!</h1>
    </div>
    <div class="content">
      <h2>Parabéns!</h2>
      <p>Se você está lendo este email, significa que suas configurações de SMTP estão funcionando corretamente.</p>
      
      <h3>Detalhes da Configuração Testada:</h3>
      <ul>
        <li><strong>Servidor SMTP:</strong> ${config.smtp_host}</li>
        <li><strong>Porta:</strong> ${config.smtp_port}</li>
        <li><strong>Usuário:</strong> ${config.smtp_user}</li>
        <li><strong>TLS/SSL:</strong> ${config.smtp_use_tls ? 'Ativado' : 'Desativado'}</li>
      </ul>
      
      <p>Agora você pode usar estas configurações para enviar emails através da plataforma Flum.ia!</p>
    </div>
    <div class="footer">
      <p>Este é um email de teste automático enviado pela plataforma Flum.ia</p>
      <p>Data/Hora: ${new Date().toLocaleString('pt-BR')}</p>
    </div>
  </div>
</body>
</html>
    `;

    console.log('Enviando email...');

    await client.send({
      from: `${fromName} <${fromEmail}>`,
      to: toEmail,
      subject: "Teste de Configuração SMTP - Flum.ia",
      content: "auto",
      html: htmlContent,
    });

    await client.close();

    console.log('Email de teste enviado com sucesso para:', toEmail);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email de teste enviado com sucesso!',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('Erro ao enviar email de teste:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro ao enviar email de teste',
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});