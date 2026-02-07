"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Wallet,
  TrendingDown,
  CreditCard,
  AlertTriangle,
  Plus,
  Scale,
} from "lucide-react";
import KPICard from "@/components/finance/KPICard";
import CategoryPieChart from "@/components/finance/CategoryPieChart";
import ExpenseBarChart from "@/components/finance/ExpenseBarChart";
import TransactionModal from "@/components/finance/TransactionModal";
import { DashboardData } from "@/types/finance";

async function createTransaction(data: any) {
  const res = await fetch("/api/transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create transaction");
  return res.json();
}

interface DashboardClientProps {
  initialData: DashboardData;
}

export default function DashboardClient({ initialData }: DashboardClientProps) {
  const router = useRouter();
  const [showOnlyShared, setShowOnlyShared] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const {
    metrics,
    categoryExpenses,
    evolutionData,
    accounts,
    categories,
    users,
  } = initialData;

  const createTransactionMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      router.refresh();
      setModalOpen(false);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Dashboard
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Visão geral das suas finanças
          </p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Switch
              id="shared-toggle"
              checked={showOnlyShared}
              onCheckedChange={setShowOnlyShared}
            />
            <Label
              htmlFor="shared-toggle"
              className="text-sm text-zinc-600 dark:text-zinc-400"
            >
              Só Casal
            </Label>
          </div>
          <Button
            onClick={() => setModalOpen(true)}
            className="gap-2 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Transação</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Saldo Atual"
          value={`R$ ${metrics.totalBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          icon={Wallet}
          variant={metrics.totalBalance >= 0 ? "success" : "danger"}
        />
        <KPICard
          title="Gastos do Mês"
          value={`R$ ${metrics.currentMonthExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          icon={TrendingDown}
          variant="default"
        />
        <KPICard
          title="Faturas em Aberto"
          value={`R$ ${metrics.openInvoices.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          icon={CreditCard}
          variant="warning"
        />
        <KPICard
          title="Contas Atrasadas"
          value={String(metrics.overdueCount)}
          icon={AlertTriangle}
          variant={metrics.overdueCount > 0 ? "danger" : "default"}
          pulse={metrics.overdueCount > 0}
        />
      </div>

      {metrics.settlement.amount > 0 && (
        <div className="grid grid-cols-1 gap-4">
          <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Scale className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Acerto de Contas</h3>
                <p className="text-sm text-muted-foreground">
                  {metrics.settlement.debtorName} deve pagar para{" "}
                  {metrics.settlement.creditorName}
                </p>
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              R${" "}
              {metrics.settlement.amount.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPieChart
          data={categoryExpenses}
          title="Gastos por Categoria (Mês Atual)"
        />
        <ExpenseBarChart
          data={evolutionData}
          title="Evolução - Últimos 6 Meses"
        />
      </div>

      <TransactionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={(data: any) => createTransactionMutation.mutate(data)}
        categories={categories}
        accounts={accounts}
        members={users}
        isLoading={createTransactionMutation.isPending}
      />
    </div>
  );
}
