import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function sendEmail(config: any, toEmail: string) {
  const fromEmail = config.smtp_from_email || config.smtp_user;
  const fromName = config.smtp_from_name || 'Flum.ia';
  
  const htmlContent = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8">
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
</ul>
<p>Agora você pode usar estas configurações para enviar emails através da plataforma Flum.ia!</p>
</div>
<div class="footer">
<p>Este é um email de teste automático enviado pela plataforma Flum.ia</p>
<p>Data/Hora: ${new Date().toLocaleString('pt-BR')}</p>
</div>
</div>
</body>
</html>`;

  console.log('Conectando ao servidor SMTP...');
  
  // Conectar ao servidor SMTP
  const conn = await Deno.connect({
    hostname: config.smtp_host,
    port: config.smtp_port,
  });

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  async function readLine(): Promise<string> {
    const buffer = new Uint8Array(1024);
    const n = await conn.read(buffer);
    const response = decoder.decode(buffer.subarray(0, n || 0));
    console.log('SMTP <<', response.trim());
    return response;
  }

  async function writeLine(data: string) {
    console.log('SMTP >>', data);
    await conn.write(encoder.encode(data + '\r\n'));
  }

  try {
    // Ler mensagem de boas-vindas
    await readLine();

    // EHLO
    await writeLine(`EHLO ${config.smtp_host}`);
    await readLine();

    // STARTTLS
    await writeLine('STARTTLS');
    await readLine();

    console.log('Iniciando TLS...');
    // Upgrade para TLS
    const tlsConn = await Deno.startTls(conn, { hostname: config.smtp_host });

    async function readLineTls(): Promise<string> {
      const buffer = new Uint8Array(1024);
      const n = await tlsConn.read(buffer);
      const response = decoder.decode(buffer.subarray(0, n || 0));
      console.log('TLS <<', response.trim());
      return response;
    }

    async function writeLineTls(data: string) {
      console.log('TLS >>', data);
      await tlsConn.write(encoder.encode(data + '\r\n'));
    }

    // EHLO novamente após TLS
    await writeLineTls(`EHLO ${config.smtp_host}`);
    await readLineTls();

    // AUTH LOGIN
    await writeLineTls('AUTH LOGIN');
    await readLineTls();

    // Enviar username em base64
    await writeLineTls(btoa(config.smtp_user));
    await readLineTls();

    // Enviar password em base64
    await writeLineTls(btoa(config.smtp_password));
    const authResponse = await readLineTls();
    
    if (!authResponse.includes('235')) {
      throw new Error('Falha na autenticação SMTP: ' + authResponse);
    }

    // MAIL FROM
    await writeLineTls(`MAIL FROM:<${fromEmail}>`);
    await readLineTls();

    // RCPT TO
    await writeLineTls(`RCPT TO:<${toEmail}>`);
    await readLineTls();

    // DATA
    await writeLineTls('DATA');
    await readLineTls();

    // Enviar conteúdo do email
    const emailContent = [
      `From: ${fromName} <${fromEmail}>`,
      `To: ${toEmail}`,
      `Subject: Teste de Configuração SMTP - Flum.ia`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=utf-8`,
      '',
      htmlContent,
      '.',
    ].join('\r\n');

    await writeLineTls(emailContent);
    const dataResponse = await readLineTls();
    
    if (!dataResponse.includes('250')) {
      throw new Error('Falha ao enviar email: ' + dataResponse);
    }

    // QUIT
    await writeLineTls('QUIT');
    
    tlsConn.close();
    console.log('Email enviado com sucesso via SMTP!');
  } catch (error) {
    conn.close();
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Início do teste SMTP ===');
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Token de autorização não fornecido');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(jwt);

    if (userError || !user) {
      throw new Error('Não autorizado');
    }

    const { data: roles, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin_master')
      .single();

    if (roleError || !roles) {
      throw new Error('Acesso negado. Apenas admin_master pode testar SMTP.');
    }

    const { toEmail } = await req.json();

    if (!toEmail) {
      throw new Error('Email de destino não fornecido');
    }

    const { data: config, error: configError } = await supabaseClient
      .from('platform_config')
      .select('*')
      .single();

    if (configError || !config) {
      throw new Error('Configuração SMTP não encontrada');
    }

    if (!config.smtp_host || !config.smtp_user || !config.smtp_password) {
      throw new Error('Configuração SMTP incompleta.');
    }

    console.log('Enviando email para:', toEmail);
    await sendEmail(config, toEmail);
    console.log('Email enviado com sucesso!');

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
    console.error('Erro ao enviar email:', error);
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