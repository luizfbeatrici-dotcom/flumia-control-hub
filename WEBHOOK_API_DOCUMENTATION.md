# Documentação da API de Webhooks

## Visão Geral

A API de Webhooks permite que você envie dados de **Produtos** e **Pessoas (Clientes)** para o sistema através de requisições HTTP autenticadas com tokens de API.

## Autenticação

Todas as requisições devem incluir um token de API válido no header `Authorization`:

```
Authorization: Bearer SEU_TOKEN_AQUI
```

### Obtendo um Token

1. Acesse o painel administrativo
2. Navegue até **Empresas** > **[Sua Empresa]**
3. Vá para a aba **API Tokens**
4. Clique em **Novo Token**
5. Preencha a descrição e crie o token
6. O token será copiado automaticamente para sua área de transferência

**IMPORTANTE**: Guarde o token em local seguro. Ele não poderá ser visualizado novamente.

## Endpoints Disponíveis

### Base URL

```
https://hybuoksgodflxjhjoufv.supabase.co/functions/v1
```

---

## 1. Webhook de Produtos

### POST /webhook-produtos

Cria um ou mais produtos.

#### Headers

```
Authorization: Bearer SEU_TOKEN
Content-Type: application/json
```

#### Corpo da Requisição

Você pode enviar um único produto ou um array de produtos:

**Produto Único:**
```json
{
  "descricao": "Martelo",
  "sku": "MART001",
  "complemento": "Martelo 500g",
  "preco1": 29.90,
  "preco2": 25.00,
  "unidade": "UN",
  "categoria": "Ferramentas",
  "departamento": "Construção",
  "grupo": "Manuais",
  "subgrupo": "Básicas",
  "visibilidade": "visible",
  "ativo": true
}
```

**Array de Produtos:**
```json
[
  {
    "descricao": "Martelo",
    "sku": "MART001",
    "preco1": 29.90
  },
  {
    "descricao": "Chave de Fenda",
    "sku": "CHAV001",
    "preco1": 12.50
  }
]
```

#### Campos

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| descricao | string | ✅ Sim | Descrição do produto |
| sku | string | ❌ Não | Código único do produto |
| complemento | string | ❌ Não | Informação complementar |
| preco1 | number | ❌ Não | Preço principal |
| preco2 | number | ❌ Não | Preço alternativo |
| unidade | string | ❌ Não | Unidade de medida (UN, KG, etc) |
| categoria | string | ❌ Não | Categoria do produto |
| departamento | string | ❌ Não | Departamento |
| grupo | string | ❌ Não | Grupo |
| subgrupo | string | ❌ Não | Subgrupo |
| visibilidade | string | ❌ Não | `visible`, `hidden`, `catalog_only` |
| ativo | boolean | ❌ Não | Status do produto (padrão: true) |

#### Resposta de Sucesso

```json
{
  "success": true,
  "total": 2,
  "processados": 2,
  "erros": 0,
  "resultados": [
    {
      "id": "uuid-do-produto",
      "empresa_id": "uuid-da-empresa",
      "descricao": "Martelo",
      "sku": "MART001",
      "preco1": 29.90,
      "created_at": "2025-10-24T00:00:00Z"
    }
  ]
}
```

---

### PUT /webhook-produtos

Atualiza um ou mais produtos existentes.

#### Headers

```
Authorization: Bearer SEU_TOKEN
Content-Type: application/json
```

#### Corpo da Requisição

```json
{
  "sku": "MART001",
  "descricao": "Martelo Premium",
  "preco1": 35.90,
  "ativo": true
}
```

**IMPORTANTE**: O campo `sku` é obrigatório para atualizações (PUT). O sistema busca o produto pelo SKU da empresa.

#### Resposta de Sucesso

```json
{
  "success": true,
  "total": 1,
  "processados": 1,
  "erros": 0,
  "resultados": [
    {
      "id": "uuid-do-produto",
      "descricao": "Martelo Premium",
      "preco1": 35.90,
      "updated_at": "2025-10-24T00:00:00Z"
    }
  ]
}
```

---

## 2. Webhook de Pessoas (Clientes)

### POST /webhook-pessoas

Cria uma ou mais pessoas/clientes.

#### Headers

```
Authorization: Bearer SEU_TOKEN
Content-Type: application/json
```

#### Corpo da Requisição

**Pessoa Única:**
```json
{
  "nome": "João Silva",
  "cnpjf": "12345678901",
  "celular": "11999998888",
  "email": "joao@example.com"
}
```

**Array de Pessoas:**
```json
[
  {
    "nome": "João Silva",
    "cnpjf": "12345678901",
    "email": "joao@example.com"
  },
  {
    "nome": "Maria Santos",
    "cnpjf": "98765432100",
    "celular": "11988887777"
  }
]
```

#### Campos

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| nome | string | ✅ Sim | Nome completo |
| cnpjf | string | ❌ Não | CPF ou CNPJ (sem formatação) |
| celular | string | ❌ Não | Telefone celular |
| email | string | ❌ Não | E-mail |

