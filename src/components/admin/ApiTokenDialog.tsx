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
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const tokenSchema = z.object({
  descricao: z.string().min(1, "Descrição é obrigatória").max(255),
  ativo: z.boolean().default(true),
});

type TokenFormData = z.infer<typeof tokenSchema>;

interface ApiTokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: TokenFormData) => void;
}

export function ApiTokenDialog({ open, onOpenChange, onSave }: ApiTokenDialogProps) {
  const form = useForm<TokenFormData>({
    resolver: zodResolver(tokenSchema),
    defaultValues: {
      descricao: "",
      ativo: true,
    },
  });

  const handleSubmit = (data: TokenFormData) => {
    onSave(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Token de API</DialogTitle>
          <DialogDescription>
            Crie um novo token para acesso aos webhooks da empresa
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Integração ERP" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ativo"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">Token ativo</FormLabel>
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">Criar Token</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
