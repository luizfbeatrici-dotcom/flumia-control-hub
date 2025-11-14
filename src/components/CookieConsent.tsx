import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Cookie, X, Phone, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { updateVisitorContact } from "@/lib/visitorTracking";

interface CookieConsentProps {
  onAccept: () => void;
  onDecline: () => void;
}

export const CookieConsent = ({ onAccept, onDecline }: CookieConsentProps) => {
  const [visible, setVisible] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("flumia_cookie_consent");
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = async () => {
    if (!formData.nome || !formData.email || !formData.telefone) {
      setShowForm(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await updateVisitorContact({
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        interesse: "vendas"
      });
      localStorage.setItem("flumia_cookie_consent", "accepted");
      setVisible(false);
      onAccept();
      toast.success("Obrigado! Entraremos em contato em breve.");
    } catch (error) {
      toast.error("Erro ao enviar dados. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDecline = () => {
    localStorage.setItem("flumia_cookie_consent", "declined");
    setVisible(false);
    onDecline();
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-in slide-in-from-bottom-5">
      <Card className="border-2 shadow-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Cookie className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">
                {showForm ? "Fale com a Equipe de Vendas" : "Cookies e Privacidade"}
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mt-1"
              onClick={handleDecline}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          {!showForm ? (
            <CardDescription className="text-sm">
              Utilizamos cookies para melhorar sua experiência e personalizar nosso atendimento. 
              Ao aceitar, você nos permite coletar informações sobre sua navegação para que possamos 
              entrar em contato posteriormente com a melhor solução para suas necessidades.
            </CardDescription>
          ) : (
            <div className="space-y-4">
              <CardDescription className="text-sm">
                Deixe seus dados que entraremos em contato com você para apresentar a melhor solução.
              </CardDescription>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Nome Completo
                  </Label>
                  <Input
                    id="nome"
                    placeholder="Seu nome completo"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="telefone" className="text-sm flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Telefone/WhatsApp
                  </Label>
                  <Input
                    id="telefone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="gap-2 flex-col sm:flex-row">
          <Button 
            onClick={handleAccept} 
            className="w-full sm:flex-1"
            disabled={isSubmitting}
          >
            {showForm ? (isSubmitting ? "Enviando..." : "Enviar e Aceitar") : "Aceitar Cookies"}
          </Button>
          <Button onClick={handleDecline} variant="outline" className="w-full sm:flex-1">
            {showForm ? "Voltar" : "Recusar"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
