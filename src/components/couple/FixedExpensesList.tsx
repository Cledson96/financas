"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, Circle } from "lucide-react";
// Define a compatible interface since serialized data has number amount
interface SerializedFixedExpense {
  id: string;
  description: string;
  amount: number | string; // Handle number from serialization or Decimal string
  dueDay: number;
  categoryId: string;
  splitType: "INDIVIDUAL" | "SHARED" | "SHARED_PROPORTIONAL";
  ownerId: string | null;
  active: boolean;
}

interface FixedExpensesListProps {
  expenses: SerializedFixedExpense[];
}

export function FixedExpensesList({ expenses }: FixedExpensesListProps) {
  // Filter for shared expenses only
  const sharedExpenses = expenses.filter(
    (e) =>
      e.active &&
      (e.splitType === "SHARED" || e.splitType === "SHARED_PROPORTIONAL"),
  );

  const totalFixed = sharedExpenses.reduce(
    (acc, curr) => acc + Number(curr.amount),
    0,
  );

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Gastos Fixos Mensais
          </CardTitle>
          <Badge variant="secondary" className="font-mono">
            R${" "}
            {totalFixed.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sharedExpenses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum gasto fixo compartilhado.
            </p>
          ) : (
            <div className="grid gap-3">
              {sharedExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center justify-center w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold text-xs">
                      <span>{expense.dueDay}</span>
                      <span className="text-[10px] uppercase">DIA</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {expense.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {expense.splitType === "SHARED"
                          ? "50/50"
                          : "Proporcional"}
                      </p>
                    </div>
                  </div>
                  <div className="font-semibold text-sm">
                    R${" "}
                    {Number(expense.amount).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
