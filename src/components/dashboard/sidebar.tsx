"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Receipt,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  isMobile?: boolean;
  closeMobile?: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transações", href: "/transactions", icon: Receipt },
  { name: "Casal", href: "/couple", icon: Users },
  { name: "Configurações", href: "/settings", icon: Settings },
];

export function Sidebar({
  isCollapsed,
  toggleSidebar,
  isMobile = false,
  closeMobile,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "relative flex flex-col h-full bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300",
        isCollapsed ? "w-20" : "w-64",
        isMobile && "w-full border-none",
      )}
    >
      {/* Header / Logo Area */}
      <div
        className={cn(
          "flex items-center gap-3 px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 transition-all duration-300 overflow-hidden whitespace-nowrap h-20",
          !isMobile && isCollapsed && "px-4 justify-center",
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
            !isMobile && isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto",
          )}
        >
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Finanças
          </h1>
          <p className="text-xs text-zinc-500">Controle Casal</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 overflow-y-auto overflow-x-hidden">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={isMobile ? closeMobile : undefined}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap overflow-hidden group",
                  isActive
                    ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100",
                )}
                title={isCollapsed && !isMobile ? item.name : undefined}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0 transition-colors",
                    isActive
                      ? "text-emerald-500 dark:text-emerald-400"
                      : "group-hover:text-zinc-900 dark:group-hover:text-zinc-100",
                  )}
                />
                <span
                  className={cn(
                    "transition-all duration-300",
                    !isMobile && isCollapsed
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
      </div>

      {/* Collapse Button (Desktop Only) */}
      {!isMobile && (
        <div className="absolute -right-3 top-9 z-50">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-6 w-6 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full shadow-md hover:bg-zinc-100 dark:hover:bg-zinc-700 p-0.5"
            title={isCollapsed ? "Expandir" : "Recolher"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronLeft className="h-3 w-3" />
            )}
          </Button>
        </div>
      )}
    </aside>
  );
}
