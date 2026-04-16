import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MonthlySummaryCardProps {
  income: number;
  expenses: number;
  balance: number;
  isVisible?: boolean;
}

export default function MonthlySummaryCard({
  income,
  expenses,
  balance,
  isVisible = true,
}: MonthlySummaryCardProps) {
  const isPositive = balance >= 0;
  const fmt = (v: number) =>
    isVisible
      ? `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
      : "••••••";

  return (
    <Card
      className={cn(
        "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-2xl",
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Resumo do Mês
          </p>
          <div
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
              isPositive
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                : "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {isPositive ? "Positivo" : "Negativo"}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Receitas
              </span>
            </div>
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {fmt(income)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Despesas
              </span>
            </div>
            <span className="text-sm font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
              {fmt(expenses)}
            </span>
          </div>
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3 flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Saldo do Mês
            </span>
            <span
              className={cn(
                "text-lg font-bold tabular-nums",
                isPositive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400",
              )}
            >
              {fmt(balance)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
