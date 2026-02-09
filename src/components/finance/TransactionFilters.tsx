"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Search,
  Calendar as CalendarIcon,
  Filter,
  X,
  CheckCircle2,
  ChevronDown,
  Download,
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface TransactionFiltersProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  // Filters
  invoiceFilter: string;
  setInvoiceFilter: (val: string) => void;
  categoryFilter: string;
  setCategoryFilter: (val: string) => void;
  typeFilter: string;
  setTypeFilter: (val: string) => void;
  payerFilter: string;
  setPayerFilter: (val: string) => void;
  buyerFilter: string;
  setBuyerFilter: (val: string) => void;
  divisionFilter: string;
  setDivisionFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  // Data for selects
  invoices: any[];
  categories: any[];
  members: any[];
  onExport: () => void;
}

export default function TransactionFilters({
  searchTerm,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  invoiceFilter,
  setInvoiceFilter,
  categoryFilter,
  setCategoryFilter,
  typeFilter,
  setTypeFilter,
  payerFilter,
  setPayerFilter,
  buyerFilter,
  setBuyerFilter,
  divisionFilter,
  setDivisionFilter,
  statusFilter,
  setStatusFilter,
  invoices,
  categories,
  members,
  onExport,
}: TransactionFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Helper to count active filters
  const activeFiltersCount = [
    invoiceFilter,
    categoryFilter,
    typeFilter,
    payerFilter,
    buyerFilter,
    divisionFilter,
    statusFilter,
  ].filter((f) => f !== "all").length;

  const clearFilters = () => {
    setInvoiceFilter("all");
    setCategoryFilter("all");
    setTypeFilter("all");
    setPayerFilter("all");
    setBuyerFilter("all");
    setDivisionFilter("all");
    setStatusFilter("all");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Left Side: Search & Date */}
        <div className="flex flex-1 gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Buscar por descrição..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onSearchChange(e.target.value)
              }
              className="pl-9 h-10 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus-visible:ring-emerald-500"
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[240px] justify-start text-left font-normal h-10 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800",
                  !dateRange && "text-zinc-500",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-zinc-500" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd/MM", { locale: ptBR })} -{" "}
                      {format(dateRange.to, "dd/MM", { locale: ptBR })}
                    </>
                  ) : (
                    format(dateRange.from, "dd/MM/y", { locale: ptBR })
                  )
                ) : (
                  <span>Selecione data</span>
                )}
              </Button>
            </PopoverTrigger>
            {/* @ts-ignore */}
            <PopoverContent className="w-auto p-0" align="start">
              {/* @ts-ignore */}
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={onDateRangeChange}
                numberOfMonths={2}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Right Side: Filters & Export */}
        <div className="flex gap-2 w-full sm:w-auto">
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-10 gap-2 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800",
                  activeFiltersCount > 0 &&
                    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-800",
                )}
              >
                <Filter className="h-4 w-4" />
                <span>Filtros</span>
                {activeFiltersCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200"
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            {/* @ts-ignore */}
            <PopoverContent
              className="w-[340px] p-4 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-xl"
              align="end"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                    Filtros Avançados
                  </h4>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-auto p-0 text-xs text-rose-500 hover:text-rose-600 hover:bg-transparent"
                    >
                      Limpar todos
                    </Button>
                  )}
                </div>
                <Separator />

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500">
                      Tipo
                    </label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="EXPENSE">Despesa</SelectItem>
                        <SelectItem value="INCOME">Receita</SelectItem>
                        <SelectItem value="TRANSFER">Transf.</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500">
                      Status
                    </label>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="PENDING">Pendente</SelectItem>
                        <SelectItem value="PAID">Pago</SelectItem>
                        <SelectItem value="OVERDUE">Atrasado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1 col-span-2">
                    <label className="text-xs font-medium text-zinc-500">
                      Categoria
                    </label>
                    <Select
                      value={categoryFilter}
                      onValueChange={setCategoryFilter}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <div className="flex items-center gap-2">
                              <span>{cat.icon}</span>
                              <span>{cat.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1 col-span-2">
                    <label className="text-xs font-medium text-zinc-500">
                      Fatura
                    </label>
                    <Select
                      value={invoiceFilter}
                      onValueChange={setInvoiceFilter}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {invoices.map((inv) => (
                          <SelectItem key={inv.id} value={inv.id}>
                            {inv.month}/{inv.year} - {inv.Account?.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500">
                      Quem Pagou
                    </label>
                    <Select value={payerFilter} onValueChange={setPayerFilter}>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {members.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500">
                      Quem Comprou
                    </label>
                    <Select value={buyerFilter} onValueChange={setBuyerFilter}>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {members.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1 col-span-2">
                    <label className="text-xs font-medium text-zinc-500">
                      Divisão
                    </label>
                    <Select
                      value={divisionFilter}
                      onValueChange={setDivisionFilter}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                        <SelectItem value="SHARED">Casal (50/50)</SelectItem>
                        <SelectItem value="PROPORTIONAL">
                          Proporcional
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            className="h-10 w-10 p-0 border-zinc-200 dark:border-zinc-800"
            onClick={onExport}
          >
            <Download className="h-4 w-4 text-zinc-500" />
          </Button>
        </div>
      </div>

      {/* Active Filters Summary (Chips) */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1">
          {categoryFilter !== "all" && (
            <Badge variant="secondary" className="gap-1 pr-1">
              Cat:{" "}
              {categories.find((c) => c.id === categoryFilter)?.name ||
                "Desconhecida"}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 hover:bg-transparent"
                onClick={() => setCategoryFilter("all")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {typeFilter !== "all" && (
            <Badge variant="secondary" className="gap-1 pr-1">
              Tipo:{" "}
              {typeFilter === "EXPENSE"
                ? "Despesa"
                : typeFilter === "INCOME"
                  ? "Receita"
                  : "Transf."}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 hover:bg-transparent"
                onClick={() => setTypeFilter("all")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {statusFilter !== "all" && (
            <Badge variant="secondary" className="gap-1 pr-1">
              Status:{" "}
              {statusFilter === "PAID"
                ? "Pago"
                : statusFilter === "PENDING"
                  ? "Pendente"
                  : "Atrasado"}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 hover:bg-transparent"
                onClick={() => setStatusFilter("all")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {/* Add other chips as needed */}
        </div>
      )}
    </div>
  );
}
