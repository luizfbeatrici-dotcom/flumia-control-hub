import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addConstructionProducts } from "@/scripts/addConstructionProducts";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function AddProductsTemp() {
  const navigate = useNavigate();

  useEffect(() => {
    const addProducts = async () => {
      try {
        await addConstructionProducts();
        toast({
          title: "Produtos adicionados!",
          description: "50 produtos foram adicionados à empresa Construção Materiais.",
        });
        navigate("/admin/empresas");
      } catch (error) {
        console.error('Erro:', error);
        toast({
          title: "Erro ao adicionar produtos",
          description: "Ocorreu um erro ao adicionar os produtos.",
          variant: "destructive",
        });
        navigate("/admin/empresas");
      }
    };

    addProducts();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-lg">Adicionando 50 produtos...</p>
      </div>
    </div>
  );
}
