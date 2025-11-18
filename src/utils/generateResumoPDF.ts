import jsPDF from 'jspdf';

export const generateResumoPDF = () => {
  const doc = new jsPDF();
  let yPos = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);

  // Função auxiliar para adicionar texto com quebra de linha
  const addText = (text: string, fontSize: number = 10, isBold: boolean = false, color: string = '#000000') => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    
    // Converter cor hex para RGB
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    doc.setTextColor(r, g, b);
    
    const lines = doc.splitTextToSize(text, maxWidth);
    
    lines.forEach((line: string) => {
      if (yPos > 280) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(line, margin, yPos);
      yPos += fontSize * 0.5;
    });
    
    yPos += 3;
  };

  const addSpace = (space: number = 5) => {
    yPos += space;
  };

  // Título Principal
  addText('Resumo Completo do Projeto Flum.ia', 18, true, '#6A0DAD');
  addSpace(8);

  // Propósito da Plataforma
  addText('Propósito da Plataforma', 14, true, '#2E8BFF');
  addSpace(3);
  addText('A Flum.ia é uma plataforma completa de automação de vendas via WhatsApp que funciona como "a ponte entre o atendimento humano e a automação inteligente". O sistema permite que empresas:');
  addText('• Automatizem atendimento ao cliente via WhatsApp 24/7');
  addText('• Gerenciem vendas, produtos, clientes e pedidos');
  addText('• Integrem com ERPs através de API');
  addText('• Aceitem pagamentos via Mercado Pago');
  addText('• Acompanhem funil de vendas em tempo real');
  addSpace(8);

  // Estrutura do Sistema
  addText('Estrutura do Sistema', 14, true, '#2E8BFF');
  addSpace(5);

  // 1. Landing Page
  addText('1. Landing Page (Página Inicial)', 12, true);
  addSpace(2);
  addText('• Hero Section: Título impactante "PARE DE PERDER VENDAS" com imagem de fundo de IA/tecnologia');
  addText('• Funcionalidades: Destaca 5 principais benefícios (Atendimento Automatizado, Gestão de Vendas, Integração com ERPs, Autonomia para o Cliente, Consultas com IA)');
  addText('• Seção "Perda vs. Flumia": Comparativo visual problema/solução');
  addText('• Planos e Preços: Cards dinâmicos carregados do banco de dados, mostrando características com checkmarks');
  addText('• Depoimentos: Carrossel de depoimentos gerenciados pelo admin');
  addText('• FAQ: Seção expansível com perguntas frequentes gerenciadas pelo admin');
  addText('• Contato: Formulário e botão WhatsApp flutuante');
  addText('• Funcionalidades de rastreamento: Sistema de tracking de visitantes (UTM, scroll depth, eventos de sessão)');
  addSpace(5);

  // 2. Portal Administrativo
  addText('2. Portal Administrativo (Admin Master)', 12, true);
  addSpace(2);
  addText('Menus Principais:', 11, true);
  addText('• Dashboard: Visão geral do sistema');
  addText('• Empresas: Gerenciamento completo de empresas clientes');
  addText('• Usuários: Gestão de usuários do sistema');
  addText('• Bilhetagem: Configuração de planos com características, valores de ativação, pedidos inclusos');
  addText('• Assistente (ex-Configurações): Configuração do WhatsApp (número, nome da assistente, mensagem inicial)');
  addText('• Depoimentos: Cadastro de depoimentos para landing page');
  addText('• FAQ: Gerenciamento de perguntas frequentes');
  addText('• Notificações: Central de notificações configuráveis');
  addText('• Leads: Gestão de visitantes da landing page');
  addSpace(3);

  addText('Página de Detalhes da Empresa:', 11, true);
  addText('• Abas organizadas com ScrollArea: Informações, Produtos, Clientes, Pedidos, Usuários, Aplicativos, API, Tipos de Entrega, Mercado Pago');
  addText('• Widget de Funil de Vendas: Gráfico de barras mostrando contatos por etapa');
  addText('• Gestão completa: Produtos, clientes, pedidos com detalhes de pagamento');
  addText('• Configurações de integração: Tokens de API, WhatsApp Business, Mercado Pago');
  addSpace(5);

  // 3. Portal da Empresa
  addText('3. Portal da Empresa (Company Users)', 12, true);
  addSpace(2);
  addText('• Dashboard: Estatísticas (produtos, clientes, pedidos, vendas)');
  addText('• Produtos: Gestão de catálogo com importação via Excel');
  addText('• Clientes: Cadastro e importação de clientes');
  addText('• Pedidos: Visualização de pedidos com detalhes completos');
  addText('• Usuários: Gerenciamento de usuários da empresa (apenas admin da empresa)');
  addText('• Configurações: Configurações específicas da empresa');
  addSpace(8);

  // Principais Funcionalidades
  addText('Principais Funcionalidades Implementadas', 14, true, '#2E8BFF');
  addSpace(5);

  addText('Gestão de Vendas:', 11, true);
  addText('• Pedidos com numeração sequencial por empresa');
  addText('• Detalhamento completo (produtos, valores, frete, total)');
  addText('• Informações de pagamento (Mercado Pago)');
  addText('• Tipos de entrega configuráveis por empresa');
  addText('• Status de pedidos (pending, processing, completed, cancelled)');
  addSpace(3);

  addText('Sistema de Notificações:', 11, true);
  addText('• Sino com contador de notificações não lidas');
  addText('• Configurações por tipo (conversa iniciada, venda finalizada, pagamento)');
  addText('• Notificações linkadas a etapas do funil');
  addText('• Realtime updates via Supabase');
  addSpace(3);

  addText('API para Integrações:', 11, true);
  addText('• Endpoints documentados: /api-v1-produtos, /api-v1-pessoas, /api-v1-pedidos');
  addText('• Autenticação via Bearer Token');
  addText('• Operações GET, POST, PUT em lote');
  addText('• Documentação completa acessível no admin');
  addSpace(3);

  addText('Sistema de Etapas e Sub-etapas:', 11, true);
  addText('• Funil de vendas com etapas globais');
  addText('• Sub-etapas configuráveis para coleta de dados estruturados');
  addText('• Rastreamento de progresso de contatos por etapa');
  addSpace(3);

  addText('Inteligência Artificial:', 11, true);
  addText('• Busca de produtos por embedding semântico');
  addText('• Imagens de fundo geradas com IA (hero section, login)');
  addSpace(8);

  // Melhorias Recentes
  addText('Melhorias Recentes (Sessão Atual)', 14, true, '#2E8BFF');
  addSpace(3);
  addText('1. Padronização da marca "Flumia" → "Flum.ia"');
  addText('2. Correção de exibição de datas (remoção de conversão de timezone incorreta)');
  addText('3. Função utilitária formatDateFromDB para formatação consistente');
  addText('4. Reorganização dos menus da página de detalhes com ScrollArea');
  addText('5. Tentativa de adição de 50 produtos para empresa "Construção Materiais" (botão removido posteriormente)');
  addSpace(8);

  // Tecnologias
  addText('Tecnologias Utilizadas', 14, true, '#2E8BFF');
  addSpace(3);
  addText('• Frontend: React, TypeScript, Tailwind CSS, shadcn/ui');
  addText('• Backend: Supabase (Database, Auth, Edge Functions, Realtime)');
  addText('• Integrações: WhatsApp Business API, Mercado Pago');
  addText('• Ferramentas: Excel import/export, PDF generation, date-fns');
  addSpace(5);

  addText('A plataforma está completa e funcional, com uma arquitetura robusta para escalar vendas automatizadas via WhatsApp!', 10, true, '#6A0DAD');

  // Salvar PDF
  doc.save('Flumia-Resumo-Completo.pdf');
};
