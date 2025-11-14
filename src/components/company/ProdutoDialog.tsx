import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const produtoSchema = z.object({
  descricao: z.string().min(1, "Descrição é obrigatória").max(200),
  complemento: z.string().max(200).optional().nullable(),
  sku: z.string().max(50).optional().nullable(),
  preco1: z.coerce.number().min(0, "Preço deve ser positivo"),
  preco2: z.coerce.number().min(0).optional().nullable(),
  unidade: z.string().max(10).optional().nullable(),
  categoria: z.string().max(50).optional().nullable(),
  departamento: z.string().max(50).optional().nullable(),
  grupo: z.string().max(50).optional().nullable(),
  subgrupo: z.string().max(50).optional().nullable(),
  visibilidade: z.enum(["visible", "hidden", "featured"]).default("visible"),
  ativo: z.boolean().default(true),
  saldo: z.coerce.number().min(0).optional().nullable(),
  saldo_minimo: z.coerce.number().min(0).optional().nullable(),
  saldo_maximo: z.coerce.number().min(0).optional().nullable(),
});

type ProdutoFormValues = z.infer<typeof produtoSchema>;

interface ProdutoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produto?: any;
  onSave: (data: ProdutoFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function ProdutoDialog({
  open,
  onOpenChange,
  produto,
  onSave,
  isLoading,
}: ProdutoDialogProps) {
  const form = useForm<ProdutoFormValues>({
    resolver: zodResolver(produtoSchema),
    defaultValues: {
      descricao: "",
      complemento: "",
      sku: "",
      preco1: 0,
      preco2: 0,
      unidade: "",
      categoria: "",
      departamento: "",
      grupo: "",
      subgrupo: "",
      visibilidade: "visible",
      ativo: true,
      saldo: 0,
      saldo_minimo: 0,
      saldo_maximo: 0,
    },
  });

  useEffect(() => {
    if (produto) {
      const estoqueData = Array.isArray(produto.estoque) ? produto.estoque[0] : produto.estoque;
      form.reset({
        descricao: produto.descricao || "",
        complemento: produto.complemento || "",
        sku: produto.sku || "",
        preco1: produto.preco1 || 0,
        preco2: produto.preco2 || 0,
        unidade: produto.unidade || "",
        categoria: produto.categoria || "",
        departamento: produto.departamento || "",
        grupo: produto.grupo || "",
        subgrupo: produto.subgrupo || "",
        visibilidade: produto.visibilidade || "visible",
        ativo: produto.ativo ?? true,
        saldo: estoqueData?.saldo || 0,
        saldo_minimo: estoqueData?.saldo_minimo || 0,
        saldo_maximo: estoqueData?.saldo_maximo || 0,
      });
    } else {
      form.reset({
        descricao: "",
        complemento: "",
        sku: "",
        preco1: 0,
        preco2: 0,
        unidade: "",
        categoria: "",
        departamento: "",
        grupo: "",
        subgrupo: "",
        visibilidade: "visible",
        ativo: true,
        saldo: 0,
        saldo_minimo: 0,
        saldo_maximo: 0,
      });
    }
  }, [produto, form]);

  const onSubmit = async (data: ProdutoFormValues) => {
    await onSave(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {produto ? "Editar Produto" : "Novo Produto"}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do produto. Campos com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Descrição *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do produto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="complemento"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Complemento</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Informações adicionais"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="Código SKU" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade</FormLabel>
                    <FormControl>
                      <Input placeholder="UN, KG, LT..." {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preco1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço 1 *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preco2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço 2</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <FormControl>
                      <Input placeholder="Categoria" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="departamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departamento</FormLabel>
                    <FormControl>
                      <Input placeholder="Departamento" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="grupo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grupo</FormLabel>
                    <FormControl>
                      <Input placeholder="Grupo" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subgrupo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subgrupo</FormLabel>
                    <FormControl>
                      <Input placeholder="Subgrupo" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="visibilidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibilidade</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="visible">Visível</SelectItem>
                        <SelectItem value="hidden">Oculto</SelectItem>
                        <SelectItem value="featured">Destaque</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="col-span-2">
                <h3 className="text-lg font-semibold mb-4">Controle de Estoque</h3>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="saldo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Saldo Atual</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="saldo_minimo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Saldo Mínimo</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="saldo_maximo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Saldo Máximo</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="ativo"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Produto Ativo</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
