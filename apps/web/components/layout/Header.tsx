"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Github, LogOut, User, Settings } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent } from "../ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Image from "next/image";

const Header = () => {
  const { user, isLoading, signIn, signOut } = useAuth();

  const NavLinks = () => (
    <>
      <Link
        href="/"
        className="text-sm font-medium hover:text-primary transition-colors"
      >
        Accueil
      </Link>
      {user && (
        <>
          <Link
            href="/dashboard"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/repositories"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Dépôts
          </Link>
        </>
      )}
    </>
  );

  const UserMenu = () => {
    if (isLoading) {
      return (
        <div className="flex items-center space-x-2">
          <div className="animate-pulse bg-muted h-8 w-8 rounded-full"></div>
          <div className="animate-pulse bg-muted h-4 w-20 rounded"></div>
        </div>
      );
    }

    if (user) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={user.avatarUrl || undefined}
                  alt={user.name || "User"}
                />
                <AvatarFallback>
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                <p className="font-medium">{user.name || "Utilisateur"}</p>
                <p className="w-[200px] truncate text-sm text-muted-foreground">
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
              onClick={signOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Button onClick={signIn} className="flex items-center gap-2">
        <Github className="h-4 w-4" />
        Se connecter
      </Button>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/Logo.png" alt="Quori Logo" width={40} height={40} />
          <span className="hidden font-bold sm:inline-block">Quori</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <NavLinks />
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          <UserMenu />
        </div>

        <div className="flex md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-2 border-b pb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <span className="text-lg font-bold">Q</span>
                  </div>
                  <span className="font-bold">Quori</span>
                </div>

                <nav className="flex flex-col space-y-3">
                  <NavLinks />
                </nav>

                <div className="border-t pt-4">
                  <UserMenu />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
