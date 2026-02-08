"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter } from "lucide-react";
import TransactionTable from "@/components/finance/TransactionTable";
import TransactionModal from "@/components/finance/TransactionModal";
import TransactionSummary from "@/components/finance/TransactionSummary";
import InvoiceSheet from "@/components/finance/InvoiceSheet";
import { format, parseISO, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Calendar as CalendarIcon, User } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateRange } from "react-day-picker";
import { startOfMonth, endOfMonth, isWithinInterval, endOfDay } from "date-fns";

async function fetchData(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

async function createTransaction(data: any) {
  const res = await fetch("/api/transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create transaction");
  return res.json();
}

async function updateTransaction(id: string, data: any) {
  const res = await fetch(`/api/transactions/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update transaction");
  return res.json();
}

async function deleteTransaction(id: string) {
  const res = await fetch(`/api/transactions/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete transaction");
  return res.json();
}

async function bulkDeleteTransactions(ids: string[]) {
  const res = await fetch("/api/transactions/bulk", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) throw new Error("Failed to bulk delete transactions");
  return res.json();
}

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [invoiceFilter, setInvoiceFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [payerFilter, setPayerFilter] = useState("all");
  const [divisionFilter, setDivisionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [buyerFilter, setBuyerFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null,
  );
  const queryClient = useQueryClient();

  const handleViewInvoice = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
  };

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => fetchData("/api/transactions"),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchData("/api/categories"),
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => fetchData("/api/accounts"),
  });

  const { data: members = [] } = useQuery({
    queryKey: ["members"],
    queryFn: () => fetchData("/api/users"),
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => fetchData("/api/invoices"),
  });

  const createMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setModalOpen(false);
      setEditingTransaction(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: bulkDeleteTransactions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  const handleBulkDelete = (ids: string[]) => {
    if (confirm(`Tem certeza que deseja excluir ${ids.length} transações?`)) {
      bulkDeleteMutation.mutate(ids);
    }
  };

  const handleBulkCategoryChange = (ids: string[]) => {
    // TODO: Implement modal for category selection
    alert(
      "Funcionalidade de mudar categoria em massa será implementada em breve!",
    );
  };

  const isOverdue = (transaction: any) => {
    if (
      transaction.status === "PAID" ||
      transaction.settled ||
      transaction.isReconciled
    )
      return false;
    if (!transaction.paymentDate) return false;
    return isBefore(parseISO(transaction.paymentDate), new Date());
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t: any) => {
      // Search
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
          t.description?.toLowerCase().includes(term) ||
          t.category?.name?.toLowerCase().includes(term) ||
          t.account?.name?.toLowerCase().includes(term);
        if (!matchesSearch) return false;
      }

      // Invoice
      if (invoiceFilter !== "all" && t.invoiceId !== invoiceFilter)
        return false;

      // Category
      if (categoryFilter !== "all" && t.categoryId !== categoryFilter)
        return false;

      // Type
      if (typeFilter !== "all" && t.type !== typeFilter) return false;

      // Payer
      if (payerFilter !== "all" && t.payerId !== payerFilter) return false;

      // Division
      if (divisionFilter === "INDIVIDUAL" && t.splitType !== "INDIVIDUAL")
        return false;
      if (divisionFilter === "SHARED" && t.splitType !== "SHARED") return false;
      if (
        divisionFilter === "PROPORTIONAL" &&
        t.splitType !== "SHARED_PROPORTIONAL"
      )
        return false;

      // Status
      const isPaid = t.settled || t.status === "PAID" || t.isReconciled;
      const isOverdueItem = isOverdue(t);
      if (statusFilter === "PENDING" && (isPaid || isOverdueItem)) return false;
      if (statusFilter === "PAID" && !isPaid) return false;
      if (statusFilter === "OVERDUE" && !isOverdueItem) return false;

      // Date Range
      if (dateRange?.from && dateRange?.to && t.purchaseDate) {
        const date = parseISO(t.purchaseDate);
        // Normalize time for comparison if needed, or rely on date-fns
        // isWithinInterval requires start and end to be valid
        if (
          !isWithinInterval(date, {
            start: dateRange.from,
            end: endOfDay(dateRange.to),
          })
        ) {
          return false;
        }
      }

      // Buyer (Quem Comprou)
      if (buyerFilter !== "all" && t.userId !== buyerFilter) return false;

      return true;
    });
  }, [
    transactions,
    searchTerm,
    invoiceFilter,
    categoryFilter,
    typeFilter,
    payerFilter,
    divisionFilter,
    statusFilter,
  ]);

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta transação?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (data: any) => {
    if (editingTransaction) {
      updateMutation.mutate({ id: editingTransaction.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Transações
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Gerencie todas as suas transações
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingTransaction(null);
            setModalOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Transação
        </Button>
      </div>

      <TransactionSummary
        transactions={filteredTransactions}
        invoiceFilter={invoiceFilter}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex flex-1 gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Buscar transação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={
                  "w-[240px] justify-start text-left font-normal bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                }
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd/MM/y", { locale: ptBR })} -{" "}
                      {format(dateRange.to, "dd/MM/y", { locale: ptBR })}
                    </>
                  ) : (
                    format(dateRange.from, "dd/MM/y", { locale: ptBR })
                  )
                ) : (
                  <span>Selecione uma data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>

          <Select value={invoiceFilter} onValueChange={setInvoiceFilter}>
            <SelectTrigger className="w-[180px] bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
              <SelectValue placeholder="Fatura" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Faturas</SelectItem>
              {invoices.map((inv: any) => (
                <SelectItem key={inv.id} value={inv.id}>
                  {inv.month}/{inv.year} - {inv.Account?.name || "Cartão"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px] bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories.map((cat: any) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[110px] bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="EXPENSE">Despesas</SelectItem>
              <SelectItem value="INCOME">Receitas</SelectItem>
              <SelectItem value="TRANSFER">Transf.</SelectItem>
            </SelectContent>
          </Select>

          <Select value={payerFilter} onValueChange={setPayerFilter}>
            <SelectTrigger className="w-[110px] bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
              <SelectValue placeholder="Quem Pagou" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Quem Pagou</SelectItem>
              {members.map((m: any) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={buyerFilter} onValueChange={setBuyerFilter}>
            <SelectTrigger className="w-[110px] bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
              <SelectValue placeholder="Quem Comprou" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Quem Comprou</SelectItem>
              {members.map((m: any) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={divisionFilter} onValueChange={setDivisionFilter}>
            <SelectTrigger className="w-[110px] bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
              <SelectValue placeholder="Divisão" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Divisão</SelectItem>
              <SelectItem value="INDIVIDUAL">Individual</SelectItem>
              <SelectItem value="SHARED">Casal (50/50)</SelectItem>
              <SelectItem value="PROPORTIONAL">Proporcional</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[110px] bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Status</SelectItem>
              <SelectItem value="PENDING">Pendente</SelectItem>
              <SelectItem value="PAID">Pago</SelectItem>
              <SelectItem value="OVERDUE">Atrasado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar Excel
        </Button>
      </div>

      {/* Transactions Table */}
      <TransactionTable
        transactions={filteredTransactions}
        categories={categories}
        accounts={accounts}
        members={members}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        onBulkCategoryChange={handleBulkCategoryChange}
        onViewInvoice={handleViewInvoice}
      />

      {/* Transaction Modal */}
      <TransactionModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditingTransaction(null);
        }}
        onSubmit={handleSubmit}
        categories={categories}
        accounts={accounts}
        members={members}
        isLoading={createMutation.isPending || updateMutation.isPending}
        editData={editingTransaction}
      />

      <InvoiceSheet
        invoiceId={selectedInvoiceId}
        open={!!selectedInvoiceId}
        onOpenChange={(open) => {
          if (!open) setSelectedInvoiceId(null);
        }}
      />
    </div>
  );
}
