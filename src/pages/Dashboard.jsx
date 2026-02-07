import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Wallet,
  TrendingDown,
  CreditCard,
  AlertTriangle,
  Plus,
  RefreshCw,
} from "lucide-react";
import {
  format,
  subMonths,
  startOfMonth,
  endOfMonth,
  parseISO,
  isBefore,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import KPICard from "@/components/finance/KPICard";
import CategoryPieChart from "@/components/finance/CategoryPieChart";
import ExpenseBarChart from "@/components/finance/ExpenseBarChart";
import TransactionModal from "@/components/finance/TransactionModal";
import BudgetProgress from "@/components/finance/BudgetProgress";

export default function Dashboard() {
  const [showOnlyShared, setShowOnlyShared] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading: loadingTx } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => base44.entities.Transaction.list("-purchaseDate", 500),
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => base44.entities.Account.list(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => base44.entities.Category.list(),
  });

  const { data: members = [] } = useQuery({
    queryKey: ["members"],
    queryFn: () => base44.entities.FamilyMember.list(),
  });

  const { data: budgets = [] } = useQuery({
    queryKey: ["budgets"],
    queryFn: () => base44.entities.Budget.list(),
  });

  const createTransaction = useMutation({
    mutationFn: (data) => base44.entities.Transaction.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setModalOpen(false);
    },
  });

  const filteredTransactions = useMemo(() => {
    if (!showOnlyShared) return transactions;
    return transactions.filter((t) => t.splitType === "SHARED");
  }, [transactions, showOnlyShared]);

  // KPIs
  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const currentMonthExpenses = useMemo(() => {
    return filteredTransactions
      .filter((t) => {
        const date = parseISO(t.purchaseDate);
        return t.type === "EXPENSE" && date >= monthStart && date <= monthEnd;
      })
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  }, [filteredTransactions, monthStart, monthEnd]);

  const totalBalance = useMemo(() => {
    return accounts
      .filter((a) => a.type === "CHECKING_ACCOUNT" || a.type === "CASH")
      .reduce((sum, a) => sum + (a.balance || 0), 0);
  }, [accounts]);

  const openInvoices = useMemo(() => {
    return accounts
      .filter((a) => a.type === "CREDIT_CARD")
      .reduce((sum, a) => {
        const used = (a.limit || 0) - (a.balance || 0);
        return sum + used;
      }, 0);
  }, [accounts]);

  const overdueCount = useMemo(() => {
    return transactions.filter((t) => {
      if (t.status === "PAID") return false;
      if (!t.paymentDate) return false;
      return isBefore(parseISO(t.paymentDate), new Date());
    }).length;
  }, [transactions]);

  // Gráfico Pizza - Gastos por Categoria
  const categoryData = useMemo(() => {
    const expensesByCategory = {};
    filteredTransactions
      .filter((t) => {
        const date = parseISO(t.purchaseDate);
        return t.type === "EXPENSE" && date >= monthStart && date <= monthEnd;
      })
      .forEach((t) => {
        const catName = t.categoryName || "Outros";
        expensesByCategory[catName] =
          (expensesByCategory[catName] || 0) + (t.amount || 0);
      });

    return Object.entries(expensesByCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filteredTransactions, monthStart, monthEnd]);

  // Gráfico Barras - Evolução 6 meses
  const evolutionData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(currentMonth, i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);

      const monthExpenses = filteredTransactions
        .filter((t) => {
          const d = parseISO(t.purchaseDate);
          return t.type === "EXPENSE" && d >= start && d <= end;
        })
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const monthIncome = filteredTransactions
        .filter((t) => {
          const d = parseISO(t.purchaseDate);
          return t.type === "INCOME" && d >= start && d <= end;
        })
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      months.push({
        month: format(date, "MMM", { locale: ptBR }),
        expenses: monthExpenses,
        income: monthIncome,
      });
    }
    return months;
  }, [filteredTransactions, currentMonth]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Dashboard
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Visão geral das suas finanças
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="shared-toggle"
              checked={showOnlyShared}
              onCheckedChange={setShowOnlyShared}
            />
            <Label
              htmlFor="shared-toggle"
              className="text-sm text-zinc-600 dark:text-zinc-400"
            >
              Só Casal
            </Label>
          </div>
          <Button onClick={() => setModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nova Transação</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Saldo Atual"
          value={`R$ ${totalBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          icon={Wallet}
          variant={totalBalance >= 0 ? "success" : "danger"}
        />
        <KPICard
          title="Gastos do Mês"
          value={`R$ ${currentMonthExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          icon={TrendingDown}
          variant="default"
        />
        <KPICard
          title="Faturas em Aberto"
          value={`R$ ${openInvoices.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          icon={CreditCard}
          variant="warning"
        />
        <KPICard
          title="Contas Atrasadas"
          value={overdueCount}
          icon={AlertTriangle}
          variant={overdueCount > 0 ? "danger" : "default"}
          pulse={overdueCount > 0}
        />
      </div>

      {/* Budget Progress */}
      <BudgetProgress budgets={budgets} transactions={transactions} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPieChart
          data={categoryData}
          title="Gastos por Categoria (Mês Atual)"
        />
        <ExpenseBarChart
          data={evolutionData}
          title="Evolução - Últimos 6 Meses"
        />
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={(data) => createTransaction.mutate(data)}
        categories={categories}
        accounts={accounts}
        members={members}
        isLoading={createTransaction.isPending}
      />
    </div>
  );
}
