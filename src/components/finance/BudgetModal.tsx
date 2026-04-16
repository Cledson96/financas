"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Target, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Category {
  id: string;
  name: string;
  type: string;
  icon?: string | null;
}

interface ExistingBudget {
  id: string;
  categoryId: string;
  amount: number;
  month: number;
  year: number;
}

interface BudgetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  existingBudgets?: ExistingBudget[];
  defaultMonth?: number;
  defaultYear?: number;
  isLoading?: boolean;
  onSubmit: (data: {
    budgets: { categoryId: string; amount: number }[];
    month: number;
    year: number;
  }) => void;
  onDelete?: (budgetId: string) => void;
}

export default function BudgetModal({
  open,
  onOpenChange,
  categories = [],
  existingBudgets = [],
  defaultMonth,
  defaultYear,
  isLoading = false,
  onSubmit,
  onDelete,
}: BudgetModalProps) {
  const month = defaultMonth || new Date().getMonth() + 1;
  const year = defaultYear || new Date().getFullYear();

  // Only EXPENSE categories
  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");

  // Build state: { categoryId: amount string }
  const [values, setValues] = useState<Record<string, string>>({});
  const [initialValues, setInitialValues] = useState<Record<string, string>>(
    {},
  );

  useEffect(() => {
    const init: Record<string, string> = {};
    for (const cat of expenseCategories) {
      const existing = existingBudgets.find(
        (b) => b.categoryId === cat.id && b.month === month && b.year === year,
      );
      init[cat.id] = existing ? String(existing.amount) : "";
    }
    setValues(init);
    setInitialValues(init);
  }, [open, existingBudgets, expenseCategories, month, year]);

  const handleChange = (categoryId: string, value: string) => {
    setValues((prev) => ({ ...prev, [categoryId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const budgets: { categoryId: string; amount: number }[] = [];
    for (const [catId, val] of Object.entries(values)) {
      const num = parseFloat(val);
      if (num > 0) {
        budgets.push({ categoryId: catId, amount: num });
      }
    }
    onSubmit({ budgets, month, year });
  };

  const monthLabel = format(new Date(year, month - 1, 1), "MMMM yyyy", {
    locale: ptBR,
  });

  const hasChanges =
    JSON.stringify(values) !== JSON.stringify(initialValues);
  const hasAnyBudget = Object.values(values).some((v) => parseFloat(v) > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Definir Metas de Orçamento
          </DialogTitle>
        </DialogHeader>

        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-center">
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium capitalize">
            {monthLabel}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {expenseCategories.map((cat) => {
              const existing = existingBudgets.find(
                (b) =>
                  b.categoryId === cat.id &&
                  b.month === month &&
                  b.year === year,
              );

              return (
                <div
                  key={cat.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <span className="text-lg w-6 text-center shrink-0">
                    {cat.icon || "📁"}
                  </span>
                  <Label className="flex-1 text-sm font-medium text-zinc-700 dark:text-zinc-300 min-w-0 truncate">
                    {cat.name}
                  </Label>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-zinc-400">R$</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={values[cat.id] || ""}
                      onChange={(e) => handleChange(cat.id, e.target.value)}
                      className="w-24 h-8 text-sm bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                    />
                    {existing && onDelete && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-rose-400 hover:text-rose-500 shrink-0"
                        onClick={() => onDelete(existing.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {expenseCategories.length === 0 && (
            <p className="text-sm text-center text-amber-600 py-4">
              Nenhuma categoria de despesa encontrada. Crie categorias primeiro.
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !hasAnyBudget}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Metas
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
