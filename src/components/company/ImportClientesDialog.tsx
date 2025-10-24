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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { parseExcelFile, ClienteImportRow } from "@/lib/excelUtilsClientes";
import { toast } from "sonner";

interface ImportClientesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (clientes: ClienteImportRow[]) => Promise<void>;
}

export function ImportClientesDialog({
  open,
  onOpenChange,
  onImport,
}: ImportClientesDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [clientes, setClientes] = useState<ClienteImportRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validar tipo de arquivo
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];

    if (!validTypes.includes(selectedFile.type)) {
      toast.error("Tipo de arquivo inválido", {
        description: "Por favor, selecione um arquivo Excel (.xlsx, .xls) ou CSV",
      });
      return;
    }

    setFile(selectedFile);
    setIsLoading(true);

    try {
      const parsedClientes = await parseExcelFile(selectedFile);
      setClientes(parsedClientes);
      toast.success("Arquivo processado com sucesso", {
        description: `${parsedClientes.length} cliente(s) encontrado(s)`,
      });
    } catch (error) {
      toast.error("Erro ao processar arquivo", {
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
      setClientes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    const validClientes = clientes.filter((c) => !c.errors || c.errors.length === 0);
    
    if (validClientes.length === 0) {
      toast.error("Nenhum cliente válido para importar");
      return;
    }

    setIsImporting(true);
    try {
      await onImport(validClientes);
      handleClose();
    } catch (error) {
      toast.error("Erro ao importar clientes", {
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setClientes([]);
    setIsLoading(false);
    setIsImporting(false);
    onOpenChange(false);
  };

  const validCount = clientes.filter((c) => !c.errors || c.errors.length === 0).length;
  const invalidCount = clientes.length - validCount;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Importar Clientes</DialogTitle>
          <DialogDescription>
            Selecione um arquivo Excel (.xlsx, .xls) ou CSV com os dados dos clientes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              disabled={isLoading || isImporting}
            />
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Processando arquivo...</span>
            </div>
          )}

          {!isLoading && clientes.length > 0 && (
            <>
              <Alert>
                <FileSpreadsheet className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{validCount} válido(s)</span>
                    </div>
                    {invalidCount > 0 && (
                      <div className="flex items-center gap-1">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        <span className="font-medium">{invalidCount} com erro(s)</span>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>

              <ScrollArea className="h-[400px] rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>CPF/CNPJ</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Celular</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientes.map((cliente, index) => (
                      <TableRow
                        key={index}
                        className={cliente.errors && cliente.errors.length > 0 ? "bg-destructive/10" : ""}
                      >
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{cliente.nome}</TableCell>
                        <TableCell>{cliente.cnpjf || "-"}</TableCell>
                        <TableCell>{cliente.email || "-"}</TableCell>
                        <TableCell>{cliente.celular || "-"}</TableCell>
                        <TableCell>
                          {cliente.errors && cliente.errors.length > 0 ? (
                            <div className="flex items-start gap-1">
                              <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                              <div className="text-xs text-destructive">
                                {cliente.errors.map((error, i) => (
                                  <div key={i}>{error}</div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle2 className="h-4 w-4" />
                              <span className="text-xs">Válido</span>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </>
          )}

          {!isLoading && clientes.length === 0 && file && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Nenhum cliente encontrado no arquivo. Verifique se o arquivo está no formato correto.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isImporting}>
            Cancelar
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || clientes.length === 0 || validCount === 0 || isImporting}
          >
            {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Importar {validCount > 0 && `(${validCount})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
