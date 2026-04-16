import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PiggyBank, AlertTriangle, Target } from "lucide-react";
import { cn } from "@/lib/utils";

const toNumber = (val: any) => Number(val) || 0;

interface Budget {
  id: string;
  amount: number;
  month: number;
  year: number;
  categoryId: string;
  categoryName?: string;
  categoryIcon?: string;
}

interface Transaction {
  id: string;
  amount: any; // Decimal inputs
  type: string;
  categoryId: string;
  purchaseDate: string | Date;
}

interface BudgetProgressProps {
  budgets: Budget[];
  transactions: Transaction[];
  onDefineGoals?: () => void;
}

function getBudgetColor(percentage: number) {
  if (percentage > 90) return "rose"; // red — over 90%
  if (percentage > 70) return "amber"; // yellow — 70-90%
  return "emerald"; // green — under 70%
}

export default function BudgetProgress({
  budgets = [],
  transactions = [],
  onDefineGoals,
}: BudgetProgressProps) {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const currentBudgets = budgets.filter(
    (b) => b.month === currentMonth && b.year === currentYear,
  );

  const budgetData = currentBudgets.map((budget) => {
    const spent = transactions
      .filter(
        (t) =>
          t.type === "EXPENSE" &&
          t.categoryId === budget.categoryId &&
          new Date(t.purchaseDate).getMonth() + 1 === currentMonth &&
          new Date(t.purchaseDate).getFullYear() === currentYear,
      )
      .reduce((sum, t) => sum + toNumber(t.amount), 0);

    const amount = toNumber(budget.amount);
    const percentage = amount > 0 ? (spent / amount) * 100 : 0;
    const remaining = amount - spent;
    const color = getBudgetColor(percentage);

    return {
      ...budget,
      spent,
      percentage: Math.min(percentage, 100),
      rawPercentage: percentage,
      remaining,
      isOver: spent > amount,
      color,
    };
  });

  const totalBudget = currentBudgets.reduce(
    (sum, b) => sum + toNumber(b.amount),
    0,
  );
  const totalSpent = budgetData.reduce((sum, b) => sum + b.spent, 0);
  const overBudgetCount = budgetData.filter((b) => b.isOver).length;

  // Empty state — show card with "Define Goals" button
  if (currentBudgets.length === 0) {
    return (
      <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            <PiggyBank className="w-5 h-5 text-blue-500" />
            Orçamentos do Mês
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center mb-4">
            <Target className="w-7 h-7 text-blue-400" />
          </div>
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
            Nenhuma meta definida
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-4">
            Defina limites por categoria para controlar seus gastos
          </p>
          {onDefineGoals && (
            <Button
              onClick={onDefineGoals}
              size="sm"
              className="gap-2 bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Target className="w-4 h-4" />
              Definir Metas
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          <span className="flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-blue-500" />
            Orçamentos do Mês
          </span>
          <div className="flex items-center gap-2">
            {overBudgetCount > 0 && (
              <span className="flex items-center gap-1 text-sm text-rose-500">
                <AlertTriangle className="w-4 h-4" />
                {overBudgetCount} excedido(s)
              </span>
            )}
            {onDefineGoals && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDefineGoals}
                className="h-7 text-xs text-blue-500 hover:text-blue-600"
              >
                <Target className="w-3.5 h-3.5 mr-1" />
                Metas
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary bar */}
        {totalBudget > 0 && (
          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-zinc-500">Total</span>
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                R${" "}
                {totalSpent.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}{" "}
                / R${" "}
                {totalBudget.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <Progress
              value={
                totalBudget > 0
                  ? Math.min((totalSpent / totalBudget) * 100, 100)
                  : 0
              }
              className={cn(
                "h-2",
                totalSpent / totalBudget > 0.9 && "[&>div]:bg-rose-500",
                totalSpent / totalBudget > 0.7 &&
                  totalSpent / totalBudget <= 0.9 &&
                  "[&>div]:bg-amber-500",
              )}
            />
          </div>
        )}

        {/* Per-category rows */}
        {budgetData.slice(0, 5).map((budget) => (
          <div key={budget.id} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span>{budget.categoryIcon || "📁"}</span>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {budget.categoryName}
                </span>
              </span>
              <span
                className={cn(
                  "font-medium text-xs",
                  budget.color === "rose" && "text-rose-500",
                  budget.color === "amber" && "text-amber-500",
                  budget.color === "emerald" && "text-zinc-500",
                )}
              >
                R${" "}
                {budget.spent.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}{" "}
                / R${" "}
                {toNumber(budget.amount).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <Progress
              value={budget.percentage}
              className={cn(
                "h-2",
                budget.color === "rose" && "[&>div]:bg-rose-500",
                budget.color === "amber" && "[&>div]:bg-amber-500",
                budget.color === "emerald" && "[&>div]:bg-emerald-500",
              )}
            />
            <div className="flex justify-between text-xs text-zinc-400">
              <span
                className={cn(
                  budget.color === "rose" && "text-rose-500",
                  budget.color === "amber" && "text-amber-600",
                  budget.color === "emerald" && "text-emerald-600",
                )}
              >
                {budget.rawPercentage.toFixed(0)}% usado
              </span>
              <span
                className={budget.isOver ? "text-rose-500" : "text-zinc-400"}
              >
                {budget.isOver
                  ? `Excedido R$ ${Math.abs(budget.remaining).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                  : `Restam R$ ${budget.remaining.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
              </span>
            </div>
          </div>
        ))}

        {budgetData.length > 5 && (
          <p className="text-xs text-center text-zinc-400">
            +{budgetData.length - 5} orçamento(s) configurado(s)
          </p>
        )}
      </CardContent>
    </Card>
  );
}
