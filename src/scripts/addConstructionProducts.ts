import { supabase } from "@/integrations/supabase/client";

const EMPRESA_ID = "477b5cd6-d253-44e7-8ecc-fbe2d61ef7eb"; // Construção Materiais

const produtos = [
  { descricao: 'Cimento CP-II 50kg', sku: 'CIM001', categoria: 'Cimento', departamento: 'Materiais Básicos', preco1: 32.90, unidade: 'SC' },
  { descricao: 'Areia Média', sku: 'ARE001', categoria: 'Areia', departamento: 'Materiais Básicos', preco1: 85.00, unidade: 'M3' },
  { descricao: 'Brita 1', sku: 'BRI001', categoria: 'Brita', departamento: 'Materiais Básicos', preco1: 95.00, unidade: 'M3' },
  { descricao: 'Cal Hidratada 20kg', sku: 'CAL001', categoria: 'Cal', departamento: 'Materiais Básicos', preco1: 18.50, unidade: 'SC' },
  { descricao: 'Tijolo Cerâmico 6 Furos', sku: 'TIJ001', categoria: 'Tijolo', departamento: 'Alvenaria', preco1: 0.85, unidade: 'UN' },
  { descricao: 'Bloco de Concreto 14x19x39', sku: 'BLO001', categoria: 'Bloco', departamento: 'Alvenaria', preco1: 4.20, unidade: 'UN' },
  { descricao: 'Telha Cerâmica Colonial', sku: 'TEL001', categoria: 'Telha', departamento: 'Cobertura', preco1: 2.80, unidade: 'UN' },
  { descricao: 'Telha Fibrocimento 2.44x1.10m', sku: 'TEL002', categoria: 'Telha', departamento: 'Cobertura', preco1: 68.00, unidade: 'UN' },
  { descricao: 'Laje Pré-Moldada 2.50x0.50m', sku: 'LAJ001', categoria: 'Laje', departamento: 'Estrutura', preco1: 125.00, unidade: 'UN' },
  { descricao: 'Ferro 6mm CA-50', sku: 'FER001', categoria: 'Ferragem', departamento: 'Estrutura', preco1: 28.50, unidade: 'BR' },
  { descricao: 'Ferro 8mm CA-50', sku: 'FER002', categoria: 'Ferragem', departamento: 'Estrutura', preco1: 42.00, unidade: 'BR' },
  { descricao: 'Ferro 10mm CA-50', sku: 'FER003', categoria: 'Ferragem', departamento: 'Estrutura', preco1: 58.00, unidade: 'BR' },
  { descricao: 'Ferro 12mm CA-50', sku: 'FER004', categoria: 'Ferragem', departamento: 'Estrutura', preco1: 78.00, unidade: 'BR' },
  { descricao: 'Arame Recozido 18', sku: 'ARA001', categoria: 'Arame', departamento: 'Estrutura', preco1: 12.50, unidade: 'KG' },
  { descricao: 'Prego 18x27', sku: 'PRE001', categoria: 'Prego', departamento: 'Ferragens', preco1: 8.90, unidade: 'KG' },
  { descricao: 'Prego 15x15', sku: 'PRE002', categoria: 'Prego', departamento: 'Ferragens', preco1: 9.20, unidade: 'KG' },
  { descricao: 'Parafuso 6x40', sku: 'PAR001', categoria: 'Parafuso', departamento: 'Ferragens', preco1: 0.35, unidade: 'UN' },
  { descricao: 'Parafuso 8x60', sku: 'PAR002', categoria: 'Parafuso', departamento: 'Ferragens', preco1: 0.55, unidade: 'UN' },
  { descricao: 'Tinta Acrílica Branca 18L', sku: 'TIN001', categoria: 'Tinta', departamento: 'Pintura', preco1: 185.00, unidade: 'GL' },
  { descricao: 'Tinta Látex Branca 18L', sku: 'TIN002', categoria: 'Tinta', departamento: 'Pintura', preco1: 145.00, unidade: 'GL' },
  { descricao: 'Verniz Marítimo 3.6L', sku: 'VER001', categoria: 'Verniz', departamento: 'Pintura', preco1: 78.00, unidade: 'GL' },
  { descricao: 'Massa Corrida 25kg', sku: 'MAS001', categoria: 'Massa', departamento: 'Pintura', preco1: 42.00, unidade: 'SC' },
  { descricao: 'Gesso em Pó 40kg', sku: 'GES001', categoria: 'Gesso', departamento: 'Acabamento', preco1: 28.00, unidade: 'SC' },
  { descricao: 'Argamassa AC-I 20kg', sku: 'ARG001', categoria: 'Argamassa', departamento: 'Revestimento', preco1: 24.50, unidade: 'SC' },
  { descricao: 'Argamassa AC-II 20kg', sku: 'ARG002', categoria: 'Argamassa', departamento: 'Revestimento', preco1: 26.90, unidade: 'SC' },
  { descricao: 'Argamassa AC-III 20kg', sku: 'ARG003', categoria: 'Argamassa', departamento: 'Revestimento', preco1: 29.50, unidade: 'SC' },
  { descricao: 'Porta de Madeira 80x210cm', sku: 'POR001', categoria: 'Porta', departamento: 'Esquadrias', preco1: 280.00, unidade: 'UN' },
  { descricao: 'Porta de Alumínio Branco 80x210cm', sku: 'POR002', categoria: 'Porta', departamento: 'Esquadrias', preco1: 450.00, unidade: 'UN' },
  { descricao: 'Janela de Alumínio 100x120cm', sku: 'JAN001', categoria: 'Janela', departamento: 'Esquadrias', preco1: 320.00, unidade: 'UN' },
  { descricao: 'Fechadura Interna Cromada', sku: 'FEC001', categoria: 'Fechadura', departamento: 'Ferragens', preco1: 45.00, unidade: 'UN' },
  { descricao: 'Fechadura Externa com Chave', sku: 'FEC002', categoria: 'Fechadura', departamento: 'Ferragens', preco1: 85.00, unidade: 'UN' },
  { descricao: 'Dobradiça 3" Cromada', sku: 'DOB001', categoria: 'Dobradiça', departamento: 'Ferragens', preco1: 8.50, unidade: 'UN' },
  { descricao: 'Tubo PVC 100mm Esgoto 6m', sku: 'TUB001', categoria: 'Tubo PVC', departamento: 'Hidráulica', preco1: 58.00, unidade: 'BR' },
  { descricao: 'Tubo PVC 75mm Esgoto 6m', sku: 'TUB002', categoria: 'Tubo PVC', departamento: 'Hidráulica', preco1: 42.00, unidade: 'BR' },
  { descricao: 'Tubo PVC 50mm Esgoto 6m', sku: 'TUB003', categoria: 'Tubo PVC', departamento: 'Hidráulica', preco1: 28.00, unidade: 'BR' },
  { descricao: 'Tubo PVC 25mm Água 6m', sku: 'TUB004', categoria: 'Tubo PVC', departamento: 'Hidráulica', preco1: 18.50, unidade: 'BR' },
  { descricao: 'Joelho PVC 90° 100mm', sku: 'JOE001', categoria: 'Conexão PVC', departamento: 'Hidráulica', preco1: 12.50, unidade: 'UN' },
  { descricao: 'Tê PVC 100mm', sku: 'TEE001', categoria: 'Conexão PVC', departamento: 'Hidráulica', preco1: 15.00, unidade: 'UN' },
  { descricao: 'Registro de Gaveta 3/4"', sku: 'REG001', categoria: 'Registro', departamento: 'Hidráulica', preco1: 28.00, unidade: 'UN' },
  { descricao: 'Torneira Cromada Lavatório', sku: 'TOR001', categoria: 'Torneira', departamento: 'Metais', preco1: 65.00, unidade: 'UN' },
  { descricao: 'Vaso Sanitário com Caixa Acoplada', sku: 'VAS001', categoria: 'Vaso', departamento: 'Louças', preco1: 420.00, unidade: 'UN' },
  { descricao: 'Pia de Banheiro Branca', sku: 'PIA001', categoria: 'Pia', departamento: 'Louças', preco1: 180.00, unidade: 'UN' },
  { descricao: 'Box de Vidro Incolor 1.80x1.90m', sku: 'BOX001', categoria: 'Box', departamento: 'Vidros', preco1: 850.00, unidade: 'UN' },
  { descricao: 'Piso Cerâmico 45x45cm', sku: 'PIS001', categoria: 'Piso', departamento: 'Revestimento', preco1: 28.50, unidade: 'M2' },
  { descricao: 'Piso Porcelanato 60x60cm', sku: 'PIS002', categoria: 'Piso', departamento: 'Revestimento', preco1: 68.00, unidade: 'M2' },
  { descricao: 'Rejunte Branco 1kg', sku: 'REJ001', categoria: 'Rejunte', departamento: 'Revestimento', preco1: 12.50, unidade: 'KG' },
  { descricao: 'Cola para Cerâmica AC-II 20kg', sku: 'COL001', categoria: 'Cola', departamento: 'Revestimento', preco1: 28.00, unidade: 'SC' },
  { descricao: 'Caixa d\'água 1000L Polietileno', sku: 'CAI001', categoria: 'Caixa d\'água', departamento: 'Reservatório', preco1: 580.00, unidade: 'UN' },
  { descricao: 'Caixa d\'água 500L Polietileno', sku: 'CAI002', categoria: 'Caixa d\'água', departamento: 'Reservatório', preco1: 320.00, unidade: 'UN' },
  { descricao: 'Caixa de Descarga Externa 9L', sku: 'CAI003', categoria: 'Caixa de Descarga', departamento: 'Hidráulica', preco1: 45.00, unidade: 'UN' },
];

export async function addConstructionProducts() {
  console.log('Iniciando inserção de produtos...');
  
  const dataToInsert = produtos.map(p => ({
    empresa_id: EMPRESA_ID,
    descricao: p.descricao,
    sku: p.sku,
    categoria: p.categoria,
    departamento: p.departamento,
    preco1: p.preco1,
    unidade: p.unidade,
    ativo: true,
    visibilidade: 'visible' as const,
  }));

  const { data, error } = await supabase
    .from("produtos")
    .insert(dataToInsert)
    .select();

  if (error) {
    console.error('Erro ao inserir produtos:', error);
    throw error;
  }

  console.log(`${data?.length || 0} produtos inseridos com sucesso!`);
  return data;
}
