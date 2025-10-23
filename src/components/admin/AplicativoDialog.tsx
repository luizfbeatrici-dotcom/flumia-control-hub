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
  app_contato: z.string().max(20).optional().nullable(),
  app_ativo: z.boolean().default(false),
  app_meta_id: z.string().max(255).optional().nullable(),
  app_whatsapp_id: z.string().max(255).optional().nullable(),
  app_business_id: z.string().max(255).optional().nullable(),
});

type AplicativoFormValues = z.infer<typeof aplicativoSchema>;

interface AplicativoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresa?: any;
  onSave: (data: AplicativoFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function AplicativoDialog({
  open,
  onOpenChange,
  empresa,
  onSave,
  isLoading,
}: AplicativoDialogProps) {
  const form = useForm<AplicativoFormValues>({
    resolver: zodResolver(aplicativoSchema),
    defaultValues: {
      app_contato: "",
      app_ativo: false,
      app_meta_id: "",
      app_whatsapp_id: "",
      app_business_id: "",
    },
  });

  useEffect(() => {
    if (empresa) {
      form.reset({
        app_contato: empresa.app_contato || "",
        app_ativo: empresa.app_ativo || false,
        app_meta_id: empresa.app_meta_id || "",
        app_whatsapp_id: empresa.app_whatsapp_id || "",
        app_business_id: empresa.app_business_id || "",
      });
    } else {
      form.reset({
        app_contato: "",
        app_ativo: false,
        app_meta_id: "",
        app_whatsapp_id: "",
        app_business_id: "",
      });
    }
  }, [empresa, form]);

  const onSubmit = async (data: AplicativoFormValues) => {
    await onSave(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Configurações de Aplicativos</DialogTitle>
          <DialogDescription>
            Configure as integrações com Meta/WhatsApp Business
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="app_contato"
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
              name="app_ativo"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Status da Integração</FormLabel>
                    <FormDescription>
                      {field.value ? "Integração ativa" : "Integração inativa"}
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
              name="app_meta_id"
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
              name="app_whatsapp_id"
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
              name="app_business_id"
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
