import * as XLSX from 'xlsx';

export interface ClienteImportRow {
  nome: string;
  cnpjf?: string;
  email?: string;
  celular?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  cep?: string;
  complemento?: string;
  errors?: string[];
}

export const downloadClientesTemplate = () => {
  const template: ClienteImportRow[] = [
    {
      nome: 'João Silva',
      cnpjf: '123.456.789-00',
      email: 'joao@example.com',
      celular: '(11) 98765-4321',
      endereco: 'Rua das Flores, 123',
      bairro: 'Centro',
      cidade: 'São Paulo',
      cep: '01234-567',
      complemento: 'Apto 45'
    },
    {
      nome: 'Empresa XYZ Ltda',
      cnpjf: '12.345.678/0001-90',
      email: 'contato@empresa.com',
      celular: '(11) 3456-7890',
      endereco: 'Av. Paulista, 1000',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      cep: '01310-100',
      complemento: 'Sala 10'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(template);
  
  // Define larguras das colunas
  ws['!cols'] = [
    { wch: 30 }, // nome
    { wch: 18 }, // cnpjf
    { wch: 25 }, // email
    { wch: 18 }, // celular
    { wch: 35 }, // endereco
    { wch: 20 }, // bairro
    { wch: 20 }, // cidade
    { wch: 12 }, // cep
    { wch: 25 }, // complemento
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Clientes');

  // Criar planilha de instruções
  const instructions = [
    ['INSTRUÇÕES PARA IMPORTAÇÃO DE CLIENTES'],
    [''],
    ['Campos obrigatórios:'],
    ['- nome: Nome do cliente (máximo 200 caracteres)'],
    [''],
    ['Campos opcionais:'],
    ['- cnpjf: CPF (11 dígitos) ou CNPJ (14 dígitos)'],
    ['- email: E-mail do cliente (máximo 100 caracteres)'],
    ['- celular: Telefone/celular'],
    ['- endereco: Endereço principal'],
    ['- bairro: Bairro'],
    ['- cidade: Cidade'],
    ['- cep: CEP'],
    ['- complemento: Complemento do endereço'],
    [''],
    ['Observações:'],
    ['- O nome é obrigatório'],
    ['- O CPF/CNPJ deve conter apenas números'],
    ['- O e-mail deve ser válido'],
    ['- Não use caracteres especiais nos campos de texto'],
  ];

  const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
  wsInstructions['!cols'] = [{ wch: 60 }];
  XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instruções');

  XLSX.writeFile(wb, 'template_importacao_clientes.xlsx');
};

export const parseExcelFile = async (file: File): Promise<ClienteImportRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        const clientes: ClienteImportRow[] = jsonData.map((row, index) => {
          const cliente: ClienteImportRow = {
            nome: String(row.nome || '').trim(),
            cnpjf: row.cnpjf ? String(row.cnpjf).replace(/\D/g, '') : undefined,
            email: row.email ? String(row.email).trim() : undefined,
            celular: row.celular ? String(row.celular).trim() : undefined,
            endereco: row.endereco ? String(row.endereco).trim() : undefined,
            bairro: row.bairro ? String(row.bairro).trim() : undefined,
            cidade: row.cidade ? String(row.cidade).trim() : undefined,
            cep: row.cep ? String(row.cep).replace(/\D/g, '') : undefined,
            complemento: row.complemento ? String(row.complemento).trim() : undefined,
            errors: []
          };

          validateCliente(cliente, index);
          return cliente;
        });

        checkDuplicateCNPJF(clientes);
        resolve(clientes);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Erro ao ler o arquivo'));
    reader.readAsBinaryString(file);
  });
};

const validateCliente = (cliente: ClienteImportRow, rowIndex: number) => {
  const errors: string[] = [];

  // Validar nome (obrigatório)
  if (!cliente.nome) {
    errors.push('Nome é obrigatório');
  } else if (cliente.nome.length > 200) {
    errors.push('Nome deve ter no máximo 200 caracteres');
  }

  // Validar CNPJF (se fornecido)
  if (cliente.cnpjf) {
    if (cliente.cnpjf.length !== 11 && cliente.cnpjf.length !== 14) {
      errors.push('CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos');
    }
  }

  // Validar email (se fornecido)
  if (cliente.email) {
    if (cliente.email.length > 100) {
      errors.push('E-mail deve ter no máximo 100 caracteres');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cliente.email)) {
      errors.push('E-mail inválido');
    }
  }

  // Validar celular (se fornecido)
  if (cliente.celular && cliente.celular.length > 20) {
    errors.push('Celular deve ter no máximo 20 caracteres');
  }

  // Validar endereço (se fornecido)
  if (cliente.endereco && cliente.endereco.length > 200) {
    errors.push('Endereço deve ter no máximo 200 caracteres');
  }

  // Validar bairro (se fornecido)
  if (cliente.bairro && cliente.bairro.length > 100) {
    errors.push('Bairro deve ter no máximo 100 caracteres');
  }

  // Validar cidade (se fornecido)
  if (cliente.cidade && cliente.cidade.length > 100) {
    errors.push('Cidade deve ter no máximo 100 caracteres');
  }

  // Validar CEP (se fornecido)
  if (cliente.cep && cliente.cep.length !== 8) {
    errors.push('CEP deve ter 8 dígitos');
  }

  // Validar complemento (se fornecido)
  if (cliente.complemento && cliente.complemento.length > 200) {
    errors.push('Complemento deve ter no máximo 200 caracteres');
  }

  if (errors.length > 0) {
    cliente.errors = errors;
  }
};

const checkDuplicateCNPJF = (clientes: ClienteImportRow[]) => {
  const cnpjfMap = new Map<string, number[]>();

  clientes.forEach((cliente, index) => {
    if (cliente.cnpjf) {
      const existing = cnpjfMap.get(cliente.cnpjf) || [];
      existing.push(index + 1);
      cnpjfMap.set(cliente.cnpjf, existing);
    }
  });

  cnpjfMap.forEach((indices, cnpjf) => {
    if (indices.length > 1) {
      indices.forEach(rowIndex => {
        const cliente = clientes[rowIndex - 1];
        if (!cliente.errors) cliente.errors = [];
        cliente.errors.push(`CPF/CNPJ duplicado nas linhas: ${indices.join(', ')}`);
      });
    }
  });
};
