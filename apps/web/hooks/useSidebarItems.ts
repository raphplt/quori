import { useMemo } from "react";
import { SidebarItem } from "@/components/layout/Sidebar";
import { useSidebarBadgeData } from "@/hooks/useSidebarBadgeData";
import { useSession } from "next-auth/react";
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
  Shield,
} from "lucide-react";

export function useSidebarItems(): SidebarItem[] {
  const badgeData = useSidebarBadgeData();
  const { data: session } = useSession();

  return useMemo(
    () => {
      const items: SidebarItem[] = [
        { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
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
          { title: "Publiés", href: "/posts/published", icon: Send },
          { title: "Archives", href: "/posts/archived", icon: Archive },
        ],
      },
      { title: "Calendrier", href: "/calendar", icon: Calendar },
      { title: "Templates & Styles", href: "/templates", icon: Palette },
      {
        title: "Analytics",
        href: "/analytics",
        icon: BarChart3,
        disabled: true,
      },
      {
        title: "Intégrations",
        href: "/integrations",
        icon: Puzzle,
        disabled: true,
      },
      {
        title: "Facturation & Plan",
        href: "/billing",
        icon: CreditCard,
        disabled: true,
      },
      {
        title: "Équipe",
        href: "/team",
        icon: Users,
        badge: "Basique",
        disabled: true,
      },
      { title: "Paramètres", href: "/settings", icon: Settings },
      { title: "Aide & Support", href: "/help", icon: HelpCircle },
    ];
      if (session?.user.role === "admin") {
        items.splice(1, 0, {
          title: "Administration",
          href: "/admin/users",
          icon: Shield,
        });
      }
      return items;
    },
    [badgeData, session?.user.role]
  );
}
