import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

/**
 * ThemeProvider - Provedor de tema para toda a aplicação
 * 
 * Este componente é responsável por gerenciar o tema da aplicação usando next-themes.
 * Suporta três modos: "light", "dark" e "system" (automático).
 * 
 * Como funciona:
 * 1. Leitura/Gravação: A preferência do usuário é salva automaticamente em localStorage
 *    sob a chave "theme" (configurável via storageKey)
 * 
 * 2. Aplicação do tema: O next-themes adiciona/remove a classe "dark" no elemento <html>
 *    automaticamente baseado na preferência:
 *    - "light" → sem classe
 *    - "dark" → classe "dark" aplicada
 *    - "system" → detecta prefers-color-scheme do SO e aplica automaticamente
 * 
 * 3. Fallback: Se não houver preferência salva, usa "system" por padrão,
 *    que segue as configurações do sistema operacional/navegador
 * 
 * 4. Sincronização: Quando em modo "system", o tema muda automaticamente
 *    se o usuário alterar as configurações do SO (dark/light mode)
 * 
 * @example
 * // No main.tsx ou App.tsx:
 * <ThemeProvider>
 *   <YourApp />
 * </ThemeProvider>
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class" // Aplica o tema via classe "dark" no HTML
      defaultTheme="system" // Fallback quando não há preferência salva
      enableSystem // Habilita o modo "system" (auto)
      disableTransitionOnChange // Evita flash de transição ao mudar tema
      storageKey="flumia-theme" // Chave do localStorage para persistência
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
