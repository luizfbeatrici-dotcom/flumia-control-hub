import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function sendPasswordResetEmail(config: any, toEmail: string, resetLink: string) {
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
.button { display: inline-block; padding: 12px 24px; background: #6A0DAD; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
.footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
</style>
</head>
<body>
<div class="container">
<div class="header">
<h1 style="margin: 0;">Redefinição de Senha</h1>
</div>
<div class="content">
<h2>Olá!</h2>
<p>Recebemos uma solicitação para redefinir sua senha na plataforma Flum.ia.</p>
<p>Para criar uma nova senha, clique no botão abaixo:</p>
<div style="text-align: center;">
<a href="${resetLink}" class="button">Redefinir Senha</a>
</div>
<p style="margin-top: 30px; font-size: 12px; color: #666;">
Se você não solicitou a redefinição de senha, ignore este email. Seu acesso permanecerá seguro.
</p>
<p style="font-size: 12px; color: #666;">
Este link expirará em 1 hora por motivos de segurança.
</p>
</div>
<div class="footer">
<p>Email enviado automaticamente pela plataforma Flum.ia</p>
<p>Data/Hora: ${new Date().toLocaleString('pt-BR')}</p>
</div>
</div>
</body>
</html>`;

  console.log('Conectando ao servidor SMTP para envio de redefinição de senha...');
  
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
    await readLine();
    await writeLine(`EHLO ${config.smtp_host}`);
    await readLine();
    await writeLine('STARTTLS');
    await readLine();

    console.log('Iniciando TLS...');
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

    await writeLineTls(`EHLO ${config.smtp_host}`);
    await readLineTls();
    await writeLineTls('AUTH LOGIN');
    await readLineTls();
    await writeLineTls(btoa(config.smtp_user));
    await readLineTls();
    await writeLineTls(btoa(config.smtp_password));
    const authResponse = await readLineTls();
    
    if (!authResponse.includes('235')) {
      throw new Error('Falha na autenticação SMTP: ' + authResponse);
    }

    await writeLineTls(`MAIL FROM:<${fromEmail}>`);
    await readLineTls();
    await writeLineTls(`RCPT TO:<${toEmail}>`);
    await readLineTls();
    await writeLineTls('DATA');
    await readLineTls();

    const emailContent = [
      `From: ${fromName} <${fromEmail}>`,
      `To: ${toEmail}`,
      `Subject: Redefinição de Senha - Flum.ia`,
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

    await writeLineTls('QUIT');
    tlsConn.close();
    console.log('Email de redefinição de senha enviado com sucesso!');
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
    console.log('=== Início do envio de email de redefinição de senha ===');
    
    const { email } = await req.json();

    if (!email) {
      throw new Error('Email não fornecido');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verificar configuração SMTP
    const { data: config, error: configError } = await supabaseClient
      .from('platform_config')
      .select('*')
      .single();

    if (configError || !config) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Configuração SMTP não encontrada. Configure o servidor SMTP em Configurações da Plataforma.',
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

    if (!config.smtp_host || !config.smtp_user || !config.smtp_password) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Configuração SMTP incompleta. Configure todos os campos SMTP em Configurações da Plataforma.',
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

    // Verificar se o usuário existe
    const { data: userData, error: userError } = await supabaseClient.auth.admin.listUsers();
    
    if (userError) {
      throw new Error('Erro ao verificar usuário');
    }

    const user = userData.users.find(u => u.email === email);
    
    if (!user) {
      // Por segurança, retornar sucesso mesmo se o email não existir
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Se este email estiver cadastrado, você receberá um link de redefinição de senha.',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Gerar link de redefinição
    const redirectUrl = Deno.env.get('SUPABASE_URL')?.includes('localhost') 
      ? 'http://localhost:3000/reset-password'
      : `${new URL(Deno.env.get('SUPABASE_URL') || '').origin.replace('hybuoksgodflxjhjoufv.supabase.co', 'd71de021-fc77-418e-a382-ef3bc876e815.lovableproject.com')}/reset-password`;
    
    const { data: resetData, error: resetError } = await supabaseClient.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: redirectUrl
      }
    });

    if (resetError || !resetData) {
      throw new Error('Erro ao gerar link de redefinição');
    }

    console.log('Enviando email de redefinição para:', email);
    await sendPasswordResetEmail(config, email, resetData.properties.action_link);
    console.log('Email de redefinição enviado com sucesso!');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email de redefinição de senha enviado com sucesso!',
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
    console.error('Erro ao enviar email de redefinição:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro ao enviar email de redefinição de senha',
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
