import { MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WhatsAppButtonProps {
  phoneNumber: string;
  assistantName?: string;
  initialMessage?: string;
}

export function WhatsAppButton({ 
  phoneNumber, 
  assistantName = "Assistente flum.ia",
  initialMessage = "Olá! Como posso ajudar você hoje?"
}: WhatsAppButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleWhatsAppClick = () => {
    if (phoneNumber) {
      const message = encodeURIComponent(initialMessage);
      const url = `https://wa.me/${phoneNumber}?text=${message}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      {/* Botão flutuante */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Card de mensagem */}
        <div
          className={cn(
            "transition-all duration-300 transform origin-bottom-right",
            isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0"
          )}
        >
          <div className="bg-card border border-border rounded-lg shadow-glow p-4 max-w-xs relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute -top-2 -right-2 bg-background border border-border rounded-full p-1 hover:bg-muted transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-purple flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">{assistantName}</h4>
                <p className="text-sm text-muted-foreground mb-3">{initialMessage}</p>
                <Button
                  onClick={handleWhatsAppClick}
                  size="sm"
                  className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white"
                >
                  Iniciar conversa
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Botão principal */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20BA5A] rounded-full shadow-glow transition-all duration-300 hover:scale-110 animate-pulse hover:animate-none"
          aria-label="Abrir WhatsApp"
        >
          <MessageCircle className="h-7 w-7 text-white" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        </button>
      </div>
    </>
  );
}
