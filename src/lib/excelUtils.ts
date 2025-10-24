import * as XLSX from "xlsx";

export interface ProdutoImportRow {
  descricao: string;
  sku?: string;
  complemento?: string;
  preco1: number;
  preco2?: number;
  unidade?: string;
  categoria?: string;
  departamento?: string;
  grupo?: string;
  subgrupo?: string;
  visibilidade?: "visible" | "hidden";
  ativo?: boolean;
  rowNumber?: number;
  errors?: string[];
}

export const downloadProdutosTemplate = () => {
  const template = [
    {
      "descricao*": "Produto Exemplo 1",
      sku: "SKU001",
      complemento: "Informações adicionais do produto",
      "preco1*": 10.50,
      preco2: 12.00,
      unidade: "UN",
      categoria: "Alimentos",
      departamento: "Mercearia",
      grupo: "Grãos",
      subgrupo: "Arroz",
      visibilidade: "visible",
      ativo: "sim"
    },
    {
      "descricao*": "Produto Exemplo 2",
      sku: "SKU002",
      complemento: "",
      "preco1*": 5.99,
      preco2: "",
      unidade: "KG",
      categoria: "Bebidas",
      departamento: "Refrigerados",
      grupo: "",
      subgrupo: "",
      visibilidade: "hidden",
      ativo: "sim"
    },
    {
      "descricao*": "Produto Exemplo 3",
      sku: "SKU003",
      complemento: "Produto em destaque",
      "preco1*": 25.90,
      preco2: 29.90,
      unidade: "LT",
      categoria: "Limpeza",
      departamento: "Casa",
      grupo: "Produtos de limpeza",
      subgrupo: "Detergentes",
      visibilidade: "visible",
      ativo: "não"
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(template);
  
  // Ajustar largura das colunas
  const colWidths = [
    { wch: 25 }, // descricao
    { wch: 12 }, // sku
    { wch: 30 }, // complemento
    { wch: 10 }, // preco1
    { wch: 10 }, // preco2
    { wch: 10 }, // unidade
    { wch: 15 }, // categoria
    { wch: 15 }, // departamento
    { wch: 15 }, // grupo
    { wch: 15 }, // subgrupo
    { wch: 12 }, // visibilidade
    { wch: 8 },  // ativo
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Produtos");

  // Adicionar sheet de instruções
  const instructions = [
    { Campo: "descricao*", Tipo: "Texto", Obrigatório: "SIM", Descrição: "Nome/descrição do produto (máx 200 caracteres)" },
    { Campo: "sku", Tipo: "Texto", Obrigatório: "NÃO", Descrição: "Código SKU único (máx 50 caracteres)" },
    { Campo: "complemento", Tipo: "Texto", Obrigatório: "NÃO", Descrição: "Informações adicionais" },
    { Campo: "preco1*", Tipo: "Número", Obrigatório: "SIM", Descrição: "Preço principal (use ponto como decimal: 10.50)" },
    { Campo: "preco2", Tipo: "Número", Obrigatório: "NÃO", Descrição: "Preço alternativo" },
    { Campo: "unidade", Tipo: "Texto", Obrigatório: "NÃO", Descrição: "Unidade (UN, KG, LT, CX, etc)" },
    { Campo: "categoria", Tipo: "Texto", Obrigatório: "NÃO", Descrição: "Categoria do produto" },
    { Campo: "departamento", Tipo: "Texto", Obrigatório: "NÃO", Descrição: "Departamento" },
    { Campo: "grupo", Tipo: "Texto", Obrigatório: "NÃO", Descrição: "Grupo" },
    { Campo: "subgrupo", Tipo: "Texto", Obrigatório: "NÃO", Descrição: "Subgrupo" },
    { Campo: "visibilidade", Tipo: "Texto", Obrigatório: "NÃO", Descrição: "visible ou hidden (padrão: visible)" },
    { Campo: "ativo", Tipo: "Texto", Obrigatório: "NÃO", Descrição: "sim ou não (padrão: sim)" },
  ];
  
  const instructionsSheet = XLSX.utils.json_to_sheet(instructions);
  instructionsSheet['!cols'] = [
    { wch: 15 },
    { wch: 10 },
    { wch: 12 },
    { wch: 50 }
  ];
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, "Instruções");

  XLSX.writeFile(workbook, "template_importacao_produtos.xlsx");
};

export const parseExcelFile = async (file: File): Promise<ProdutoImportRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        const produtos: ProdutoImportRow[] = jsonData.map((row: any, index: number) => {
          const produto: ProdutoImportRow = {
            descricao: (row["descricao*"] || row["descricao"] || "").toString().trim(),
            sku: row.sku ? row.sku.toString().trim() : undefined,
            complemento: row.complemento ? row.complemento.toString().trim() : undefined,
            preco1: parseFloat(row["preco1*"] || row["preco1"] || "0"),
            preco2: row.preco2 ? parseFloat(row.preco2) : undefined,
            unidade: row.unidade ? row.unidade.toString().trim() : undefined,
            categoria: row.categoria ? row.categoria.toString().trim() : undefined,
            departamento: row.departamento ? row.departamento.toString().trim() : undefined,
            grupo: row.grupo ? row.grupo.toString().trim() : undefined,
            subgrupo: row.subgrupo ? row.subgrupo.toString().trim() : undefined,
            visibilidade: normalizeVisibilidade(row.visibilidade),
            ativo: normalizeAtivo(row.ativo),
            rowNumber: index + 2, // +2 porque começa do 1 e tem cabeçalho
            errors: []
          };

          validateProduto(produto);
          return produto;
        });

        resolve(produtos);
      } catch (error) {
        reject(new Error("Erro ao processar o arquivo. Verifique se é um arquivo Excel válido."));
      }
    };

    reader.onerror = () => reject(new Error("Erro ao ler o arquivo"));
    reader.readAsArrayBuffer(file);
  });
};

