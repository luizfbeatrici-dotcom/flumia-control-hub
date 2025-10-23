import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEmpresaSelector } from "@/contexts/EmpresaSelectorContext";
import { Building2 } from "lucide-react";

export function EmpresaSelector() {
  const { selectedEmpresaId, setSelectedEmpresaId } = useEmpresaSelector();

  const { data: empresas } = useQuery({
    queryKey: ["empresas-selector"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("empresas")
        .select("id, fantasia")
        .eq("ativo", true)
        .order("fantasia");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <Select
        value={selectedEmpresaId || "all"}
        onValueChange={(value) => setSelectedEmpresaId(value === "all" ? null : value)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Selecione uma empresa" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as Empresas</SelectItem>
          {empresas?.map((empresa) => (
            <SelectItem key={empresa.id} value={empresa.id}>
              {empresa.fantasia}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
