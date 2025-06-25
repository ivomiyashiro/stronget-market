import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { BellRing, Eye, Loader2, X } from "lucide-react";
import { useAuth } from "@/store/auth/auth.hooks";
import { useNotifications } from "@/store/notifications/notifications.hooks";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Label } from "@radix-ui/react-label";
import { cn } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";

const Notifications = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    isLoading,
    unreadCount,
    getNotifications,
    markNotificationAsRead,
  } = useNotifications();

  useEffect(() => {
    if (user?.id && user?.role === "entrenador") {
      getNotifications({
        id: user.id,
      });
    }
  }, [user?.id, user?.role, getNotifications]);

  const handleMarkAsRead = (notificationId: string) => {
    if (user?.id) {
      markNotificationAsRead({
        id: notificationId,
        userId: user.id,
      });
    }
  };

  const getRelativeTime = (date: string | Date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor(
      (now.getTime() - notificationDate.getTime()) / 1000
    );

    if (diffInSeconds < 60) {
      return "hace un momento";
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `hace ${diffInMinutes} ${
        diffInMinutes === 1 ? "minuto" : "minutos"
      }`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `hace ${diffInHours} ${diffInHours === 1 ? "hora" : "horas"}`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `hace ${diffInDays} ${diffInDays === 1 ? "día" : "días"}`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `hace ${diffInWeeks} ${diffInWeeks === 1 ? "semana" : "semanas"}`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `hace ${diffInMonths} ${diffInMonths === 1 ? "mes" : "meses"}`;
    }

    const diffInYears = Math.floor(diffInDays / 365);
    return `hace ${diffInYears} ${diffInYears === 1 ? "año" : "años"}`;
  };

  return (
    <div className="flex items-center gap-4">
      {user?.role === "entrenador" ? (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" className="relative">
              <BellRing className="size-4" />
              Notificaciones
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isLoading ? (
              <DropdownMenuItem disabled>
                <Loader2 className="size-4 animate-spin" />
              </DropdownMenuItem>
            ) : notifications.length > 0 ? (
              <>
                <div className="flex items-center justify-between p-2">
                  <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
                <DropdownMenuSeparator />

                <ScrollArea className="h-[200px]">
                  {notifications.map((notif) => (
                    <div key={notif.id}>
                      <DropdownMenuItem
                        className={cn(
                          notif.leido ? "text-gray-400" : "font-semibold",
                          "flex justify-between px-4"
                        )}
                      >
                        <Link
                          to={`/my-services`}
                          className="max-w-[300px] text-sm font-semibold"
                        >
                          {notif.message}
                        </Link>
                        <div className="flex flex-col items-end">
                          <Label className="text-gray-500 text-xs">
                            {getRelativeTime(notif.date)}
                          </Label>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleMarkAsRead(notif.id)}
                          >
                            <Eye className="size-4" />
                          </Button>
                        </div>
                      </DropdownMenuItem>
                    </div>
                  ))}
                </ScrollArea>
              </>
            ) : (
              <DropdownMenuItem disabled>
                Sin notificaciones nuevas
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );
};

export default Notifications;
