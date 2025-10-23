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

const pessoaSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(255),
  email: z.string().email("Email inválido").max(255).optional().nullable().or(z.literal("")),
  celular: z.string().max(20).optional().nullable(),
  cnpjf: z.string().max(18).optional().nullable(),
});

type PessoaFormValues = z.infer<typeof pessoaSchema>;

interface PessoaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pessoa?: any;
  onSave: (data: PessoaFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function PessoaDialog({
  open,
  onOpenChange,
  pessoa,
  onSave,
  isLoading,
}: PessoaDialogProps) {
  const form = useForm<PessoaFormValues>({
    resolver: zodResolver(pessoaSchema),
    defaultValues: {
      nome: "",
      email: "",
      celular: "",
      cnpjf: "",
    },
  });

  useEffect(() => {
    if (pessoa) {
      form.reset({
        nome: pessoa.nome || "",
        email: pessoa.email || "",
        celular: pessoa.celular || "",
        cnpjf: pessoa.cnpjf || "",
      });
    } else {
      form.reset({
        nome: "",
        email: "",
        celular: "",
        cnpjf: "",
      });
    }
  }, [pessoa, form]);

  const onSubmit = async (data: PessoaFormValues) => {
    await onSave(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {pessoa ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do cliente. Campos com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="email@exemplo.com"
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
              name="celular"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Celular</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="(00) 00000-0000"
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
              name="cnpjf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF/CNPJ</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="000.000.000-00 ou 00.000.000/0000-00"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
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
