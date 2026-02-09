"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { LogOut, User as UserIcon } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

interface UserMenuProps {
  isSidebarWide: boolean;
  isMobile?: boolean;
  className?: string;
}

export function UserMenu({
  isSidebarWide,
  isMobile = false,
  className,
}: UserMenuProps) {
  const { data: session } = useSession();
  const user = session?.user;

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 transition-all duration-300 relative h-14",
            !isSidebarWide && !isMobile && "justify-center px-0",
            className,
          )}
        >
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={user.image || ""} alt={user.name || "User"} />
            <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          <div
            className={cn(
              "flex flex-col items-start transition-all duration-300 overflow-hidden",
              !isSidebarWide && !isMobile
                ? "opacity-0 w-0 absolute left-full"
                : "opacity-100 w-auto",
            )}
          >
            <span className="text-sm font-medium truncate max-w-[120px]">
              {user.name}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[120px]">
              {user.email}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
