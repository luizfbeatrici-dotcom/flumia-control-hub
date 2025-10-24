import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { parseExcelFile, checkDuplicateSKUs, ProdutoImportRow } from "@/lib/excelUtils";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";

interface ImportProdutosDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (produtos: ProdutoImportRow[]) => Promise<void>;
}

export function ImportProdutosDialog({
  open,
  onOpenChange,
  onImport,
}: ImportProdutosDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [produtos, setProdutos] = useState<ProdutoImportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showOnlyErrors, setShowOnlyErrors] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(fileExtension || "")) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo Excel (.xlsx, .xls) ou CSV (.csv)",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    setLoading(true);

    try {
      const parsedProdutos = await parseExcelFile(selectedFile);
      checkDuplicateSKUs(parsedProdutos);
      setProdutos(parsedProdutos);
      
      const validCount = parsedProdutos.filter(p => p.errors?.length === 0).length;
      const errorCount = parsedProdutos.length - validCount;
      
      toast({
        title: "Arquivo processado",
        description: `${parsedProdutos.length} produtos encontrados. ${validCount} válidos, ${errorCount} com erros.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao processar arquivo",
        description: error.message,
        variant: "destructive",
      });
      setFile(null);
      setProdutos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    const validProdutos = produtos.filter(p => p.errors?.length === 0);
    
    if (validProdutos.length === 0) {
      toast({
        title: "Nenhum produto válido",
        description: "Corrija os erros antes de importar",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);
    try {
      await onImport(validProdutos);
      toast({
        title: "Importação concluída",
        description: `${validProdutos.length} produtos importados com sucesso!`,
      });
      handleClose();
    } catch (error: any) {
      toast({
        title: "Erro na importação",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setProdutos([]);
    setShowOnlyErrors(false);
    onOpenChange(false);
  };

  const validCount = produtos.filter(p => p.errors?.length === 0).length;
  const errorCount = produtos.length - validCount;
  const displayedProdutos = showOnlyErrors 
    ? produtos.filter(p => p.errors && p.errors.length > 0) 
    : produtos;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Importar Produtos em Massa
          </DialogTitle>
          <DialogDescription>
            Faça upload de uma planilha Excel ou CSV com seus produtos. Baixe o modelo se necessário.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="space-y-2">
            <Label htmlFor="file">Arquivo Excel ou CSV</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                disabled={loading || importing}
              />
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
          </div>

          {produtos.length > 0 && (
            <>
              <Alert>
                <AlertDescription className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">{validCount} válidos</span>
                    </div>
                    {errorCount > 0 && (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        <span className="text-sm font-medium">{errorCount} com erros</span>
                      </div>
                    )}
                  </div>
                  {errorCount > 0 && (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="show-errors"
                        checked={showOnlyErrors}
                        onCheckedChange={(checked) => setShowOnlyErrors(checked as boolean)}
                      />
                      <Label htmlFor="show-errors" className="text-sm cursor-pointer">
                        Mostrar apenas erros
                      </Label>
                    </div>
                  )}
                </AlertDescription>
              </Alert>

              <ScrollArea className="flex-1 border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Linha</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Preço 1</TableHead>
                      <TableHead>Preço 2</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedProdutos.map((produto) => {
                      const hasErrors = produto.errors && produto.errors.length > 0;
                      return (
                        <TableRow 
                          key={produto.rowNumber} 
                          className={hasErrors ? "bg-destructive/10" : ""}
                        >
                          <TableCell className="font-mono text-xs">
                            {produto.rowNumber}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{produto.descricao}</div>
                              {hasErrors && (
                                <div className="text-xs text-destructive mt-1">
                                  {produto.errors!.map((error, idx) => (
                                    <div key={idx}>• {error}</div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">{produto.sku || "-"}</TableCell>
                          <TableCell className="text-xs">
                            R$ {produto.preco1?.toFixed(2) || "0.00"}
                          </TableCell>
                          <TableCell className="text-xs">
                            {produto.preco2 ? `R$ ${produto.preco2.toFixed(2)}` : "-"}
                          </TableCell>
                          <TableCell className="text-xs">{produto.categoria || "-"}</TableCell>
                          <TableCell>
                            {hasErrors ? (
                              <Badge variant="destructive" className="text-xs">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Erro
                              </Badge>
                            ) : (
                              <Badge variant="default" className="text-xs">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                OK
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </>
          )}

          {produtos.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Upload className="h-12 w-12 mb-4 opacity-50" />
              <p>Selecione um arquivo para ver a prévia dos produtos</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={importing}>
            Cancelar
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || produtos.length === 0 || validCount === 0 || importing}
          >
            {importing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Importar {validCount > 0 && `(${validCount})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
