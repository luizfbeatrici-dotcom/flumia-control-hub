import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Check } from "lucide-react";

interface PlanoCaracteristicasDialogProps {
  planoId: string | null;
  planoNome: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PlanoCaracteristicasDialog({ 
  planoId, 
  planoNome,
  open, 
  onOpenChange 
}: PlanoCaracteristicasDialogProps) {
  const queryClient = useQueryClient();
  const [selectedCaracteristicas, setSelectedCaracteristicas] = useState<Set<string>>(new Set());

  const { data: caracteristicas } = useQuery({
    queryKey: ["caracteristicas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("caracteristicas")
        .select("*")
        .eq("ativo", true)
        .order("ordem");
      if (error) throw error;
      return data || [];
    },
    enabled: open,
  });

  const { data: planoCaracteristicas } = useQuery({
    queryKey: ["plano_caracteristicas", planoId],
    queryFn: async () => {
      if (!planoId) return [];
      const { data, error } = await supabase
        .from("plano_caracteristicas")
        .select("caracteristica_id")
        .eq("plano_id", planoId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!planoId && open,
  });

  useEffect(() => {
    if (planoCaracteristicas) {
      setSelectedCaracteristicas(
        new Set(planoCaracteristicas.map((pc: any) => pc.caracteristica_id))
      );
    }
  }, [planoCaracteristicas]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!planoId) return;

      // Delete all existing relationships
      const { error: deleteError } = await supabase
        .from("plano_caracteristicas")
        .delete()
        .eq("plano_id", planoId);
      
      if (deleteError) throw deleteError;

      // Insert new relationships
      if (selectedCaracteristicas.size > 0) {
        const inserts = Array.from(selectedCaracteristicas).map((caracteristicaId) => ({
          plano_id: planoId,
          caracteristica_id: caracteristicaId,
        }));

        const { error: insertError } = await supabase
          .from("plano_caracteristicas")
          .insert(inserts);
        
        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plano_caracteristicas"] });
      toast.success("Características do plano atualizadas!");
      onOpenChange(false);
    },
    onError: (err: any) => toast.error(err.message || "Erro ao salvar características"),
  });

  const handleToggle = (caracteristicaId: string) => {
    setSelectedCaracteristicas((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(caracteristicaId)) {
        newSet.delete(caracteristicaId);
      } else {
        newSet.add(caracteristicaId);
      }
      return newSet;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Características do Plano: {planoNome}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Selecione quais características este plano contempla:
          </p>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {caracteristicas?.map((caracteristica: any) => (
              <div
                key={caracteristica.id}
                className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer"
                onClick={() => handleToggle(caracteristica.id)}
              >
                <Checkbox
                  checked={selectedCaracteristicas.has(caracteristica.id)}
                  onCheckedChange={() => handleToggle(caracteristica.id)}
                />
                <div className="flex-1">
                  <div className="font-medium">{caracteristica.nome}</div>
                  {caracteristica.descricao && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {caracteristica.descricao}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {caracteristicas?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma característica cadastrada. Configure as características primeiro.
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="flex-1"
            >
              <Check className="mr-2 h-4 w-4" />
              Salvar
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
