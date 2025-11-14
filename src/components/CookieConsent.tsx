import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Cookie, X } from "lucide-react";

interface CookieConsentProps {
  onAccept: () => void;
  onDecline: () => void;
}

export const CookieConsent = ({ onAccept, onDecline }: CookieConsentProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("flumia_cookie_consent");
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("flumia_cookie_consent", "accepted");
    setVisible(false);
    onAccept();
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
              <CardTitle className="text-lg">Cookies e Privacidade</CardTitle>
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
          <CardDescription className="text-sm">
            Utilizamos cookies para melhorar sua experiência e personalizar nosso atendimento. 
            Ao aceitar, você nos permite coletar informações sobre sua navegação para que possamos 
            entrar em contato posteriormente com a melhor solução para suas necessidades.
          </CardDescription>
        </CardContent>
        <CardFooter className="gap-2 flex-col sm:flex-row">
          <Button onClick={handleAccept} className="w-full sm:flex-1">
            Aceitar Cookies
          </Button>
          <Button onClick={handleDecline} variant="outline" className="w-full sm:flex-1">
            Recusar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
