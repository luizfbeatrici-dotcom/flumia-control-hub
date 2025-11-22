# Configurações de Segurança - flum.ia

## ⚠️ IMPORTANTE: Headers de Segurança HTTP

Este arquivo contém as configurações de segurança recomendadas para o servidor web.

### Para Netlify
Adicione estas configurações no arquivo `netlify.toml`:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(), microphone=(), camera=()"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://hybuoksgodflxjhjoufv.supabase.co wss://hybuoksgodflxjhjoufv.supabase.co; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
```

### Para Vercel
Adicione estas configurações no arquivo `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "geolocation=(), microphone=(), camera=()"
        }
      ]
    }
  ]
}
```

## 🔒 Medidas de Segurança Implementadas

### 1. Proteção de Tokens em Produção
- Console desabilitado em produção para prevenir exposição de tokens
- Sanitização automática de mensagens de erro
- Redação de dados sensíveis em logs

### 2. Headers de Segurança HTTP
- **HSTS**: Força conexões HTTPS
- **X-Frame-Options**: Previne clickjacking
- **X-Content-Type-Options**: Previne MIME sniffing
- **CSP**: Content Security Policy para prevenir XSS
- **Referrer-Policy**: Controla informações de referência

### 3. Validação de Conexão Segura
- Verificação de HTTPS em produção
- Avisos de segurança em desenvolvimento

### 4. Supabase Auth Configurações
- **PKCE Flow**: Proteção adicional contra interceptação
- **Auto Refresh Token**: Tokens de curta duração
- **Persistent Sessions**: Mantém usuário autenticado com segurança

## 🚨 Limitações de SPAs (Single Page Applications)

### Por que tokens são visíveis no navegador?

**Resposta curta**: É uma característica inevitável de aplicações client-side.

**Explicação técnica**:
1. O Supabase precisa do token para autenticar requisições HTTP
2. O token precisa estar acessível via JavaScript para ser incluído no header `Authorization`
3. HttpOnly cookies não funcionam porque o JavaScript não poderia lê-los para fazer requisições

### Então como é seguro?

**Múltiplas camadas de proteção**:

1. **HTTPS obrigatório em produção** - Criptografa todo tráfego
2. **Tokens de curta duração** - Expiram rapidamente
3. **Refresh Token Rotation** - Tokens são renovados constantemente
4. **Row Level Security (RLS)** - Validação no servidor, não no cliente
5. **Políticas de domínio** - Tokens só funcionam no domínio autorizado

### Mesmo que alguém copie o token?

**Mitigações**:
- Token expira em minutos/horas
- RLS valida TODAS as requisições no servidor
- Detectamos tokens roubados via análise de padrões
- Refresh tokens são rotacionados após uso

## 📋 Checklist de Segurança

- ✅ HTTPS habilitado em produção
- ✅ Headers de segurança HTTP configurados
- ✅ Console desabilitado em produção
- ✅ RLS (Row Level Security) habilitado em todas as tabelas
- ✅ Auditoria de ações administrativas
- ✅ Validação de entrada client-side e server-side
- ✅ Sanitização de erros para não expor tokens
- ✅ PKCE flow para autenticação
- ✅ Auto refresh de tokens

## 🔍 Monitoramento

### Como detectar uso não autorizado?

1. **Logs de Auditoria**: Rastreiam todas ações administrativas
2. **Padrões anormais**: Múltiplos logins de IPs diferentes
3. **Supabase Dashboard**: Monitora sessões ativas
4. **Políticas RLS**: Bloqueiam acesso não autorizado mesmo com token válido

## 📚 Recursos Adicionais

- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Content Security Policy Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
