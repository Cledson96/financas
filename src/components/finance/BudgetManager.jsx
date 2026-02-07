import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Pencil,
  Trash2,
  PiggyBank,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function BudgetManager({
  budgets = [],
  transactions = [],
  categories = [],
  onAdd,
  onEdit,
  onDelete,
}) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const currentMonth = selectedDate.getMonth() + 1;
  const currentYear = selectedDate.getFullYear();

  const filteredBudgets = useMemo(() => {
    return budgets.filter(
      (b) => b.month === currentMonth && b.year === currentYear,
    );
  }, [budgets, currentMonth, currentYear]);

  const budgetData = useMemo(() => {
    return filteredBudgets.map((budget) => {
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
  }, [filteredBudgets, transactions, currentMonth, currentYear]);

  const totalBudget = filteredBudgets.reduce(
    (sum, b) => sum + (b.amount || 0),
    0,
  );
  const totalSpent = budgetData.reduce((sum, b) => sum + b.spent, 0);

  const handlePrevMonth = () => setSelectedDate(subMonths(selectedDate, 1));
  const handleNextMonth = () => setSelectedDate(addMonths(selectedDate, 1));

  return (
    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            <PiggyBank className="w-5 h-5 text-blue-500" />
            Orçamentos
          </CardTitle>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handlePrevMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-3 text-sm font-medium min-w-[120px] text-center">
                {format(selectedDate, "MMMM yyyy", { locale: ptBR })}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleNextMonth}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={() => onAdd(currentMonth, currentYear)}
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Novo
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Resumo */}
        {filteredBudgets.length > 0 && (
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-zinc-500">
                Total Orçado vs Gasto
              </span>
              <span className="text-sm font-medium">
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
              className="h-3"
            />
          </div>
        )}

        {/* Lista de Orçamentos */}
        <div className="space-y-3">
          {budgetData.length === 0 ? (
            <div className="text-center py-8">
              <PiggyBank className="w-12 h-12 mx-auto mb-3 text-zinc-300" />
              <p className="text-zinc-500">Nenhum orçamento para este mês</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => onAdd(currentMonth, currentYear)}
              >
                Criar primeiro orçamento
              </Button>
            </div>
          ) : (
            budgetData.map((budget) => (
              <div
                key={budget.id}
                className={cn(
                  "p-4 rounded-xl border transition-colors",
                  budget.isOver
                    ? "border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20"
                    : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/30",
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {budget.categoryIcon || "📁"}
                    </span>
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">
                        {budget.categoryName}
                      </p>
                      <p className="text-xs text-zinc-500">
                        Limite: R${" "}
                        {budget.amount.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEdit(budget)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-rose-500 hover:text-rose-600"
                      onClick={() => onDelete(budget)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Progress
                  value={budget.percentage}
                  className={cn(
                    "h-2 mb-2",
                    budget.isOver && "[&>div]:bg-rose-500",
                  )}
                />

                <div className="flex justify-between text-sm">
                  <span
                    className={cn(
                      "font-medium",
                      budget.isOver ? "text-rose-600" : "text-emerald-600",
                    )}
                  >
                    R${" "}
                    {budget.spent.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    gasto
                  </span>
                  <span
                    className={cn(
                      budget.isOver ? "text-rose-500" : "text-zinc-500",
                    )}
                  >
                    {budget.isOver
                      ? `Excedido R$ ${Math.abs(budget.remaining).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                      : `Restam R$ ${budget.remaining.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
