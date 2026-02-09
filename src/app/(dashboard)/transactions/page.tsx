"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import TransactionTable from "@/components/finance/TransactionTable";
import TransactionModal from "@/components/finance/TransactionModal";
import TransactionSummary from "@/components/finance/TransactionSummary";
import TransactionFilters from "@/components/finance/TransactionFilters";
import InvoiceSheet from "@/components/finance/InvoiceSheet";
import {
  parseISO,
  isBefore,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  endOfDay,
  subMonths,
} from "date-fns";
import { DateRange } from "react-day-picker";

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
    categoryFilter, // Included based on prior logic, though double checked
    buyerFilter,
    dateRange,
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
            Histórico completo de receitas e despesas
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingTransaction(null);
            setModalOpen(true);
          }}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="h-4 w-4" />
          Nova Transação
        </Button>
      </div>

      <TransactionSummary
        transactions={filteredTransactions}
        invoiceFilter={invoiceFilter}
      />

      {/* Main Content Area: Filters + Table */}
      <div className="space-y-4">
        <TransactionFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          invoiceFilter={invoiceFilter}
          setInvoiceFilter={setInvoiceFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          payerFilter={payerFilter}
          setPayerFilter={setPayerFilter}
          buyerFilter={buyerFilter}
          setBuyerFilter={setBuyerFilter}
          divisionFilter={divisionFilter}
          setDivisionFilter={setDivisionFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          invoices={invoices}
          categories={categories}
          members={members}
          onExport={() => alert("Export functionality coming soon")}
        />

        <div className="bg-white dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
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
        </div>
      </div>

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
