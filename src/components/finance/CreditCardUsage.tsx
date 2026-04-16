import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreditCardUsageProps {
  cards: {
    name: string;
    bankName?: string | null;
    balance: number;
    limit: number;
  }[];
  isVisible?: boolean;
}

export default function CreditCardUsage({
  cards,
  isVisible = true,
}: CreditCardUsageProps) {
  if (cards.length === 0) return null;

  return (
    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          <CreditCard className="w-5 h-5 text-indigo-500" />
          Cartões de Crédito
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {cards.map((card) => {
          const used = Math.abs(card.balance);
          const usagePercent =
            card.limit > 0 ? Math.min((used / card.limit) * 100, 100) : 0;
          const available = Math.max(card.limit - used, 0);

          let barColor = "bg-emerald-500";
          let barBg = "bg-emerald-100 dark:bg-emerald-900/30";
          if (usagePercent > 80) {
            barColor = "bg-rose-500";
            barBg = "bg-rose-100 dark:bg-rose-900/30";
          } else if (usagePercent > 50) {
            barColor = "bg-amber-500";
            barBg = "bg-amber-100 dark:bg-amber-900/30";
          }

          return (
            <div key={card.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {card.name}
                  </p>
                  {card.bankName && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {card.bankName}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                    {isVisible
                      ? `R$ ${used.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                      : "••••••"}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
                    de{" "}
                    {isVisible
                      ? `R$ ${card.limit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                      : "••••••"}
                  </p>
                </div>
              </div>
              <div className={cn("h-2 rounded-full", barBg)}>
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    barColor,
                  )}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Disponível:{" "}
                {isVisible
                  ? `R$ ${available.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                  : "••••••"}{" "}
                ({usagePercent.toFixed(0)}% usado)
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
