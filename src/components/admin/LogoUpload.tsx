import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface LogoUploadProps {
  empresaId: string;
  currentLogoUrl?: string | null;
  onLogoChange: (logoUrl: string | null) => void;
}

export function LogoUpload({ empresaId, currentLogoUrl, onLogoChange }: LogoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentLogoUrl || null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato não suportado. Use JPG, PNG, WEBP ou SVG.');
      return;
    }

    // Validar tamanho (5MB)
    if (file.size > 5242880) {
      toast.error('Arquivo muito grande. Máximo 5MB.');
      return;
    }

    try {
      setUploading(true);

      // Remover logo antigo se existir
      if (currentLogoUrl) {
        const oldPath = currentLogoUrl.split('/').pop();
        if (oldPath) {
          await supabase.storage.from('empresa-logos').remove([`${empresaId}/${oldPath}`]);
        }
      }

      // Upload do novo logo
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `${empresaId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('empresa-logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: publicUrlData } = supabase.storage
        .from('empresa-logos')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      // Atualizar empresa no banco
      const { error: updateError } = await supabase
        .from('empresas')
        .update({ logo_url: publicUrl })
        .eq('id', empresaId);

      if (updateError) throw updateError;

      setPreview(publicUrl);
      onLogoChange(publicUrl);
      toast.success('Logo atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload do logo');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    try {
      setUploading(true);

      if (currentLogoUrl) {
        const oldPath = currentLogoUrl.split('/').pop();
        if (oldPath) {
          await supabase.storage.from('empresa-logos').remove([`${empresaId}/${oldPath}`]);
        }
      }

      const { error } = await supabase
        .from('empresas')
        .update({ logo_url: null })
        .eq('id', empresaId);

      if (error) throw error;

      setPreview(null);
      onLogoChange(null);
      toast.success('Logo removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover logo:', error);
      toast.error('Erro ao remover logo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Logo da empresa"
              className="h-24 w-24 object-contain rounded-lg border bg-background p-2"
            />
            <Button
              size="icon"
              variant="destructive"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
              onClick={handleRemoveLogo}
              disabled={uploading}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="h-24 w-24 rounded-lg border border-dashed flex items-center justify-center bg-muted/50">
            <Upload className="h-8 w-8 text-muted-foreground" />
          </div>
        )}

        <div className="flex-1">
          <label htmlFor="logo-upload">
            <Button
              variant="outline"
              disabled={uploading}
              className="cursor-pointer"
              asChild
            >
              <span>
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fazendo upload...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    {preview ? 'Trocar Logo' : 'Upload Logo'}
                  </>
                )}
              </span>
            </Button>
          </label>
          <input
            id="logo-upload"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
          <p className="text-xs text-muted-foreground mt-2">
            JPG, PNG, WEBP ou SVG. Máximo 5MB.
          </p>
        </div>
      </div>
    </div>
  );
}
