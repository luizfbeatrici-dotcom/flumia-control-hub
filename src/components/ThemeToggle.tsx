import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

/**
 * ThemeToggle - Componente de seleção de tema
 * 
 * Permite ao usuário escolher entre três opções de tema:
 * - Light (Claro): Força o modo claro
 * - Dark (Escuro): Força o modo escuro
 * - System (Automático): Segue as configurações do sistema operacional
 * 
 * Como usar:
 * @example
 * import { ThemeToggle } from "@/components/ThemeToggle";
 * 
 * function Header() {
 *   return (
 *     <header>
 *       <ThemeToggle />
 *     </header>
 *   );
 * }
 * 
 * Comportamento:
 * - O ícone exibido no botão muda de acordo com o tema atual:
 *   • Sol = Light mode
 *   • Lua = Dark mode
 *   • Monitor = System mode
 * 
 * - Ao clicar em uma opção, o tema é aplicado imediatamente e
 *   a preferência é salva automaticamente no localStorage
 * 
 * - Em modo System, o tema acompanha automaticamente as mudanças
 *   nas configurações do sistema operacional
 */
export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Aguarda montagem do componente para evitar hidratação
  // (necessário pois o tema vem do localStorage no cliente)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Durante SSR ou antes da montagem, não renderiza nada
  // para evitar incompatibilidade entre servidor e cliente
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  // Determina qual ícone exibir baseado no tema atual
  const getCurrentIcon = () => {
    // Se está em modo system, usa o tema real do sistema
    const currentTheme = theme === "system" ? systemTheme : theme;
    
    if (theme === "system") {
      return <Monitor className="h-5 w-5" />;
    }
    
    return currentTheme === "dark" ? (
      <Moon className="h-5 w-5" />
    ) : (
      <Sun className="h-5 w-5" />
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Selecionar tema"
        >
          {getCurrentIcon()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-card z-50">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="cursor-pointer"
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Claro</span>
          {theme === "light" && (
            <span className="ml-auto text-xs text-primary">✓</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="cursor-pointer"
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Escuro</span>
          {theme === "dark" && (
            <span className="ml-auto text-xs text-primary">✓</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="cursor-pointer"
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span>Automático</span>
          {theme === "system" && (
            <span className="ml-auto text-xs text-primary">✓</span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
