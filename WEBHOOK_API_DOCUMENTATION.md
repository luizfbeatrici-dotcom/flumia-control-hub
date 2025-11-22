# Documentação da API REST

## Visão Geral

A API REST permite que você gerencie **Produtos** e **Pessoas (Clientes)** através de requisições HTTP autenticadas com tokens de API.

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

## Base URL

```
https://hybuoksgodflxjhjoufv.supabase.co/functions/v1/api/v1
```

> **Nota**: As URLs legadas `/webhook-produtos` e `/webhook-pessoas` continuam funcionando para compatibilidade.

---

## 1. API de Produtos

### GET /produtos

Lista produtos com suporte a filtros e paginação.

#### Headers

```
Authorization: Bearer SEU_TOKEN
```

#### Parâmetros de Query (opcionais)

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | string | Buscar produto por ID específico |
| sku | string | Filtrar por SKU |
| limit | number | Limite de resultados (padrão: 100) |
| offset | number | Offset para paginação (padrão: 0) |

#### Exemplos de Requisição

**Listar produtos com paginação:**
```bash
curl -X GET \
  'https://hybuoksgodflxjhjoufv.supabase.co/functions/v1/api/v1/produtos?limit=10&offset=0' \
  -H 'Authorization: Bearer SEU_TOKEN_AQUI'
```

**Buscar produto por SKU:**
```bash
curl -X GET \
  'https://hybuoksgodflxjhjoufv.supabase.co/functions/v1/api/v1/produtos?sku=MART001' \
  -H 'Authorization: Bearer SEU_TOKEN_AQUI'
```

**Buscar produto por ID:**
```bash
curl -X GET \
  'https://hybuoksgodflxjhjoufv.supabase.co/functions/v1/api/v1/produtos?id=uuid-do-produto' \
  -H 'Authorization: Bearer SEU_TOKEN_AQUI'
```

#### Resposta de Sucesso (Lista)

```json
{
  "success": true,
  "total": 2,
  "limit": 100,
  "offset": 0,
  "produtos": [
    {
      "id": "uuid-do-produto",
      "empresa_id": "uuid-da-empresa",
      "descricao": "Martelo",
      "sku": "MART001",
      "preco1": 29.90,
      "ativo": true,
      "saldo": 100,
      "saldo_minimo": 10,
      "saldo_maximo": 500,
      "created_at": "2025-10-24T00:00:00Z"
    }
  ]
}
```

#### Resposta de Sucesso (Produto Único)

Quando buscar por ID, retorna o produto diretamente:

```json
{
  "id": "uuid-do-produto",
  "empresa_id": "uuid-da-empresa",
  "descricao": "Martelo",
  "sku": "MART001",
  "preco1": 29.90,
  "ativo": true,
  "saldo": 100,
  "saldo_minimo": 10,
  "saldo_maximo": 500,
  "created_at": "2025-10-24T00:00:00Z"
}
```

---

