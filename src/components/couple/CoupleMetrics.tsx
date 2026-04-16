"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowUpRight,
  Wallet,
  User as UserIcon,
  CheckCircle2,
} from "lucide-react";

interface CoupleMetricsProps {
  summary: {
    payer: "p1" | "p2" | null;
    amount: number;
  } | null;
  p1Name: string;
  p2Name: string;
  totalSharedRaw: number; // Total spent in shared transactions
}

export function CoupleMetrics({
  summary,
  p1Name,
  p2Name,
  totalSharedRaw,
}: CoupleMetricsProps) {
  const payerName = summary?.payer === "p1" ? p1Name : p2Name;
  const receiverName = summary?.payer === "p1" ? p2Name : p1Name;

  const eachShare = totalSharedRaw / 2;
  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* ── Saldo de Acerto ── */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border-blue-200 dark:border-blue-900">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Saldo de Acerto
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summary && summary.amount > 0 ? (
            <div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                R$ {fmt(summary.amount)}
              </div>
              <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                <span className="font-medium text-blue-600">{payerName}</span>
                deve pagar para
                <span className="font-medium text-indigo-600">
                  {receiverName}
                </span>
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-3">
              <CheckCircle2 className="w-8 h-8 text-green-500 mb-1" />
              <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                R$ 0,00
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                Tudo acertado! Nenhum saldo pendente.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Total Compartilhado (emerald gradient) ── */}
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border-emerald-200 dark:border-emerald-900">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4" />
            Total Compartilhado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            R$ {fmt(totalSharedRaw)}
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Gasto total do casal neste mês
          </p>
        </CardContent>
      </Card>

      {/* ── Divisão 50/50 por Parceiro ── */}
      <Card className="border-purple-200 dark:border-purple-900">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-purple-500" />
            Divisão Individual (50/50)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* Partner 1 */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {p1Name}
                </span>
              </div>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                R$ {fmt(eachShare)}
              </span>
            </div>

            {/* Partner 2 */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {p2Name}
                </span>
              </div>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                R$ {fmt(eachShare)}
              </span>
            </div>

            {/* Visual split bar */}
            <div className="pt-1">
              <div className="h-2 w-full rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex">
                <div
                  className="h-full bg-blue-500 rounded-l-full"
                  style={{ width: "50%" }}
                />
                <div
                  className="h-full bg-indigo-500 rounded-r-full"
                  style={{ width: "50%" }}
                />
              </div>
              <p className="text-[10px] text-zinc-400 mt-1 text-center">
                Divisão equalitária
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
