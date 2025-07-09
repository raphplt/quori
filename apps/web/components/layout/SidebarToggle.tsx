"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/contexts/SidebarContext";
import { PanelLeft } from "lucide-react";

const SidebarToggle: React.FC = () => {
  const { toggle } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className="hidden lg:flex"
    >
      <PanelLeft className="h-4 w-4" />
    </Button>
  );
};

export default SidebarToggle;
