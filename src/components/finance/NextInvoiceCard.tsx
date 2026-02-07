import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CreditCard, AlertTriangle, CalendarClock } from "lucide-react";

interface NextInvoiceCardProps {
  nextInvoice: {
    amount: number;
    daysUntilDue: number;
    bankName: string;
    dueDate: string | Date; // Service returns Date, but check generic compatibility
  };
}

export default function NextInvoiceCard({ nextInvoice }: NextInvoiceCardProps) {
  const isUrgent = nextInvoice.daysUntilDue <= 5;
  const isOverdue = nextInvoice.daysUntilDue < 0;

  let variantClass =
    "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800";
  let iconClass =
    "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400";
  let textClass = "text-zinc-900 dark:text-zinc-100";

  if (isOverdue) {
    variantClass =
      "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900";
    iconClass =
      "bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400";
    textClass = "text-rose-700 dark:text-rose-400";
  } else if (isUrgent) {
    variantClass =
      "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900";
    iconClass =
      "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400";
    textClass = "text-amber-700 dark:text-amber-400";
  }

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-lg",
        variantClass,
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Próxima Fatura
            </p>
            <p
              className={cn(
                "text-2xl md:text-3xl font-bold tracking-tight",
                textClass,
              )}
            >
              R${" "}
              {nextInvoice.amount.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </p>
            <div className="flex items-center gap-1 text-xs">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {nextInvoice.bankName}
              </span>
              <span className="text-zinc-400">•</span>
              <span
                className={cn(
                  "flex items-center gap-1 font-medium",
                  isOverdue
                    ? "text-rose-600"
                    : isUrgent
                      ? "text-amber-600"
                      : "text-zinc-500",
                )}
              >
                {isOverdue ? (
                  <>Venceu há {Math.abs(nextInvoice.daysUntilDue)} dias</>
                ) : nextInvoice.daysUntilDue === 0 ? (
                  <>Vence Hoje!</>
                ) : (
                  <>Vence em {nextInvoice.daysUntilDue} dias</>
                )}
              </span>
            </div>
          </div>
          <div className={cn("p-3 rounded-xl", iconClass)}>
            {isUrgent || isOverdue ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <CalendarClock className="w-5 h-5" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
