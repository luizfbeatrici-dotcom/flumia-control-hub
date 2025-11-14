import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const mercadoPagoSchema = z.object({
  public_key: z.string().min(1, "Public key é obrigatória"),
  access_token: z.string().min(1, "Access token é obrigatório"),
  refresh_token: z.string().optional(),
  token_type: z.string().optional(),
  expires_in: z.coerce.number().optional(),
  notification_url: z.string().url("URL inválida").optional().or(z.literal("")),
  url: z.string().url("URL inválida").default("https://api.mercadopago.com/v1/payments"),
  client_id: z.string().optional(),
  client_secret: z.string().optional(),
  tipo: z.enum(["test", "prod"]).default("test"),
});

type MercadoPagoFormData = z.infer<typeof mercadoPagoSchema>;

interface MercadoPagoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: MercadoPagoFormData) => void;
  config?: any;
  isLoading?: boolean;
}

export function MercadoPagoDialog({ open, onOpenChange, onSave, config, isLoading }: MercadoPagoDialogProps) {
  const form = useForm<MercadoPagoFormData>({
    resolver: zodResolver(mercadoPagoSchema),
    defaultValues: {
      public_key: "",
      access_token: "",
      refresh_token: "",
      token_type: "",
      expires_in: undefined,
      notification_url: "",
      url: "https://api.mercadopago.com/v1/payments",
      client_id: "",
      client_secret: "",
      tipo: "test",
    },
  });

  useEffect(() => {
    if (config) {
      form.reset({
        public_key: config.public_key || "",
        access_token: config.access_token || "",
        refresh_token: config.refresh_token || "",
        token_type: config.token_type || "",
        expires_in: config.expires_in || undefined,
        notification_url: config.notification_url || "",
        url: config.url || "https://api.mercadopago.com/v1/payments",
        client_id: config.client_id || "",
        client_secret: config.client_secret || "",
        tipo: config.tipo || "test",
      });
    }
  }, [config, form]);

  const onSubmit = (data: MercadoPagoFormData) => {
    onSave(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{config ? "Editar" : "Nova"} Configuração Mercado Pago</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Ambiente</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="test">Teste</SelectItem>
                      <SelectItem value="prod">Produção</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="public_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Public Key *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="APP_USR-..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="access_token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Access Token *</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder="APP_USR-..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="refresh_token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Refresh Token</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="token_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token Type</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Bearer" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expires_in"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expires In (minutos)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client ID</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="client_secret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Secret</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da API *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://api.mercadopago.com/v1/payments" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notification_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notification URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
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
