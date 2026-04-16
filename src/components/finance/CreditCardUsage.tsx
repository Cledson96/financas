"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CreditCard, ChevronDown } from "lucide-react";
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

function formatCurrency(value: number): string {
  return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

function CompactCardRow({
  card,
  isVisible,
  dimmed = false,
}: {
  card: {
    name: string;
    bankName?: string | null;
    balance: number;
    limit: number;
  };
  isVisible: boolean;
  dimmed?: boolean;
}) {
  const used = Math.abs(card.balance);
  const usagePercent =
    card.limit > 0 ? Math.min((used / card.limit) * 100, 100) : 0;

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
    <div
      className={cn(
        "space-y-1.5",
        dimmed && "opacity-50"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1 mr-2">
          <p
            className={cn(
              "text-sm font-medium truncate",
              dimmed
                ? "text-zinc-400 dark:text-zinc-500"
                : "text-zinc-900 dark:text-zinc-100"
            )}
          >
            {card.name}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p
            className={cn(
              "text-sm font-semibold tabular-nums",
              dimmed
                ? "text-zinc-400 dark:text-zinc-500"
                : "text-zinc-900 dark:text-zinc-100"
            )}
          >
            {isVisible ? formatCurrency(used) : "••••••"}
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 tabular-nums">
            de {isVisible ? formatCurrency(card.limit) : "••••••"}
          </p>
        </div>
      </div>
      {/* Only show progress bar for cards with actual usage */}
      {used > 0 && (
        <>
          <div className={cn("h-1.5 rounded-full", barBg)}>
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                barColor
              )}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Disponível:{" "}
            {isVisible
              ? formatCurrency(Math.max(card.limit - used, 0))
              : "••••••"}{" "}
            ({usagePercent.toFixed(0)}% usado)
          </p>
        </>
      )}
    </div>
  );
}

export default function CreditCardUsage({
  cards,
  isVisible = true,
}: CreditCardUsageProps) {
  const [expanded, setExpanded] = useState(false);

  if (cards.length === 0) return null;

  // Sort: cards with balance > 0 first, then by usage descending
  const sorted = [...cards].sort((a, b) => {
    const aUsed = Math.abs(a.balance);
    const bUsed = Math.abs(b.balance);
    if (aUsed > 0 && bUsed === 0) return -1;
    if (aUsed === 0 && bUsed > 0) return 1;
    return bUsed - aUsed;
  });

  const INITIAL_COUNT = 4;
  const visibleCards = sorted.slice(0, INITIAL_COUNT);
  const hiddenCards = sorted.slice(INITIAL_COUNT);
  const hasMore = hiddenCards.length > 0;

  // Count cards with actual usage
  const activeCards = sorted.filter((c) => Math.abs(c.balance) > 0).length;
  const inactiveCards = sorted.length - activeCards;

  return (
    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            <CreditCard className="w-5 h-5 text-indigo-500" />
            Cartões de Crédito
          </div>
          <span className="text-xs font-normal text-zinc-400 dark:text-zinc-500">
            {activeCards} ativo{activeCards !== 1 ? "s" : ""}
            {inactiveCards > 0 && ` · ${inactiveCards} sem uso`}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Visible cards */}
        {visibleCards.map((card) => (
          <CompactCardRow
            key={card.name}
            card={card}
            isVisible={isVisible}
            dimmed={Math.abs(card.balance) === 0}
          />
        ))}

        {/* Expandable section for remaining cards */}
        {hasMore && (
          <Collapsible open={expanded} onOpenChange={setExpanded}>
            <CollapsibleContent className="space-y-3">
              {hiddenCards.map((card) => (
                <CompactCardRow
                  key={card.name}
                  card={card}
                  isVisible={isVisible}
                  dimmed={Math.abs(card.balance) === 0}
                />
              ))}
            </CollapsibleContent>
            <CollapsibleTrigger asChild>
              <button
                className="flex items-center justify-center gap-1.5 w-full py-2 mt-1 text-xs font-medium text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    expanded && "rotate-180"
                  )}
                />
                {expanded
                  ? "Ver menos"
                  : `Ver todos (${sorted.length})`}
              </button>
            </CollapsibleTrigger>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}
