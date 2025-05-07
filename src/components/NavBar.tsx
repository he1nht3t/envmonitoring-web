"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Menu, LogOut } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";

export default function NavBar() {
  const pathname = usePathname();
  const { isAuthenticated, signOut } = useAuth();
  const { theme } = useTheme();
  
  const logoSrc = theme === "dark" ? "/envato-dark.svg" : "/envato.svg";

  const navLinks = [
    { href: "/", label: "Dashboard" },
    { href: "/analytics", label: "Analytics" },
    { href: "/devices", label: "Devices" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src={logoSrc}
              alt="Logo"
              width={120}
              height={120}
              className="h-24 w-24 -my-6"
              priority
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors relative",
                  isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
                {isActive && (
                  <span className="absolute -bottom-[21px] left-0 right-0 h-[2px] bg-primary" />
                )}
              </Link>
            );
          })}

          <div className="flex items-center gap-3 ml-2">
            <ThemeToggle />

            {isAuthenticated && (
              <Button
                onClick={signOut}
                variant="outline"
                size="sm"
                className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            )}
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-3">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger>
              <Menu className="h-6 w-6" />
            </SheetTrigger>
            <SheetContent side="left" className="w-[250px] sm:w-[300px]">
              <SheetHeader>
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-6 py-6">
                <Link href="/" className="flex items-center justify-center">
                  <Image
                    src={logoSrc}
                    alt="Logo"
                    width={150}
                    height={150}
                    className="h-28 w-28"
                    priority
                  />
                </Link>
                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => {
                    const isActive =
                      link.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(link.href);

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          "text-sm font-medium transition-colors py-2 px-1 border-l-2",
                          isActive
                            ? "text-primary font-semibold border-primary"
                            : "text-muted-foreground hover:text-foreground border-transparent",
                        )}
                      >
                        {link.label}
                      </Link>
                    );
                  })}

                  {isAuthenticated && (
                    <button
                      onClick={signOut}
                      className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 py-2 px-1 border-l-2 border-transparent transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
