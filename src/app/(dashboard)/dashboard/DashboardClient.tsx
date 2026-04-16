"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Wallet,
  TrendingDown,
  CreditCard,
  AlertTriangle,
  Plus,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion } from "framer-motion";
import KPICard from "@/components/finance/KPICard";
import CategoryPieChart from "@/components/finance/CategoryPieChart";
import ExpenseBarChart from "@/components/finance/ExpenseBarChart";
import TransactionModal from "@/components/finance/TransactionModal";
import SettlementCard from "@/components/finance/SettlementCard";
import FairnessGraph from "@/components/finance/FairnessGraph";
import NextInvoiceCard from "@/components/finance/NextInvoiceCard";
import MonthlySummaryCard from "@/components/finance/MonthlySummaryCard";
import CreditCardUsage from "@/components/finance/CreditCardUsage";
import { DashboardData } from "@/types/finance";
import { DashboardFilters } from "@/components/finance/DashboardFilters";

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
  filterUser?: string;
  filterScope?: "ALL" | "SHARED" | "INDIVIDUAL";
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardClient({
  initialData,
  filterUser,
  filterScope,
}: DashboardClientProps) {
  const router = useRouter();

  const [modalOpen, setModalOpen] = useState(false);
  const [prefilledData, setPrefilledData] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(true);

  // Load visibility preference
  useEffect(() => {
    const saved = localStorage.getItem("dashboard-visibility");
    if (saved !== null) {
      setIsVisible(saved === "true");
    }
  }, []);

  const toggleVisibility = () => {
    const newValue = !isVisible;
    setIsVisible(newValue);
    localStorage.setItem("dashboard-visibility", String(newValue));
  };

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
      setPrefilledData(null);
    },
  });

  const handleSettle = () => {
    const debtor = users.find((u) => u.name === metrics.settlement.debtorName);

    setPrefilledData({
      type: "TRANSFER",
      amount: metrics.settlement.total,
      description: "Acerto de Contas",
      payerId: debtor?.id || "",
      purchaseDate: new Date(),
    });
    setModalOpen(true);
  };

  const handleOpenModal = () => {
    setPrefilledData(null);
    setModalOpen(true);
  };

  // Credit card accounts for usage display
  const creditCards = accounts
    .filter((a) => a.type === "CREDIT_CARD" && a.limit && a.limit > 0)
    .map((a) => ({
      name: a.name,
      bankName: a.bankName,
      balance: a.balance,
      limit: a.limit || 0,
    }));

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-8"
    >
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Visão Geral
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleVisibility}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              {isVisible ? (
                <Eye className="h-5 w-5" />
              ) : (
                <EyeOff className="h-5 w-5" />
              )}
            </Button>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg">
            Gerencie suas finanças com precisão.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <DashboardFilters
            filterScope={filterScope}
            filterUser={filterUser}
            users={users}
          />

          <Button
            onClick={handleOpenModal}
            className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 rounded-lg h-9 px-4 text-xs font-medium"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Nova Transação</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <motion.div
        variants={container}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={item}>
          <KPICard
            title="Saldo Atual"
            value={`R$ ${metrics.totalBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            icon={Wallet}
            variant={metrics.totalBalance >= 0 ? "success" : "danger"}
            isVisible={isVisible}
          />
        </motion.div>
        <motion.div variants={item}>
          <KPICard
            title="Gastos do Mês"
            value={`R$ ${metrics.currentMonthExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            icon={TrendingDown}
            variant="default"
            isVisible={isVisible}
          />
        </motion.div>

        <motion.div variants={item}>
          {metrics.nextInvoice ? (
            <NextInvoiceCard
              nextInvoice={metrics.nextInvoice}
              isVisible={isVisible}
            />
          ) : (
            <KPICard
              title="Faturas em Aberto"
              value={`R$ ${metrics.openInvoices.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}`}
              icon={CreditCard}
              variant="warning"
              isVisible={isVisible}
            />
          )}
        </motion.div>

        <motion.div variants={item}>
          <KPICard
            title="Contas Atrasadas"
            value={String(metrics.overdueCount)}
            icon={AlertTriangle}
            variant={metrics.overdueCount > 0 ? "danger" : "default"}
            pulse={metrics.overdueCount > 0}
            isVisible={isVisible}
          />
        </motion.div>
      </motion.div>

      {/* Monthly Summary + Credit Card Usage Row */}
      <motion.div
        variants={container}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <motion.div variants={item}>
          <MonthlySummaryCard
            income={metrics.currentMonthIncome}
            expenses={metrics.currentMonthExpenses}
            balance={metrics.monthBalance}
            isVisible={isVisible}
          />
        </motion.div>
        {creditCards.length > 0 && (
          <motion.div variants={item}>
            <CreditCardUsage cards={creditCards} isVisible={isVisible} />
          </motion.div>
        )}
      </motion.div>

      {/* Settlement Card (only if shared expenses exist) */}
      {metrics.hasSharedExpenses && (
        <motion.div variants={item} className="grid grid-cols-1 gap-6">
          <SettlementCard
            settlement={metrics.settlement}
            onSettle={handleSettle}
            isVisible={isVisible}
          />
        </motion.div>
      )}

      {/* Charts Row: Pie + Fairness */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item}>
          <CategoryPieChart
            data={categoryExpenses}
            title="Despesas por Categoria"
            isVisible={isVisible}
          />
        </motion.div>
        {metrics.hasSharedExpenses ? (
          <motion.div variants={item}>
            <FairnessGraph data={metrics.fairness} isVisible={isVisible} />
          </motion.div>
        ) : (
          <motion.div variants={item}>
            <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-2xl h-full">
              <CardContent className="flex flex-col items-center justify-center h-[380px] text-center p-6">
                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                  <CreditCard className="w-6 h-6 text-zinc-400" />
                </div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Sem despesas compartilhadas
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                  A justiça financeira aparece quando há despesas do casal neste mês.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Evolution Bar Chart */}
      <motion.div variants={item} className="grid grid-cols-1 gap-6">
        <ExpenseBarChart
          data={evolutionData}
          title="Evolução Mensal"
          isVisible={isVisible}
        />
      </motion.div>

      <TransactionModal
        open={modalOpen}
        editData={prefilledData}
        onOpenChange={setModalOpen}
        onSubmit={(data: any) => createTransactionMutation.mutate(data)}
        categories={categories}
        accounts={accounts}
        members={users}
        isLoading={createTransactionMutation.isPending}
      />
    </motion.div>
  );
}
