"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Sidebar from "./Sidebar";
import InboxPopover from "../InboxPopover";

import {
  Search,
  Users,
  Plus,
  Circle,
  GitBranch,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Github,
  PanelLeft,
} from "lucide-react";

const Header: React.FC = () => {
  const { data: session, status } = useSession();
  const user = session?.user;
  const isLoading = status === "loading";

  const PublicNavLinks = () => (
    <>
      <Link
        href="/"
        className="text-sm font-medium hover:text-primary transition-colors"
      >
        Accueil
      </Link>
      <Link
        href="#features"
        className="text-sm font-medium hover:text-primary transition-colors"
      >
        Fonctionnalités
      </Link>
      <Link
        href="#pricing"
        className="text-sm font-medium hover:text-primary transition-colors"
      >
        Tarifs
      </Link>
      <Link
        href="#contact"
        className="text-sm font-medium hover:text-primary transition-colors"
      >
        Contact
      </Link>
    </>
  );

  const UserMenu = () => {
    if (isLoading) {
      return (
        <div className="flex items-center space-x-2">
          <div className="animate-pulse bg-muted h-8 w-8 rounded-full" />
          <div className="animate-pulse bg-muted h-4 w-20 rounded" />
        </div>
      );
    }

    if (user) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.image || ""} alt={user.name || "User"} />
                <AvatarFallback>
                  {user.name?.charAt(0).toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <div className="flex items-center gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                <p className="font-medium">{user.name}</p>
                <p className="w-[200px] truncatpe text-sm text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                Profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                Paramètres
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={() => signOut()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Button
        onClick={() => signIn("github")}
        className="flex items-center gap-2"
      >
        <Github className="h-4 w-4" />
        Se connecter
      </Button>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className=" mx-auto px-6 flex items-center justify-between h-14">
        {/* Logo & mobile menu */}
        <div className="flex items-center space-x-3">
          {user && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <PanelLeft className="h-5 w-5" />
                  <span className="sr-only">Menu de navigation</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <Sidebar />
              </SheetContent>
            </Sheet>
          )}

          <Link
            href={user ? "/dashboard" : "/"}
            className="flex items-center space-x-2"
          >
            <Image src="/Logo.png" alt="Quori Logo" width={40} height={40} />
            <span className="hidden font-bold sm:inline-block">Quori</span>
          </Link>
        </div>

        {user && (
          <nav className="hidden md:flex items-center space-x-2">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                width={16}
              />
              <Input
                placeholder="Type / to search"
                className="pl-10 pr-4 w-64"
              />
            </div>

            <span className="h-6 w-px bg-border mx-2" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Users className="h-5 w-5" />
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Workspace A</DropdownMenuItem>
                <DropdownMenuItem>Workspace B</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Plus className="h-5 w-5" />
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>New Project</DropdownMenuItem>
                <DropdownMenuItem>New Document</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <span className="h-6 w-px bg-border mx-2" />

            <Button variant="ghost" size="icon">
              <Circle className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <GitBranch className="h-5 w-5" />
            </Button>
            <InboxPopover />
          </nav>
        )}

        {!user ? (
          <>
            <div className="hidden md:flex flex-1 justify-center">
              <nav className="flex items-center space-x-6 text-sm font-medium">
                <PublicNavLinks />
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <UserMenu />
            </div>
          </>
        ) : (
          <div className="flex items-center space-x-4">
            <UserMenu />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
