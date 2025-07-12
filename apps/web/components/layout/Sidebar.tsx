"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight, ChevronDown, PanelLeft } from "lucide-react";
import { useSidebarItems } from "@/hooks/useSidebarItems";
import { useSidebar } from "@/contexts/SidebarContext";

export interface SidebarItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: SidebarItem[];
}

export interface SidebarProps {
  className?: string;
}

const SidebarItem: React.FC<{
  item: SidebarItem;
  pathname: string;
  level?: number;
  isCollapsed?: boolean;
}> = ({ item, pathname, level = 0, isCollapsed = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = pathname === item.href;
  const isChildActive = item.children?.some(child => pathname === child.href);

  useEffect(() => {
    if (isChildActive && !isCollapsed) {
      setIsOpen(true);
    }
  }, [isChildActive, isCollapsed]);

  if (isCollapsed && level === 0) {
    return (
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-center h-10 px-2",
          isActive && "bg-accent text-accent-foreground"
        )}
        asChild={!!item.href}
        title={item.title}
      >
        {item.href ? (
          <Link href={item.href}>
            <item.icon className="h-4 w-4" />
          </Link>
        ) : (
          <div>
            <item.icon className="h-4 w-4" />
          </div>
        )}
      </Button>
    );
  }

  if (isCollapsed && level > 0) {
    return null;
  }

  if (hasChildren) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start font-normal h-10",
              level > 0 && "pl-8",
              (isActive || isChildActive) && "bg-accent text-accent-foreground"
            )}
          >
            <item.icon className="mr-3 h-4 w-4" />
            <span className="flex-1 text-left">{item.title}</span>
            {item.badge && (
              <Badge variant="secondary" className="ml-auto mr-2">
                {item.badge}
              </Badge>
            )}
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1">
          {item.children?.map((child, index) => (
            <SidebarItem
              key={index}
              item={child}
              pathname={pathname}
              level={level + 1}
              isCollapsed={isCollapsed}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start font-normal h-10",
        level > 0 && "pl-8",
        isActive && "bg-accent text-accent-foreground"
      )}
      asChild
    >
      <Link href={item.href || "#"}>
        <item.icon className="mr-3 h-4 w-4" />
        <span className="flex-1 text-left">{item.title}</span>
        {item.badge && (
          <Badge variant="secondary" className="ml-auto">
            {item.badge}
          </Badge>
        )}
      </Link>
    </Button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const pathname = usePathname();
  const { isOpen, toggle } = useSidebar();
  const sidebarItems = useSidebarItems();

  return (
    <div className={cn("pb-12", isOpen ? "w-64" : "w-16", className)}>
      <div className="space-y-4 py-4">
        <div className={cn("px-3 py-2", !isOpen && "px-2")}>
          <div className="space-y-1">
            {isOpen ? (
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold tracking-tight">
                  Navigation
                </h2>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={toggle}
                >
                  <PanelLeft className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex justify-center mb-4">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={toggle}
                >
                  <PanelLeft className="h-4 w-4" />
                </Button>
              </div>
            )}

            {sidebarItems.map((item, index) => (
              <SidebarItem
                key={index}
                item={item}
                pathname={pathname}
                isCollapsed={!isOpen}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
