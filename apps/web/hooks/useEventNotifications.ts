import { useNotifications } from "@/contexts/NotificationsContext";
import { GitHubEvent } from "@/types/githubEvent";

/**
 * Hook pour gérer facilement les notifications d'événements GitHub
 */
export function useEventNotifications() {
  const {
    addNotification,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotifications();

  const notifyNewEvent = (event: GitHubEvent) => {
    addNotification(event);
  };

  const getEventTypeDisplay = (eventType: string): string => {
    const eventMap: Record<string, string> = {
      push: "Push",
      pull_request: "Pull Request",
      issues: "Issue",
      release: "Release",
      fork: "Fork",
      star: "Star",
      watch: "Watch",
    };
    return eventMap[eventType] || eventType;
  };

  const getEventIcon = (eventType: string): string => {
    const iconMap: Record<string, string> = {
      push: "🚀",
      pull_request: "🔄",
      issues: "🐛",
      release: "🎉",
      fork: "🍴",
      star: "⭐",
      watch: "👀",
    };
    return iconMap[eventType] || "📝";
  };

  // Filtrer les notifications par type d'événement
  const getNotificationsByEventType = (eventType?: string) => {
    if (!eventType) return notifications;
    return notifications.filter(n => n.event.event === eventType);
  };

  // Obtenir les notifications récentes (dernières 24h)
  const getRecentNotifications = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return notifications.filter(n => n.createdAt > yesterday);
  };

  return {
    notifications,
    unreadCount,
    notifyNewEvent,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    getEventTypeDisplay,
    getEventIcon,
    getNotificationsByEventType,
    getRecentNotifications,
  };
}