### POST /produtos

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
  "ativo": true,
  "limite_venda": 10,
  "saldo": 100,
  "saldo_minimo": 10,
  "saldo_maximo": 500
}
```

**Array de Produtos:**
```json
[
  {
    "descricao": "Martelo",
    "sku": "MART001",
    "preco1": 29.90,
    "saldo": 100
  },
  {
    "descricao": "Chave de Fenda",
    "sku": "CHAV001",
    "preco1": 12.50,
    "saldo": 50
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
| limite_venda | number | ❌ Não | Quantidade máxima por venda |
| saldo | number | ❌ Não | Quantidade em estoque (padrão: 0) |
| saldo_minimo | number | ❌ Não | Estoque mínimo para alertas |
| saldo_maximo | number | ❌ Não | Estoque máximo permitido |

#### Resposta de Sucesso

```json
{
  "success": true,
  "total": 2,
  "processados": 2,
  "erros": 0,
  "resultados": [
    {
      "id": "uuid-do-produto-1",
      "sku": "MART001",
      "descricao": "Martelo",
      "saldo": 100,
      "created_at": "2025-10-24T00:00:00Z"
    },
    {
      "id": "uuid-do-produto-2",
      "sku": "CHAV001",
      "descricao": "Chave de Fenda",
      "saldo": 50,
      "created_at": "2025-10-24T00:00:00Z"
    }
  ]
}
```

---

### PUT /produtos

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
  "ativo": true,
  "saldo": 150,
  "saldo_minimo": 20
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
      "sku": "MART001",
      "descricao": "Martelo Premium",
      "saldo": 150,
      "updated_at": "2025-10-24T00:00:00Z"
    }
  ]
}
```

---

## 2. API de Pessoas (Clientes)

### GET /pessoas

Lista pessoas com suporte a filtros e paginação.

#### Headers

```
Authorization: Bearer SEU_TOKEN
```

#### Parâmetros de Query (opcionais)

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | string | Buscar pessoa por ID específico |
| cnpjf | string | Filtrar por CPF/CNPJ |
| email | string | Filtrar por email |
| limit | number | Limite de resultados (padrão: 100) |
| offset | number | Offset para paginação (padrão: 0) |

#### Exemplos de Requisição

**Listar pessoas com paginação:**
```bash
curl -X GET \
  'https://hybuoksgodflxjhjoufv.supabase.co/functions/v1/api/v1/pessoas?limit=10&offset=0' \
  -H 'Authorization: Bearer SEU_TOKEN_AQUI'
```

**Buscar pessoa por CNPJ:**
```bash
curl -X GET \
  'https://hybuoksgodflxjhjoufv.supabase.co/functions/v1/api/v1/pessoas?cnpjf=12345678901' \
  -H 'Authorization: Bearer SEU_TOKEN_AQUI'
```

**Buscar pessoa por ID:**
```bash
curl -X GET \
  'https://hybuoksgodflxjhjoufv.supabase.co/functions/v1/api/v1/pessoas?id=uuid-da-pessoa' \
  -H 'Authorization: Bearer SEU_TOKEN_AQUI'
```

#### Resposta de Sucesso (Lista)

```json
{
  "success": true,
  "total": 1,
  "limit": 100,
  "offset": 0,
  "pessoas": [
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

#### Resposta de Sucesso (Pessoa Única)

Quando buscar por ID, retorna a pessoa diretamente:

```json
{
  "id": "uuid-da-pessoa",
  "empresa_id": "uuid-da-empresa",
  "nome": "João Silva",
  "cnpjf": "12345678901",
  "email": "joao@example.com",
  "created_at": "2025-10-24T00:00:00Z"
}
```

---

### POST /pessoas

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
      "nome": "João Silva",
      "cnpjf": "12345678901",
      "email": "joao@example.com",
      "created_at": "2025-10-24T00:00:00Z"
    }
  ]
}
```

---

### PUT /pessoas

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
      "nome": "João Silva Júnior",
      "cnpjf": "12345678901",
      "email": "joao.jr@example.com",
      "updated_at": "2025-10-24T00:00:00Z"
    }
  ]
}
```

---

## Códigos de Resposta HTTP

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso - Dados processados |
| 400 | Erro - Dados inválidos ou falha no processamento |
| 401 | Não autorizado - Token inválido ou ausente |
| 404 | Não encontrado - Recurso não existe |
| 405 | Método não permitido - Use GET, POST ou PUT |
| 500 | Erro interno do servidor |

---

## Exemplos de Uso

### cURL - Listar Produtos

```bash
curl -X GET \
  'https://hybuoksgodflxjhjoufv.supabase.co/functions/v1/api/v1/produtos?limit=10' \
  -H 'Authorization: Bearer SEU_TOKEN_AQUI'
```

### cURL - Criar Produto

```bash
curl -X POST \
  https://hybuoksgodflxjhjoufv.supabase.co/functions/v1/api/v1/produtos \
  -H 'Authorization: Bearer SEU_TOKEN_AQUI' \
  -H 'Content-Type: application/json' \
  -d '{
    "descricao": "Parafuso 10mm",
    "sku": "PAR010",
    "preco1": 0.50,
    "unidade": "UN",
    "saldo": 1000,
    "saldo_minimo": 100
  }'
```

