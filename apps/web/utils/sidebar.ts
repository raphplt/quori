import { SidebarItem } from "@/components/layout/Sidebar";
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

export const sidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Dépôts",
    href: "/repositories",
    icon: GitBranch,
    badge: "3",
  },
  {
    title: "Flux Git",
    href: "/activity",
    icon: Activity,
    badge: "12",
  },
  {
    title: "Posts générés",
    icon: FileText,
    children: [
      {
        title: "Brouillons",
        href: "/posts/drafts",
        icon: FileText,
        badge: "5",
      },
      {
        title: "Planifiés",
        href: "/posts/scheduled",
        icon: Clock,
        badge: "8",
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
