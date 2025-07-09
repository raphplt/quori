"use client";

import { useSession } from "next-auth/react";
import Sidebar from "./Sidebar";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/contexts/SidebarContext";

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, className }) => {
  const { data: session } = useSession();
  const { isOpen } = useSidebar();

  if (!session?.user) {
    return (
      <div className={cn("container mx-auto px-4", className)}>{children}</div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <aside
        className={cn(
          "hidden lg:block fixed left-0 top-14 h-[calc(100vh-3.5rem)] border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300 ease-in-out",
          isOpen ? "w-64" : "w-16"
        )}
      >
        <Sidebar />
      </aside>

      <div
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          isOpen ? "lg:ml-64" : "lg:ml-16"
        )}
      >
        <div className={cn("container mx-auto px-4 py-6", className)}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