const normalizeVisibilidade = (value: any): "visible" | "hidden" => {
  if (!value) return "visible";
  const normalized = value.toString().toLowerCase().trim();
  if (normalized === "hidden" || normalized === "oculto") return "hidden";
  return "visible";
};

const normalizeAtivo = (value: any): boolean => {
  if (!value) return true;
  const normalized = value.toString().toLowerCase().trim();
  return normalized !== "não" && normalized !== "nao" && normalized !== "false" && normalized !== "0";
};

const validateProduto = (produto: ProdutoImportRow) => {
  const errors: string[] = [];

  // Validação de campos obrigatórios
  if (!produto.descricao || produto.descricao.length === 0) {
    errors.push("Descrição é obrigatória");
  } else if (produto.descricao.length > 200) {
    errors.push("Descrição deve ter no máximo 200 caracteres");
  }

  if (!produto.preco1 || produto.preco1 <= 0 || isNaN(produto.preco1)) {
    errors.push("Preço 1 é obrigatório e deve ser maior que 0");
  }

  // Validação de campos opcionais
  if (produto.sku && produto.sku.length > 50) {
    errors.push("SKU deve ter no máximo 50 caracteres");
  }

  if (produto.preco2 && (produto.preco2 < 0 || isNaN(produto.preco2))) {
    errors.push("Preço 2 deve ser um número válido");
  }

  if (produto.visibilidade && !["visible", "hidden"].includes(produto.visibilidade)) {
    errors.push("Visibilidade deve ser: visible ou hidden");
  }

  produto.errors = errors;
};

export const checkDuplicateSKUs = (produtos: ProdutoImportRow[]): void => {
  const skuMap = new Map<string, number[]>();
  
  produtos.forEach((produto) => {
    if (produto.sku) {
      const sku = produto.sku.toLowerCase();
      if (!skuMap.has(sku)) {
        skuMap.set(sku, []);
      }
      skuMap.get(sku)!.push(produto.rowNumber!);
    }
  });

  skuMap.forEach((rows, sku) => {
    if (rows.length > 1) {
      rows.forEach((rowNumber) => {
        const produto = produtos.find(p => p.rowNumber === rowNumber);
        if (produto && !produto.errors?.includes(`SKU duplicado nas linhas: ${rows.join(", ")}`)) {
          produto.errors!.push(`SKU duplicado nas linhas: ${rows.join(", ")}`);
        }
      });
    }
  });
};
