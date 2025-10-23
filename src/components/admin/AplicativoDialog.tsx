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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const aplicativoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(255),
  contato: z.string().max(20).optional().nullable(),
  ativo: z.boolean().default(true),
  meta_id: z.string().max(255).optional().nullable(),
  whatsapp_id: z.string().max(255).optional().nullable(),
  business_id: z.string().max(255).optional().nullable(),
});

type AplicativoFormValues = z.infer<typeof aplicativoSchema>;

interface AplicativoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aplicativo?: any;
  onSave: (data: AplicativoFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function AplicativoDialog({
  open,
  onOpenChange,
  aplicativo,
  onSave,
  isLoading,
}: AplicativoDialogProps) {
  const form = useForm<AplicativoFormValues>({
    resolver: zodResolver(aplicativoSchema),
    defaultValues: {
      nome: "",
      contato: "",
      ativo: true,
      meta_id: "",
      whatsapp_id: "",
      business_id: "",
    },
  });

  useEffect(() => {
    if (aplicativo) {
      form.reset({
        nome: aplicativo.nome || "",
        contato: aplicativo.contato || "",
        ativo: aplicativo.ativo ?? true,
        meta_id: aplicativo.meta_id || "",
        whatsapp_id: aplicativo.whatsapp_id || "",
        business_id: aplicativo.business_id || "",
      });
    } else {
      form.reset({
        nome: "",
        contato: "",
        ativo: true,
        meta_id: "",
        whatsapp_id: "",
        business_id: "",
      });
    }
  }, [aplicativo, form]);

  const onSubmit = async (data: AplicativoFormValues) => {
    await onSave(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {aplicativo ? "Editar Aplicativo" : "Novo Aplicativo"}
          </DialogTitle>
          <DialogDescription>
            {aplicativo ? "Atualize as informações do aplicativo" : "Configure um novo aplicativo para integração"}
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
                    <Input
                      placeholder="Nome do aplicativo"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Identificação do aplicativo (ex: WhatsApp Principal)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contato"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contato (Celular)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="(00) 00000-0000"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Número de celular para integração
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ativo"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Status</FormLabel>
                    <FormDescription>
                      {field.value ? "Aplicativo ativo" : "Aplicativo inativo"}
                    </FormDescription>
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

            <FormField
              control={form.control}
              name="meta_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID App Meta</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ID do aplicativo Meta"
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
              name="whatsapp_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID WhatsApp</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ID do WhatsApp Business"
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
              name="business_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Business</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ID do Business Manager"
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