### cURL - Atualizar Produto

```bash
curl -X PUT \
  https://hybuoksgodflxjhjoufv.supabase.co/functions/v1/api/v1/produtos \
  -H 'Authorization: Bearer SEU_TOKEN_AQUI' \
  -H 'Content-Type: application/json' \
  -d '{
    "sku": "PAR010",
    "preco1": 0.75
  }'
```

### cURL - Listar Clientes

```bash
curl -X GET \
  'https://hybuoksgodflxjhjoufv.supabase.co/functions/v1/api/v1/pessoas?limit=10' \
  -H 'Authorization: Bearer SEU_TOKEN_AQUI'
```

### cURL - Criar Cliente

```bash
curl -X POST \
  https://hybuoksgodflxjhjoufv.supabase.co/functions/v1/api/v1/pessoas \
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
API_BASE = "https://hybuoksgodflxjhjoufv.supabase.co/functions/v1/api/v1"
TOKEN = "SEU_TOKEN_AQUI"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

# Listar produtos
response = requests.get(
    f"{API_BASE}/produtos",
    headers=headers,
    params={"limit": 10, "offset": 0}
)
print("Produtos:", response.json())

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
    f"{API_BASE}/produtos",
    headers=headers,
    json=produtos
)

print("Criados:", response.json())

# Buscar produto por SKU
response = requests.get(
    f"{API_BASE}/produtos",
    headers=headers,
    params={"sku": "PROD001"}
)
print("Produto encontrado:", response.json())
```

### JavaScript/Node.js - Exemplo

```javascript
const axios = require('axios');

const API_BASE = 'https://hybuoksgodflxjhjoufv.supabase.co/functions/v1/api/v1';
const TOKEN = 'SEU_TOKEN_AQUI';

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type': 'application/json'
};

// Listar clientes
async function listarClientes() {
  try {
    const response = await axios.get(
      `${API_BASE}/pessoas`,
      { 
        headers,
        params: { limit: 10, offset: 0 }
      }
    );
    console.log('Clientes:', response.data);
  } catch (error) {
    console.error('Erro:', error.response.data);
  }
}

// Criar cliente
async function criarCliente() {
  try {
    const response = await axios.post(
      `${API_BASE}/pessoas`,
      {
        nome: 'João Silva',
        cnpjf: '12345678901',
        email: 'joao@example.com'
      },
      { headers }
    );
    
    console.log('Cliente criado:', response.data);
    // response.data.resultados[0].id contém o ID do cliente criado
  } catch (error) {
    console.error('Erro:', error.response.data);
  }
}

// Buscar cliente por CNPJ
async function buscarPorCNPJ(cnpjf) {
  try {
    const response = await axios.get(
      `${API_BASE}/pessoas`,
      { 
        headers,
        params: { cnpjf }
      }
    );
    console.log('Cliente encontrado:', response.data);
  } catch (error) {
    console.error('Erro:', error.response.data);
  }
}

listarClientes();
criarCliente();
buscarPorCNPJ('12345678901');
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
      "sku": "PROD001",
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

## Paginação

Para listar grandes volumes de dados, use os parâmetros `limit` e `offset`:

```bash
# Primeira página (10 registros)
GET /produtos?limit=10&offset=0

# Segunda página (10 registros)
GET /produtos?limit=10&offset=10

# Terceira página (10 registros)
GET /produtos?limit=10&offset=20
```

---

## Boas Práticas

1. **Segurança**: Nunca exponha seu token em repositórios públicos ou logs
2. **Rate Limiting**: Implemente delays entre requisições em massa
3. **Validação**: Valide os dados antes de enviar para evitar erros
4. **Logs**: Mantenha logs das requisições para debugging
5. **Retry**: Implemente retry logic para falhas temporárias de rede
6. **Batch**: Para grandes volumes, envie dados em lotes de 50-100 registros
7. **IDs**: Sempre armazene os IDs retornados nas operações de criação para futuras referências
8. **Paginação**: Use paginação adequada ao listar grandes volumes de dados

---

## Suporte

Para dúvidas ou problemas, entre em contato com o suporte técnico.
