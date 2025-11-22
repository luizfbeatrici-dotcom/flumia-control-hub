import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTheme } from "next-themes";
import {
  Sun,
  Moon,
  Monitor,
  Palette,
  Check,
  Info,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Página de Demonstração de Temas
 * 
 * Esta página serve como exemplo visual de como os componentes
 * são renderizados nos diferentes temas (Light, Dark, System).
 * 
 * Útil para:
 * - Testar se todos os componentes estão estilizados corretamente
 * - Verificar contraste de cores em ambos os temas
 * - Demonstrar o sistema de temas para usuários/clientes
 */
export default function ThemeDemo() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const currentTheme = theme === "system" ? systemTheme : theme;
  const themeInfo = {
    light: {
      icon: Sun,
      name: "Claro",
      description: "Tema otimizado para ambientes bem iluminados",
      color: "bg-yellow-500",
    },
    dark: {
      icon: Moon,
      name: "Escuro",
      description: "Tema otimizado para reduzir fadiga visual em ambientes escuros",
      color: "bg-purple-600",
    },
    system: {
      icon: Monitor,
      name: "Automático",
      description: "Segue as configurações do seu sistema operacional",
      color: "bg-blue-500",
    },
  };

  const currentInfo = themeInfo[theme as keyof typeof themeInfo] || themeInfo.system;
  const CurrentIcon = currentInfo.icon;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-purple">
              <Palette className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Sistema de Temas</h1>
              <p className="text-muted-foreground">
                Demonstração visual dos temas Light, Dark e System
              </p>
            </div>
          </div>
        </div>

        {/* Theme Status Card */}
        <Card className="shadow-soft border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${currentInfo.color}`}>
                  <CurrentIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle>Tema Atual: {currentInfo.name}</CardTitle>
                  <CardDescription>{currentInfo.description}</CardDescription>
                </div>
              </div>
              <Badge variant={currentTheme === "dark" ? "default" : "secondary"} className="text-sm">
                {currentTheme === "dark" ? "Modo Escuro" : "Modo Claro"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Sun className="h-4 w-4 text-primary" />
                  <p className="font-medium">Light Mode</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Tema claro para uso diurno e ambientes iluminados
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Moon className="h-4 w-4 text-primary" />
                  <p className="font-medium">Dark Mode</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Tema escuro para reduzir fadiga visual noturna
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Monitor className="h-4 w-4 text-primary" />
                  <p className="font-medium">System Mode</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Sincroniza automaticamente com suas preferências do SO
                </p>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Como usar</AlertTitle>
              <AlertDescription>
                Use o botão de tema no canto superior direito para alternar entre os modos.
                Sua preferência é salva automaticamente e persistirá entre sessões.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Components Showcase */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Buttons Card */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Botões</CardTitle>
              <CardDescription>
                Diferentes variantes de botões nos temas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
              <Separator />
              <div className="flex flex-wrap gap-3">
                <Button size="sm">Small</Button>
                <Button>Default</Button>
                <Button size="lg">Large</Button>
              </div>
            </CardContent>
          </Card>

          {/* Badges Card */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Badges</CardTitle>
              <CardDescription>
                Diferentes estilos de badges
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
              <Separator />
              <div className="flex flex-wrap gap-3">
                <Badge className="gap-1">
                  <Check className="h-3 w-3" />
                  Success
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Warning
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  New
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Form Inputs Card */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Inputs e Forms</CardTitle>
              <CardDescription>
                Campos de entrada nos diferentes temas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" placeholder="Digite seu nome" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="seu@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="disabled">Campo Desabilitado</Label>
                <Input id="disabled" disabled value="Campo desabilitado" />
              </div>
            </CardContent>
          </Card>

          {/* Alerts Card */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Alertas</CardTitle>
              <CardDescription>
                Diferentes tipos de notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Informação</AlertTitle>
                <AlertDescription>
                  Este é um alerta informativo padrão.
                </AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>
                  Este é um alerta de erro destrutivo.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Color Palette */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Paleta de Cores</CardTitle>
            <CardDescription>
              Cores do sistema de design adaptadas ao tema atual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-primary flex items-center justify-center">
                  <p className="text-primary-foreground font-medium">Primary</p>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Cor principal da marca
                </p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-secondary flex items-center justify-center">
                  <p className="text-secondary-foreground font-medium">Secondary</p>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Cor secundária
                </p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-accent flex items-center justify-center">
                  <p className="text-accent-foreground font-medium">Accent</p>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Cor de destaque
                </p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-muted flex items-center justify-center">
                  <p className="text-muted-foreground font-medium">Muted</p>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Cor neutra
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Info */}
        <Card className="shadow-soft border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Informações Técnicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 font-mono text-sm">
            <div className="grid gap-2">
              <div className="flex justify-between p-2 rounded bg-muted/50">
                <span className="text-muted-foreground">Tema Selecionado:</span>
                <span className="font-bold">{theme}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-muted/50">
                <span className="text-muted-foreground">Tema do Sistema:</span>
                <span className="font-bold">{systemTheme}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-muted/50">
                <span className="text-muted-foreground">Tema Ativo:</span>
                <span className="font-bold">{currentTheme}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-muted/50">
                <span className="text-muted-foreground">Storage Key:</span>
                <span className="font-bold">flumia-theme</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
