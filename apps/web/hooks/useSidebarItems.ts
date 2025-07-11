import { useMemo } from "react";
import { SidebarItem } from "@/components/layout/Sidebar";
import { useSidebarBadgeData } from "@/hooks/useSidebarBadgeData";
import {
  LayoutDashboard,
  GitBranch,
  Activity,
  FileText,
  Calendar,
  Palette,
  BarChart3,
  Puzzle,
  CreditCard,
  Users,
  Settings,
  HelpCircle,
  Clock,
  Send,
  Archive,
} from "lucide-react";

export function useSidebarItems(): SidebarItem[] {
  const badgeData = useSidebarBadgeData();

  const sidebarItems: SidebarItem[] = useMemo(() => {
    return [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Dépôts",
        href: "/repositories",
        icon: GitBranch,
        badge: badgeData.repositories,
      },
      {
        title: "Flux Git",
        href: "/activity",
        icon: Activity,
        badge: badgeData.gitActivity,
      },
      {
        title: "Posts générés",
        icon: FileText,
        children: [
          {
            title: "Brouillons",
            href: "/posts/drafts",
            icon: FileText,
            badge: badgeData.drafts,
          },
          {
            title: "Planifiés",
            href: "/posts/scheduled",
            icon: Clock,
            badge: badgeData.scheduled,
          },
          {
            title: "Publiés",
            href: "/posts/published",
            icon: Send,
          },
          {
            title: "Archives",
            href: "/posts/archived",
            icon: Archive,
          },
        ],
      },
      {
        title: "Calendrier",
        href: "/calendar",
        icon: Calendar,
      },
      {
        title: "Templates & Styles",
        href: "/templates",
        icon: Palette,
      },
      {
        title: "Analytics",
        href: "/analytics",
        icon: BarChart3,
      },
      {
        title: "Intégrations",
        href: "/integrations",
        icon: Puzzle,
      },
      {
        title: "Facturation & Plan",
        href: "/billing",
        icon: CreditCard,
      },
      {
        title: "Équipe",
        href: "/team",
        icon: Users,
        badge: "Pro",
      },
      {
        title: "Paramètres",
        href: "/settings",
        icon: Settings,
      },
      {
        title: "Aide & Support",
        href: "/help",
        icon: HelpCircle,
      },
    ];
  }, [badgeData]);

  return sidebarItems;
}
