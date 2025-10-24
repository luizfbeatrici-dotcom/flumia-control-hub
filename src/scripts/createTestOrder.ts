import { supabase } from "@/integrations/supabase/client";

export async function createTestOrder(empresaId: string) {
  try {
    // 1. Criar cliente
    const { data: cliente, error: clienteError } = await supabase
      .from("pessoas")
      .insert({
        empresa_id: empresaId,
        nome: "João Silva Santos",
        cnpjf: "123.456.789-00",
        celular: "(11) 98765-4321",
        email: "joao.silva@email.com",
      })
      .select()
      .single();

    if (clienteError) throw clienteError;
    console.log("Cliente criado:", cliente);

    // 2. Criar endereço do cliente
    const { data: endereco, error: enderecoError } = await supabase
      .from("pessoa_enderecos")
      .insert({
        pessoa_id: cliente.id,
        endereco: "Rua das Flores, 123",
        complemento: "Apt 45",
        bairro: "Centro",
        cidade: "São Paulo",
        cep: "01234-567",
        principal: true,
      })
      .select()
      .single();

    if (enderecoError) throw enderecoError;
    console.log("Endereço criado:", endereco);

    // 3. Criar produtos
    const { data: produtos, error: produtosError } = await supabase
      .from("produtos")
      .insert([
        {
          empresa_id: empresaId,
          descricao: "Notebook Dell Inspiron 15",
          sku: "NB-DELL-001",
          preco1: 3500.00,
          unidade: "UN",
          categoria: "Informática",
          ativo: true,
        },
        {
          empresa_id: empresaId,
          descricao: "Mouse Logitech MX Master 3",
          sku: "MS-LOG-002",
          preco1: 450.00,
          unidade: "UN",
          categoria: "Periféricos",
          ativo: true,
        },
        {
          empresa_id: empresaId,
          descricao: "Teclado Mecânico RGB",
          sku: "KB-RGB-003",
          preco1: 680.00,
          unidade: "UN",
          categoria: "Periféricos",
          ativo: true,
        },
      ])
      .select();

    if (produtosError) throw produtosError;
    console.log("Produtos criados:", produtos);

    // 4. Criar pedido
    const totalPedido = (3500.00 * 1) + (450.00 * 2) + (680.00 * 1);
    
    const { data: pedido, error: pedidoError } = await supabase
      .from("pedidos")
      .insert({
        empresa_id: empresaId,
        pessoa_id: cliente.id,
        endereco_id: endereco.id,
        status: "processing",
        total: totalPedido,
        observacoes: "Pedido de teste - Entregar no período da manhã. Cliente prefere pagamento no cartão.",
      })
      .select()
      .single();

    if (pedidoError) throw pedidoError;
    console.log("Pedido criado:", pedido);

    // 5. Criar itens do pedido
    const { data: itens, error: itensError } = await supabase
      .from("pedido_itens")
      .insert([
        {
          pedido_id: pedido.id,
          produto_id: produtos![0].id,
          quantidade: 1,
          valor_unitario: 3500.00,
          valor_total: 3500.00,
        },
        {
          pedido_id: pedido.id,
          produto_id: produtos![1].id,
          quantidade: 2,
          valor_unitario: 450.00,
          valor_total: 900.00,
        },
        {
          pedido_id: pedido.id,
          produto_id: produtos![2].id,
          quantidade: 1,
          valor_unitario: 680.00,
          valor_total: 680.00,
        },
      ])
      .select();

    if (itensError) throw itensError;
    console.log("Itens do pedido criados:", itens);

    return {
      success: true,
      message: "Pedido de teste criado com sucesso!",
      pedido,
    };
  } catch (error: any) {
    console.error("Erro ao criar pedido de teste:", error);
    return {
      success: false,
      message: error.message || "Erro ao criar pedido de teste",
    };
  }
}
