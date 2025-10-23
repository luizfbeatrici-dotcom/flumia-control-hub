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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const enderecoSchema = z.object({
  endereco: z.string().min(1, "Endereço é obrigatório").max(255),
  complemento: z.string().max(100).optional().nullable(),
  bairro: z.string().max(100).optional().nullable(),
  cidade: z.string().max(100).optional().nullable(),
  cep: z.string().max(10).optional().nullable(),
  principal: z.boolean().default(false),
});

type EnderecoFormValues = z.infer<typeof enderecoSchema>;

interface EnderecoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  endereco?: any;
  onSave: (data: EnderecoFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function EnderecoDialog({
  open,
  onOpenChange,
  endereco,
  onSave,
  isLoading,
}: EnderecoDialogProps) {
  const form = useForm<EnderecoFormValues>({
    resolver: zodResolver(enderecoSchema),
    defaultValues: {
      endereco: "",
      complemento: "",
      bairro: "",
      cidade: "",
      cep: "",
      principal: false,
    },
  });

  useEffect(() => {
    if (endereco) {
      form.reset({
        endereco: endereco.endereco || "",
        complemento: endereco.complemento || "",
        bairro: endereco.bairro || "",
        cidade: endereco.cidade || "",
        cep: endereco.cep || "",
        principal: endereco.principal || false,
      });
    } else {
      form.reset({
        endereco: "",
        complemento: "",
        bairro: "",
        cidade: "",
        cep: "",
        principal: false,
      });
    }
  }, [endereco, form]);

  const onSubmit = async (data: EnderecoFormValues) => {
    await onSave(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {endereco ? "Editar Endereço" : "Novo Endereço"}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do endereço. Campos com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="endereco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço *</FormLabel>
                  <FormControl>
                    <Input placeholder="Rua, Avenida, etc" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="complemento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Complemento</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Apartamento, Bloco, etc"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bairro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bairro</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Bairro"
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
                name="cep"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="00000-000"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="cidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Cidade"
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
              name="principal"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Endereço Principal
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Marque como endereço principal do cliente
                    </p>
                  </div>
                </FormItem>
              )}
            />

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
