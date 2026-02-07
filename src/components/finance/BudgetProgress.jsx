import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PiggyBank, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BudgetProgress({ budgets = [], transactions = [] }) {
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
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
    const remaining = budget.amount - spent;

    return {
      ...budget,
      spent,
      percentage: Math.min(percentage, 100),
      remaining,
      isOver: spent > budget.amount,
    };
  });

  const overBudgetCount = budgetData.filter((b) => b.isOver).length;

  if (currentBudgets.length === 0) {
    return null;
  }

  return (
    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          <span className="flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-blue-500" />
            Orçamentos do Mês
          </span>
          {overBudgetCount > 0 && (
            <span className="flex items-center gap-1 text-sm text-rose-500">
              <AlertTriangle className="w-4 h-4" />
              {overBudgetCount} excedido(s)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {budgetData.slice(0, 4).map((budget) => (
          <div key={budget.id} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span>{budget.categoryIcon || "📁"}</span>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {budget.categoryName}
                </span>
              </span>
              <span
                className={cn(
                  "font-medium",
                  budget.isOver ? "text-rose-500" : "text-zinc-500",
                )}
              >
                R${" "}
                {budget.spent.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}{" "}
                / R${" "}
                {budget.amount.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <Progress
              value={budget.percentage}
              className={cn("h-2", budget.isOver && "[&>div]:bg-rose-500")}
            />
            <div className="flex justify-between text-xs text-zinc-400">
              <span>{budget.percentage.toFixed(0)}% usado</span>
              <span className={budget.isOver ? "text-rose-500" : ""}>
                {budget.isOver
                  ? `Excedido R$ ${Math.abs(budget.remaining).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                  : `Restam R$ ${budget.remaining.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
              </span>
            </div>
          </div>
        ))}

        {budgetData.length > 4 && (
          <p className="text-xs text-center text-zinc-400">
            +{budgetData.length - 4} orçamento(s) configurado(s)
          </p>
        )}
      </CardContent>
    </Card>
  );
}
