import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  DollarSign,
  CreditCard,
  Hash,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionSummaryProps {
  transactions: any[];
  invoiceFilter: string;
}

export default function TransactionSummary({
  transactions,
  invoiceFilter,
}: TransactionSummaryProps) {
  // Calcular totais e contadores
  const {
    income,
    expense,
    balance,
    invoiceTotal,
    incomeCount,
    expenseCount,
    sharedTotal,
    sharedCount,
  } = transactions.reduce(
    (acc, t) => {
      const amount = Number(t.amount) || 0;

      if (t.type === "INCOME") {
        acc.income += amount;
        acc.balance += amount;
        acc.incomeCount += 1;
      } else if (t.type === "EXPENSE" || t.type === "PAYMENT") {
        acc.expense += amount;
        acc.balance -= amount;
        acc.expenseCount += 1;

        // Rastrear despesas compartilhadas
        if (
          t.splitType === "SHARED" ||
          t.splitType === "SHARED_PROPORTIONAL"
        ) {
          acc.sharedTotal += amount;
          acc.sharedCount += 1;
        }
      }

      // Se estiver filtrando por fatura, somar o total da fatura
      if (invoiceFilter !== "all" && t.invoiceId === invoiceFilter) {
        acc.invoiceTotal += amount;
      }

      return acc;
    },
    {
      income: 0,
      expense: 0,
      balance: 0,
      invoiceTotal: 0,
      incomeCount: 0,
      expenseCount: 0,
      sharedTotal: 0,
      sharedCount: 0,
    },
  );

  const totalCount = transactions.length;

  const formatCurrency = (val: number) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // Função auxiliar para pluralizar "transação"
  const transacoesLabel = (count: number) =>
    count === 1 ? "1 transação" : `${count} transações`;

  // Determinar colunas do grid dinamicamente
  const hasInvoiceCard = invoiceFilter !== "all";
  const hasSharedCard = sharedCount > 0;
  const totalCards = 4 + (hasInvoiceCard ? 1 : 0) + (hasSharedCard ? 1 : 0);
  const gridCols =
    totalCards <= 4
      ? "md:grid-cols-2 lg:grid-cols-4"
      : totalCards === 5
        ? "md:grid-cols-3 lg:grid-cols-5"
        : "md:grid-cols-3 lg:grid-cols-6";

  return (
    <div
      className={cn(
        "grid gap-4 grid-cols-2",
        gridCols,
        "animate-in fade-in slide-in-from-top-4 duration-500",
      )}
    >
      {/* Card: Transações (total count) */}
      <Card className="relative overflow-hidden border-zinc-200 dark:border-zinc-700/60 bg-gradient-to-br from-zinc-50 to-zinc-100/80 dark:from-zinc-900 dark:to-zinc-800/60">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_40%,rgba(0,0,0,.02)_100%)] dark:bg-[linear-gradient(45deg,transparent_40%,rgba(255,255,255,.02)_100%)]" />
        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Transações
          </CardTitle>
          <div className="rounded-md bg-zinc-200/80 p-1 dark:bg-zinc-700/60">
            <Hash className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
            {totalCount}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {transacoesLabel(incomeCount)} de entrada,{" "}
            {transacoesLabel(expenseCount)} de saída
          </p>
        </CardContent>
      </Card>

      {/* Card: Entradas */}
      <Card className="relative overflow-hidden border-emerald-200/60 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/10">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,rgba(16,185,129,.04)_100%)] dark:bg-[linear-gradient(135deg,transparent_40%,rgba(16,185,129,.06)_100%)]" />
        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            Entradas
          </CardTitle>
          <div className="rounded-md bg-emerald-100 p-1 dark:bg-emerald-900/50">
            <ArrowUpCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            {formatCurrency(income)}
          </div>
          <p className="text-xs text-emerald-600/70 dark:text-emerald-400/60">
            {transacoesLabel(incomeCount)}
          </p>
        </CardContent>
      </Card>

      {/* Card: Saídas */}
      <Card className="relative overflow-hidden border-rose-200/60 dark:border-rose-900/40 bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-950/30 dark:to-rose-900/10">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,rgba(244,63,94,.04)_100%)] dark:bg-[linear-gradient(135deg,transparent_40%,rgba(244,63,94,.06)_100%)]" />
        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-rose-700 dark:text-rose-400">
            Saídas
          </CardTitle>
          <div className="rounded-md bg-rose-100 p-1 dark:bg-rose-900/50">
            <ArrowDownCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-2xl font-bold text-rose-700 dark:text-rose-400">
            {formatCurrency(expense)}
          </div>
          <p className="text-xs text-rose-600/70 dark:text-rose-400/60">
            {transacoesLabel(expenseCount)}
          </p>
        </CardContent>
      </Card>

      {/* Card: Balanço */}
      <Card
        className={cn(
          "relative overflow-hidden border-blue-200/60 dark:border-blue-900/40",
          balance >= 0
            ? "bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/10"
            : "bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-950/30 dark:to-rose-900/10",
        )}
      >
        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle
            className={cn(
              "text-sm font-medium",
              balance >= 0
                ? "text-blue-700 dark:text-blue-400"
                : "text-rose-700 dark:text-rose-400",
            )}
          >
            Balanço
          </CardTitle>
          <div
            className={cn(
              "rounded-md p-1",
              balance >= 0
                ? "bg-blue-100 dark:bg-blue-900/50"
                : "bg-rose-100 dark:bg-rose-900/50",
            )}
          >
            <DollarSign
              className={cn(
                "h-4 w-4",
                balance >= 0
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-rose-600 dark:text-rose-400",
              )}
            />
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div
            className={cn(
              "text-2xl font-bold",
              balance >= 0
                ? "text-blue-700 dark:text-blue-400"
                : "text-rose-700 dark:text-rose-400",
            )}
          >
            {formatCurrency(balance)}
          </div>
          <p
            className={cn(
              "text-xs",
              balance >= 0
                ? "text-blue-600/70 dark:text-blue-400/60"
                : "text-rose-600/70 dark:text-rose-400/60",
            )}
          >
            Entradas - Saídas
          </p>
        </CardContent>
      </Card>

      {/* Card: Compartilhadas (condicional - só aparece quando há despesas compartilhadas) */}
      {hasSharedCard && (
        <Card className="relative overflow-hidden border-amber-200/60 dark:border-amber-900/40 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/10">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,rgba(245,158,11,.04)_100%)] dark:bg-[linear-gradient(135deg,transparent_40%,rgba(245,158,11,.06)_100%)]" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-400">
              Compartilhadas
            </CardTitle>
            <div className="rounded-md bg-amber-100 p-1 dark:bg-amber-900/50">
              <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
              {formatCurrency(sharedTotal)}
            </div>
            <p className="text-xs text-amber-600/70 dark:text-amber-400/60">
              {transacoesLabel(sharedCount)} compartilhada{sharedCount !== 1 && "s"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Card: Fatura Selecionada (condicional - só aparece quando filtrando por fatura) */}
      {hasInvoiceCard && (
        <Card className="relative overflow-hidden border-purple-200/60 dark:border-purple-900/40 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/10">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,rgba(147,51,234,.04)_100%)] dark:bg-[linear-gradient(135deg,transparent_40%,rgba(147,51,234,.06)_100%)]" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Fatura Selecionada
            </CardTitle>
            <div className="rounded-md bg-purple-100 p-1 dark:bg-purple-900/50">
              <CreditCard className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {formatCurrency(expense)}
            </div>
            <p className="text-xs text-purple-600/70 dark:text-purple-400/60">
              Total nesta fatura
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
