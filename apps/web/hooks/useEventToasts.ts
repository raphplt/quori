import toast from "react-hot-toast";
import { GitHubEvent } from "@/types/githubEvent";

export interface ToastOptions {
  showSuccess?: boolean;
  showErrors?: boolean;
  duration?: number;
  position?:
    | "top-left"
    | "top-center"
    | "top-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";
}

/**
 * Hook personnalisé pour gérer l'affichage des toasts liés aux événements GitHub
 */
export function useEventToasts(options: ToastOptions = {}) {
  const {
    showSuccess = true,
    showErrors = true,
    duration = 4000,
    position = "top-right",
  } = options;

  const showEventToast = (
    event: GitHubEvent,
    type: "success" | "error" = "success"
  ) => {
    const eventTypeDisplay = getEventTypeDisplay(event.event);
    const repoName =
      event.repo_full_name.split("/").pop() || event.repo_full_name;
    const icon = getEventIcon(event.event);

    if (type === "success" && showSuccess) {
      toast.success(`Nouvel événement ${eventTypeDisplay} sur ${repoName}`, {
        duration,
        position,
        icon,
      });
    } else if (type === "error" && showErrors) {
      toast.error(
        `Erreur lors de l'événement ${eventTypeDisplay} sur ${repoName}`,
        {
          duration,
          position,
          icon: "❌",
        }
      );
    }
  };

  const showCustomToast = (
    message: string,
    type: "success" | "error" | "loading" = "success",
    customIcon?: string
  ) => {
    const toastOptions = {
      duration: type === "loading" ? Infinity : duration,
      position,
      ...(customIcon && { icon: customIcon }),
    };

    switch (type) {
      case "success":
        return toast.success(message, toastOptions);
      case "error":
        return toast.error(message, toastOptions);
      case "loading":
        return toast.loading(message, toastOptions);
      default:
        return toast(message, toastOptions);
    }
  };

  const showTestEventToast = () => {
    toast.success("Événement de test créé avec succès !", {
      duration,
      position,
      icon: "🧪",
    });
  };

  return {
    showEventToast,
    showCustomToast,
    showTestEventToast,
  };
}

// Fonctions utilitaires partagées
function getEventTypeDisplay(eventType: string): string {
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
}

function getEventIcon(eventType: string): string {
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
}
