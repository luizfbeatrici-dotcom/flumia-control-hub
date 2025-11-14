import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";


interface Notification {
  id: string;
  empresa_id: string;
  tipo: "new_order" | "order_update" | "payment_update" | "system";
  titulo: string;
  mensagem: string;
  link: string | null;
  lida: boolean;
  pedido_id: string | null;
  contato_id: string | null;
  created_at: string;
}

export function NotificationBell() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", profile?.empresa_id],
    queryFn: async (): Promise<Notification[]> => {
      if (!profile?.empresa_id) return [];

      // @ts-ignore - notifications table exists but not in generated types yet
      const { data, error } = await supabase
        // @ts-ignore
        .from("notifications")
        .select("*")
        .eq("empresa_id", profile.empresa_id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return (data as unknown as Notification[]) || [];
    },
    enabled: !!profile?.empresa_id,
  });

  const unreadCount = (notifications as Notification[]).filter((n) => !n.lida).length;

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      // @ts-ignore - notifications table exists but not in generated types yet
      const { error } = await supabase
        // @ts-ignore
        .from("notifications")
        // @ts-ignore
        .update({ lida: true })
        .eq("id", notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.empresa_id) return;

      // @ts-ignore - notifications table exists but not in generated types yet
      const { error } = await supabase
        // @ts-ignore
        .from("notifications")
        // @ts-ignore
        .update({ lida: true })
        .eq("empresa_id", profile.empresa_id)
        .eq("lida", false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Todas as notificações foram marcadas como lidas");
    },
  });

  const handleNotificationClick = (notification: Notification) => {
    markAsReadMutation.mutate(notification.id);
    
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between p-2 border-b">
          <h3 className="font-semibold">Notificações</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              className="h-8 px-2 text-xs"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Marcar todas como lida
            </Button>
          )}
        </div>
        {(notifications as Notification[]).length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Nenhuma notificação
          </div>
        ) : (
          (notifications as Notification[]).map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={`p-3 cursor-pointer flex-col items-start ${
                !notification.lida ? "bg-accent/50" : ""
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start justify-between w-full gap-2">
                <div className="flex-1">
                  <p className="font-medium text-sm">{notification.titulo}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {notification.mensagem}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notification.created_at).toLocaleString("pt-BR")}
                  </p>
                </div>
                {!notification.lida && (
                  <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                )}
              </div>
            </DropdownMenuItem>
          ))
        )}
        {(notifications as Notification[]).length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="p-3 text-center justify-center cursor-pointer"
              onClick={() => navigate("/admin/notificacoes")}
            >
              Ver todas as notificações
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
