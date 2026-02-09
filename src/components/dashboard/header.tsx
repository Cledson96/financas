"use client";

import { usePathname } from "next/navigation";
import { UserMenu } from "@/components/user-menu";
import { Button } from "@/components/ui/button";
import { Menu, Moon, Sun, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onMenuClick: () => void;
  theme: string;
  toggleTheme: () => void;
}

const getPageTitle = (pathname: string) => {
  const path = pathname.split("/").pop();
  switch (path) {
    case "dashboard":
      return "Dashboard";
    case "transactions":
      return "Transações";
    case "couple":
      return "Casal";
    case "settings":
      return "Configurações";
    default:
      return "Finanças";
  }
};

export function Header({ onMenuClick, theme, toggleTheme }: HeaderProps) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md transition-colors">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
            aria-label="Toggle Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notifications Placeholder - Future feature */}
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            <Bell className="h-5 w-5" />
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>

          {/* Separator */}
          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

          {/* User Menu */}
          <div className="flex items-center">
            {/* Reusing existing UserMenu with adjusted styles for header */}
            <UserMenu
              isSidebarWide={true}
              className="w-auto px-3 h-10 border-none hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
