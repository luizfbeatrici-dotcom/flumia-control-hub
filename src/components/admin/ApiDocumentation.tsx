import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Code } from "lucide-react";

interface ApiDocumentationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  baseUrl: string;
}

export function ApiDocumentation({ open, onOpenChange, baseUrl }: ApiDocumentationProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Documentação da API de Webhooks
          </SheetTitle>
          <SheetDescription>
            Referência completa para integração via API REST
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Autenticação */}
          <Card>
            <CardHeader>
              <CardTitle>Autenticação</CardTitle>
              <CardDescription>Como autenticar suas requisições</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Todas as requisições devem incluir um token de API válido no header <code className="px-2 py-1 bg-muted rounded">Authorization</code>:
              </p>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                <code>Authorization: Bearer SEU_TOKEN_AQUI</code>
              </pre>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-500">
                  ⚠️ Importante: Guarde o token em local seguro. Ele não poderá ser visualizado novamente.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Base URL */}
          <Card>
            <CardHeader>
              <CardTitle>Base URL</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                <code>{baseUrl}/api/v1</code>
              </pre>
              <p className="text-xs text-muted-foreground mt-2">
                ℹ️ URLs legadas (/webhook-produtos, /webhook-pessoas) continuam funcionando
              </p>
            </CardContent>
          </Card>

          {/* Endpoints */}
          <Tabs defaultValue="produtos" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="produtos">Produtos</TabsTrigger>
              <TabsTrigger value="pessoas">Pessoas (Clientes)</TabsTrigger>
            </TabsList>

            {/* Produtos */}
            <TabsContent value="produtos" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>GET /produtos</CardTitle>
                    <Badge>Listar</Badge>
                  </div>
                  <CardDescription>Listar produtos ou buscar por SKU/ID</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Parâmetros de Query (opcionais)</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Parâmetro</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Descrição</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-mono text-sm">id</TableCell>
                          <TableCell><Badge variant="outline">string</Badge></TableCell>
                          <TableCell>Buscar por ID específico</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono text-sm">sku</TableCell>
                          <TableCell><Badge variant="outline">string</Badge></TableCell>
                          <TableCell>Filtrar por SKU</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono text-sm">limit</TableCell>
                          <TableCell><Badge variant="outline">number</Badge></TableCell>
                          <TableCell>Limite de resultados (padrão: 100)</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono text-sm">offset</TableCell>
                          <TableCell><Badge variant="outline">number</Badge></TableCell>
                          <TableCell>Offset para paginação (padrão: 0)</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Exemplo de Resposta (Lista)</h4>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
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
      "created_at": "2025-10-24T00:00:00Z"
    }
  ]
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>POST /produtos</CardTitle>
                    <Badge variant="default">Criar</Badge>
                  </div>
                  <CardDescription>Criar um ou mais produtos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Campos</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Campo</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Obrigatório</TableHead>
                          <TableHead>Descrição</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-mono text-sm">descricao</TableCell>
                          <TableCell><Badge variant="outline">string</Badge></TableCell>
                          <TableCell><Badge variant="destructive">Sim</Badge></TableCell>
                          <TableCell>Descrição do produto</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono text-sm">sku</TableCell>
                          <TableCell><Badge variant="outline">string</Badge></TableCell>
                          <TableCell><Badge variant="secondary">Não</Badge></TableCell>
                          <TableCell>Código único do produto</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono text-sm">complemento</TableCell>
                          <TableCell><Badge variant="outline">string</Badge></TableCell>
                          <TableCell><Badge variant="secondary">Não</Badge></TableCell>
                          <TableCell>Informação complementar</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono text-sm">preco1</TableCell>
                          <TableCell><Badge variant="outline">number</Badge></TableCell>
                          <TableCell><Badge variant="secondary">Não</Badge></TableCell>
                          <TableCell>Preço principal</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono text-sm">preco2</TableCell>
                          <TableCell><Badge variant="outline">number</Badge></TableCell>
                          <TableCell><Badge variant="secondary">Não</Badge></TableCell>
                          <TableCell>Preço alternativo</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono text-sm">unidade</TableCell>
                          <TableCell><Badge variant="outline">string</Badge></TableCell>
                          <TableCell><Badge variant="secondary">Não</Badge></TableCell>
                          <TableCell>Unidade de medida (UN, KG, etc)</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono text-sm">categoria</TableCell>
                          <TableCell><Badge variant="outline">string</Badge></TableCell>
                          <TableCell><Badge variant="secondary">Não</Badge></TableCell>
                          <TableCell>Categoria do produto</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono text-sm">departamento</TableCell>
                          <TableCell><Badge variant="outline">string</Badge></TableCell>
                          <TableCell><Badge variant="secondary">Não</Badge></TableCell>
                          <TableCell>Departamento</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono text-sm">grupo</TableCell>
                          <TableCell><Badge variant="outline">string</Badge></TableCell>
                          <TableCell><Badge variant="secondary">Não</Badge></TableCell>
                          <TableCell>Grupo</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono text-sm">subgrupo</TableCell>
                          <TableCell><Badge variant="outline">string</Badge></TableCell>
                          <TableCell><Badge variant="secondary">Não</Badge></TableCell>
                          <TableCell>Subgrupo</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono text-sm">visibilidade</TableCell>
                          <TableCell><Badge variant="outline">string</Badge></TableCell>
                          <TableCell><Badge variant="secondary">Não</Badge></TableCell>
                          <TableCell>visible, hidden, catalog_only</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono text-sm">ativo</TableCell>
                          <TableCell><Badge variant="outline">boolean</Badge></TableCell>
                          <TableCell><Badge variant="secondary">Não</Badge></TableCell>
                          <TableCell>Status do produto (padrão: true)</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono text-sm">limite_venda</TableCell>
                          <TableCell><Badge variant="outline">number</Badge></TableCell>
                          <TableCell><Badge variant="secondary">Não</Badge></TableCell>
                          <TableCell>Limite máximo por venda</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-2">Exemplo de Requisição</h4>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
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
}`}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Exemplo de Resposta</h4>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "success": true,
  "total": 1,
  "processados": 1,
  "erros": 0,
  "resultados": [
    {
      "id": "uuid-do-produto",
      "sku": "MART001",
      "descricao": "Martelo",
      "created_at": "2025-10-24T00:00:00Z"
    }
  ]
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>PUT /produtos</CardTitle>
                    <Badge variant="secondary">Atualizar</Badge>
                  </div>
                  <CardDescription>Atualizar um ou mais produtos existentes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-500">
                      ℹ️ O campo <code className="px-2 py-1 bg-muted rounded">sku</code> é obrigatório para atualizações (PUT)
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Exemplo de Requisição</h4>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "sku": "MART001",
  "descricao": "Martelo Premium",
  "preco1": 35.90,
  "ativo": true
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Exemplo cURL</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">GET - Listar produtos</h4>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`curl -X GET \\
  "${baseUrl}/api/v1/produtos?limit=10&offset=0" \\
  -H 'Authorization: Bearer SEU_TOKEN_AQUI'`}
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">POST - Criar produto</h4>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`curl -X POST \\
  ${baseUrl}/api/v1/produtos \\
  -H 'Authorization: Bearer SEU_TOKEN_AQUI' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "descricao": "Parafuso 10mm",
    "sku": "PAR010",
    "preco1": 0.50,
    "unidade": "UN"
  }'`}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pessoas */}
            <TabsContent value="pessoas" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>GET /pessoas</CardTitle>
                    <Badge>Listar</Badge>
                  </div>
                  <CardDescription>Listar pessoas ou buscar por CNPJ/Email/ID</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Parâmetros de Query (opcionais)</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Parâmetro</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Descrição</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-mono text-sm">id</TableCell>
                          <TableCell><Badge variant="outline">string</Badge></TableCell>
                          <TableCell>Buscar por ID específico</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono text-sm">cnpjf</TableCell>
                          <TableCell><Badge variant="outline">string</Badge></TableCell>
                          <TableCell>Filtrar por CPF/CNPJ</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono text-sm">email</TableCell>
                          <TableCell><Badge variant="outline">string</Badge></TableCell>
                          <TableCell>Filtrar por email</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono text-sm">limit</TableCell>
                          <TableCell><Badge variant="outline">number</Badge></TableCell>
                          <TableCell>Limite de resultados (padrão: 100)</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono text-sm">offset</TableCell>
                          <TableCell><Badge variant="outline">number</Badge></TableCell>
                          <TableCell>Offset para paginação (padrão: 0)</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Exemplo de Resposta (Lista)</h4>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
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
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>POST /pessoas</CardTitle>
                    <Badge variant="default">Criar</Badge>
                  </div>
                  <CardDescription>Criar uma ou mais pessoas/clientes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Campos</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Campo</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Obrigatório</TableHead>
                          <TableHead>Descrição</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-mono text-sm">nome</TableCell>
                          <TableCell><Badge variant="outline">string</Badge></TableCell>
                          <TableCell><Badge variant="destructive">Sim</Badge></TableCell>
                          <TableCell>Nome completo</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono text-sm">cnpjf</TableCell>
                          <TableCell><Badge variant="outline">string</Badge></TableCell>
                          <TableCell><Badge variant="secondary">Não</Badge></TableCell>
                          <TableCell>CPF ou CNPJ (sem formatação)</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono text-sm">celular</TableCell>
                          <TableCell><Badge variant="outline">string</Badge></TableCell>
                          <TableCell><Badge variant="secondary">Não</Badge></TableCell>
                          <TableCell>Telefone celular</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono text-sm">email</TableCell>
                          <TableCell><Badge variant="outline">string</Badge></TableCell>
                          <TableCell><Badge variant="secondary">Não</Badge></TableCell>
                          <TableCell>E-mail</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-2">Exemplo de Requisição</h4>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "nome": "João Silva",
  "cnpjf": "12345678901",
  "celular": "11999998888",
  "email": "joao@example.com"
}`}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Exemplo de Resposta</h4>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
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
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>PUT /pessoas</CardTitle>
                    <Badge variant="secondary">Atualizar</Badge>
                  </div>
                  <CardDescription>Atualizar uma ou mais pessoas existentes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-500">
                      ℹ️ Para atualizações (PUT), você deve fornecer pelo menos <code className="px-2 py-1 bg-muted rounded">cnpjf</code> ou <code className="px-2 py-1 bg-muted rounded">email</code>
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Exemplo de Requisição</h4>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "cnpjf": "12345678901",
  "nome": "João Silva Júnior",
  "celular": "11999999999",
  "email": "joao.jr@example.com"
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Exemplo cURL</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">GET - Listar pessoas</h4>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`curl -X GET \\
  "${baseUrl}/api/v1/pessoas?limit=10&offset=0" \\
  -H 'Authorization: Bearer SEU_TOKEN_AQUI'`}
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">POST - Criar pessoa</h4>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`curl -X POST \\
  ${baseUrl}/api/v1/pessoas \\
  -H 'Authorization: Bearer SEU_TOKEN_AQUI' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "nome": "Maria Santos",
    "cnpjf": "98765432100",
    "email": "maria@example.com",
    "celular": "11988887777"
  }'`}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Códigos HTTP */}
          <Card>
            <CardHeader>
              <CardTitle>Códigos de Resposta HTTP</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Descrição</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell><Badge>200</Badge></TableCell>
                    <TableCell>Sucesso - Dados processados</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Badge variant="destructive">400</Badge></TableCell>
                    <TableCell>Erro - Dados inválidos ou falha no processamento</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Badge variant="destructive">401</Badge></TableCell>
                    <TableCell>Não autorizado - Token inválido ou ausente</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Badge variant="destructive">405</Badge></TableCell>
                    <TableCell>Método não permitido - Use POST ou PUT</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Badge variant="destructive">500</Badge></TableCell>
                    <TableCell>Erro interno do servidor</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}