#### Resposta de Sucesso

```json
{
  "success": true,
  "total": 1,
  "processados": 1,
  "erros": 0,
  "resultados": [
    {
      "id": "uuid-da-pessoa",
      "empresa_id": "uuid-da-empresa",
      "nome": "João Silva",
      "cnpjf": "12345678901",
      "email": "joao@example.com",
      "created_at": "2025-10-24T00:00:00Z"
    }
  ]
}
```

---

### PUT /webhook-pessoas

Atualiza uma ou mais pessoas existentes.

#### Headers

```
Authorization: Bearer SEU_TOKEN
Content-Type: application/json
```

#### Corpo da Requisição

```json
{
  "cnpjf": "12345678901",
  "nome": "João Silva Júnior",
  "celular": "11999999999",
  "email": "joao.jr@example.com"
}
```

**IMPORTANTE**: Para atualizações (PUT), você deve fornecer pelo menos um dos seguintes campos para localizar a pessoa:
- `cnpjf` (CPF/CNPJ)
- `email`

O sistema busca a pessoa por esses identificadores e atualiza os dados fornecidos.

---

## Códigos de Resposta HTTP

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso - Dados processados |
| 400 | Erro - Dados inválidos ou falha no processamento |
| 401 | Não autorizado - Token inválido ou ausente |
| 405 | Método não permitido - Use POST ou PUT |
| 500 | Erro interno do servidor |

---

## Exemplos de Uso

### cURL - Criar Produto

```bash
curl -X POST \
  https://hybuoksgodflxjhjoufv.supabase.co/functions/v1/webhook-produtos \
  -H 'Authorization: Bearer SEU_TOKEN_AQUI' \
  -H 'Content-Type: application/json' \
  -d '{
    "descricao": "Parafuso 10mm",
    "sku": "PAR010",
    "preco1": 0.50,
    "unidade": "UN"
  }'
```

### cURL - Atualizar Produto

```bash
curl -X PUT \
  https://hybuoksgodflxjhjoufv.supabase.co/functions/v1/webhook-produtos \
  -H 'Authorization: Bearer SEU_TOKEN_AQUI' \
  -H 'Content-Type: application/json' \
  -d '{
    "sku": "PAR010",
    "preco1": 0.75
  }'
```

### cURL - Criar Cliente

```bash
curl -X POST \
  https://hybuoksgodflxjhjoufv.supabase.co/functions/v1/webhook-pessoas \
  -H 'Authorization: Bearer SEU_TOKEN_AQUI' \
  -H 'Content-Type: application/json' \
  -d '{
    "nome": "Maria Santos",
    "cnpjf": "98765432100",
    "email": "maria@example.com",
    "celular": "11988887777"
  }'
```

### Python - Exemplo Completo

```python
import requests
import json

# Configuração
API_BASE = "https://hybuoksgodflxjhjoufv.supabase.co/functions/v1"
TOKEN = "SEU_TOKEN_AQUI"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

# Criar múltiplos produtos
produtos = [
    {
        "descricao": "Produto 1",
        "sku": "PROD001",
        "preco1": 10.00
    },
    {
        "descricao": "Produto 2",
        "sku": "PROD002",
        "preco1": 20.00
    }
]

response = requests.post(
    f"{API_BASE}/webhook-produtos",
    headers=headers,
    json=produtos
)

print(response.json())
```

### JavaScript/Node.js - Exemplo

```javascript
const axios = require('axios');

const API_BASE = 'https://hybuoksgodflxjhjoufv.supabase.co/functions/v1';
const TOKEN = 'SEU_TOKEN_AQUI';

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type': 'application/json'
};

// Criar cliente
async function criarCliente() {
  try {
    const response = await axios.post(
      `${API_BASE}/webhook-pessoas`,
      {
        nome: 'João Silva',
        cnpjf: '12345678901',
        email: 'joao@example.com'
      },
      { headers }
    );
    
    console.log('Cliente criado:', response.data);
  } catch (error) {
    console.error('Erro:', error.response.data);
  }
}

criarCliente();
```

---

## Tratamento de Erros

Quando há erros no processamento, a resposta incluirá um array `falhas` com detalhes:

```json
{
  "success": false,
  "total": 2,
  "processados": 1,
  "erros": 1,
  "resultados": [
    {
      "id": "uuid-do-produto",
      "descricao": "Produto 1"
    }
  ],
  "falhas": [
    {
      "sku": "PROD002",
      "error": "Campo 'descricao' é obrigatório"
    }
  ]
}
```

---

## Boas Práticas

1. **Segurança**: Nunca exponha seu token em repositórios públicos ou logs
2. **Rate Limiting**: Implemente delays entre requisições em massa
3. **Validação**: Valide os dados antes de enviar para evitar erros
4. **Logs**: Mantenha logs das requisições para debugging
5. **Retry**: Implemente retry logic para falhas temporárias de rede
6. **Batch**: Para grandes volumes, envie dados em lotes de 50-100 registros

---

## Suporte

Para dúvidas ou problemas, entre em contato com o suporte técnico.
