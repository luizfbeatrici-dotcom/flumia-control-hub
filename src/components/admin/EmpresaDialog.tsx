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
import { LogoUpload } from "@/components/admin/LogoUpload";
import { Separator } from "@/components/ui/separator";

const empresaSchema = z.object({
  razao_social: z.string().min(1, "Razão social é obrigatória").max(255),
  fantasia: z.string().min(1, "Nome fantasia é obrigatório").max(255),
  cnpj: z.string().min(14, "CNPJ deve ter 14 dígitos").max(18),
  endereco: z.string().max(255).optional(),
  cidade: z.string().max(100).optional(),
  celular: z.string().max(20).optional(),
  whatsapp: z.string().max(20).optional(),
  dominio: z.string().max(255).optional(),
  ativo: z.boolean().default(true),
});

type EmpresaFormData = z.infer<typeof empresaSchema>;

interface EmpresaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: EmpresaFormData) => void;
  empresa?: any;
}

export function EmpresaDialog({ open, onOpenChange, onSave, empresa }: EmpresaDialogProps) {
  const form = useForm<EmpresaFormData>({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      razao_social: "",
      fantasia: "",
      cnpj: "",
      endereco: "",
      cidade: "",
      celular: "",
      whatsapp: "",
      dominio: "",
      ativo: true,
    },
  });

  useEffect(() => {
    if (empresa) {
      form.reset({
        razao_social: empresa.razao_social || "",
        fantasia: empresa.fantasia || "",
        cnpj: empresa.cnpj || "",
        endereco: empresa.endereco || "",
        cidade: empresa.cidade || "",
        celular: empresa.celular || "",
        whatsapp: empresa.whatsapp || "",
        dominio: empresa.dominio || "",
        ativo: empresa.ativo ?? true,
      });
    } else {
      form.reset({
        razao_social: "",
        fantasia: "",
        cnpj: "",
        endereco: "",
        cidade: "",
        celular: "",
        whatsapp: "",
        dominio: "",
        ativo: true,
      });
    }
  }, [empresa, form]);

  const handleSubmit = (data: EmpresaFormData) => {
    onSave(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{empresa ? "Editar Empresa" : "Nova Empresa"}</DialogTitle>
          <DialogDescription>
            {empresa ? "Atualize as informações da empresa" : "Cadastre uma nova empresa no sistema"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {empresa && (
              <>
                <div>
                  <h3 className="text-sm font-medium mb-3">Logo da Empresa</h3>
                  <LogoUpload 
                    empresaId={empresa.id} 
                    currentLogoUrl={empresa.logo_url}
                    onLogoChange={(logoUrl) => {
                      // Atualizar preview local se necessário
                    }}
                  />
                </div>
                <Separator />
              </>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="razao_social"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Razão Social *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fantasia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Fantasia *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endereco"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dominio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Domínio</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="www.exemplo.com.br" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ativo"
                render={({ field }) => (
                  <FormItem className="col-span-2 flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Empresa ativa</FormLabel>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
