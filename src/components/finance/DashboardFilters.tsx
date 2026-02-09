"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MonthSelector } from "@/components/finance/MonthSelector";
import { Users, Loader2 } from "lucide-react";

interface DashboardFiltersProps {
  filterScope?: "ALL" | "SHARED" | "INDIVIDUAL";
  filterUser?: string;
  users: Array<{ id: string; name: string }>;
}

export function DashboardFilters({
  filterScope,
  filterUser,
  users,
}: DashboardFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || !value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm w-full sm:w-auto overflow-x-auto relative">
      <MonthSelector />

      <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

      {/* Scope Filter */}
      <Tabs
        value={filterScope || "ALL"}
        onValueChange={(val) => updateFilters("scope", val)}
        className="w-auto"
      >
        <TabsList className="bg-zinc-100 dark:bg-zinc-800 h-7">
          <TabsTrigger value="ALL" className="text-xs px-3">
            Geral
          </TabsTrigger>
          <TabsTrigger value="SHARED" className="text-xs px-3">
            Casal
          </TabsTrigger>
          <TabsTrigger value="INDIVIDUAL" className="text-xs px-3">
            Meus
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

      {/* User Filter */}
      <Select
        value={filterUser || "all"}
        onValueChange={(val) => updateFilters("userId", val)}
      >
        <SelectTrigger className="w-[130px] border-none shadow-none bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800 focus:ring-0 h-7 text-xs">
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-zinc-500" />
            <SelectValue placeholder="Usuário" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {users.map((u) => (
            <SelectItem key={u.id} value={u.id}>
              {u.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Loading Indicator */}
      {isPending && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <Loader2 className="h-3 w-3 animate-spin text-zinc-400" />
        </div>
      )}
    </div>
  );
}
