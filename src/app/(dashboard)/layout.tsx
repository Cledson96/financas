"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image"; // Added import
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Receipt,
  Users,
  Settings,
  Menu,
  Moon,
  Sun,
  Wallet,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/user-menu";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transações", href: "/transactions", icon: Receipt },
  { name: "Casal", href: "/couple", icon: Users },
  { name: "Configurações", href: "/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState("light");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const stored = localStorage.getItem("theme") || "light";
    setTheme(stored);
    document.documentElement.classList.toggle("dark", stored === "dark");

    // Load collapsed state from local storage
    const storedCollapsed = localStorage.getItem("sidebarCollapsed") === "true";
    setIsCollapsed(storedCollapsed);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const toggleSidebar = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    localStorage.setItem("sidebarCollapsed", String(newCollapsed));
  };

  // Determine if sidebar is effectively wide (expanded or hovered)
  const isSidebarWide = !isCollapsed || isSidebarHovered;

  const NavItems = ({
    onNavigate,
    isMobile = false,
  }: {
    onNavigate?: () => void;
    isMobile?: boolean;
  }) => (
    <nav className="space-y-1">
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap overflow-hidden",
              isActive
                ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100",
            )}
            title={!isSidebarWide && !isMobile ? item.name : undefined}
          >
            <item.icon
              className={cn(
                "w-5 h-5 flex-shrink-0",
                isActive && "text-blue-500",
              )}
            />
            <span
              className={cn(
                "transition-all duration-300",
                !isSidebarWide && !isMobile
                  ? "opacity-0 w-0 translate-x-[-10px]"
                  : "opacity-100 w-auto translate-x-0",
              )}
            >
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300 z-50",
          isSidebarWide ? "lg:w-64" : "lg:w-20",
        )}
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
      >
        <div className="flex flex-col flex-1 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
          {/* Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-9 z-50 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full p-1 shadow-md hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            title={isCollapsed ? "Expandir menu" : "Recolher menu"}
          >
            {isCollapsed ? (
              <ChevronRight size={14} />
            ) : (
              <ChevronLeft size={14} />
            )}
          </button>

          {/* Logo */}
          <div
            className={cn(
              "flex items-center gap-3 px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 transition-all duration-300 overflow-hidden whitespace-nowrap",
              !isSidebarWide && "px-4 justify-center",
            )}
          >
            <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-zinc-200 dark:border-zinc-700">
              <Image
                src="/images/couple.jpg"
                alt="Finanças do Casal"
                fill
                className="object-cover"
              />
            </div>
            <div
              className={cn(
                "transition-all duration-300",
                !isSidebarWide ? "opacity-0 w-0" : "opacity-100 w-auto",
              )}
            >
              <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Finanças do Casal
              </h1>
              <p className="text-xs text-zinc-500">Controle Financeiro</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-3 py-4 overflow-y-auto overflow-x-hidden">
            <NavItems />
          </div>

          {/* Use Menu & Theme Toggle */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col gap-2">
            <UserMenu isSidebarWide={isSidebarWide} />

            <Button
              variant="ghost"
              onClick={toggleTheme}
              className={cn(
                "w-full justify-start gap-3 transition-all duration-300",
                !isSidebarWide && "justify-center px-0",
              )}
              title={
                !isSidebarWide
                  ? theme === "light"
                    ? "Modo Escuro"
                    : "Modo Claro"
                  : undefined
              }
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5 flex-shrink-0" />
              ) : (
                <Sun className="w-5 h-5 flex-shrink-0" />
              )}

              <span
                className={cn(
                  "whitespace-nowrap transition-all duration-300",
                  !isSidebarWide
                    ? "opacity-0 w-0 hidden"
                    : "opacity-100 w-auto inline-block",
                )}
              >
                {theme === "light" ? "Modo Escuro" : "Modo Claro"}
              </span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <div className="flex items-center gap-3 px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-zinc-200 dark:border-zinc-700">
                    <Image
                      src="/images/couple.jpg"
                      alt="Finanças do Casal"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      Finanças do Casal
                    </h1>
                    <p className="text-xs text-zinc-500">Controle Financeiro</p>
                  </div>
                </div>
                <div className="px-3 py-4">
                  <NavItems
                    onNavigate={() => setMobileOpen(false)}
                    isMobile={true}
                  />
                  <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <UserMenu isSidebarWide={true} isMobile={true} />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {navigation.find((n) => n.href === pathname)?.name ||
                "Finanças do Casal"}
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "light" ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={cn(
          "transition-all duration-300",
          isCollapsed ? "lg:pl-20" : "lg:pl-64",
        )}
      >
        <div className="min-h-screen pt-16 lg:pt-0">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}
