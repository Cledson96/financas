"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  User as UserIcon,
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Saldo de Acerto */}
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
                R${" "}
                {summary.amount.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
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
            <div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                R$ 0,00
              </div>
              <p className="text-xs text-green-600 mt-1">Tudo acertado!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quem Pagou Mais? (Simplificado) */}
      {/* Poderíamos calcular isso se tivéssemos os totais individuais, mas vamos focar no total geral do casal por enquanto */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-500 flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
            Total Compartilhado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            R${" "}
            {totalSharedRaw.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Gasto total do casal neste mês
          </p>
        </CardContent>
      </Card>

      {/* Previsão ou Outra Métrica */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-500 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-purple-500" />
            Parceiros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>{p1Name}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
              <span>{p2Name}</span>
            </div>
          </div>
          <p className="text-xs text-zinc-400 mt-2">Configuração atual ativa</p>
        </CardContent>
      </Card>
    </div>
  );
}
