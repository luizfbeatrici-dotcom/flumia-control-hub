import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

// Helper type for notifications
type NotificationRow = {
  id: string;
  empresa_id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  link?: string;
  lida: boolean;
  created_at: string;
  pedido_id?: string;
  contato_id?: string;
};

export function NotificationBell() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  // Fetch unread notifications count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications-count', profile?.empresa_id],
    queryFn: async (): Promise<number> => {
      if (!profile?.empresa_id) return 0;
      
      const result = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('empresa_id', profile.empresa_id)
        .eq('lida', false);
      
      const { count, error } = result as any;

      if (error) throw error;
      return count || 0;
    },
    enabled: !!profile?.empresa_id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch notifications list
  const { data: notifications = [] } = useQuery<NotificationRow[]>({
    queryKey: ['notifications', profile?.empresa_id],
    queryFn: async (): Promise<NotificationRow[]> => {
      if (!profile?.empresa_id) return [];
      
      const result = await supabase
        .from('notifications')
        .select('*')
        .eq('empresa_id', profile.empresa_id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      const { data, error } = result as any;

      if (error) throw error;
      return (data || []) as NotificationRow[];
    },
    enabled: !!profile?.empresa_id && isOpen,
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const result = await supabase
        .from('notifications')
        .update({ lida: true } as any)
        .eq('id', notificationId);
      
      const { error } = result as any;

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Listen to realtime notifications
  useEffect(() => {
    if (!profile?.empresa_id) return;

    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `empresa_id=eq.${profile.empresa_id}`,
        },
        (payload) => {
          console.log('New notification:', payload);
          toast({
            title: payload.new.titulo,
            description: payload.new.mensagem,
          });
          queryClient.invalidateQueries({ queryKey: ['notifications-count'] });
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.empresa_id, queryClient]);

  const handleNotificationClick = (notification: any) => {
    markAsReadMutation.mutate(notification.id);
    
    if (notification.link) {
      navigate(notification.link);
    } else if (notification.pedido_id) {
      navigate('/pedidos');
    }
    
    setIsOpen(false);
  };

  if (!profile?.empresa_id) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-2 font-semibold border-b">Notificações</div>
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            Nenhuma notificação
          </div>
        ) : (
          notifications.map((notification: any) => (
            <DropdownMenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`cursor-pointer p-4 ${!notification.lida ? 'bg-accent/50' : ''}`}
            >
              <div className="flex flex-col gap-1 w-full">
                <div className="font-medium text-sm">{notification.titulo}</div>
                <div className="text-xs text-muted-foreground">{notification.mensagem}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(notification.created_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </div>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
