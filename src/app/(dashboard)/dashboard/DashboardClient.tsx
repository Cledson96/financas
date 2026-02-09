"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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
            isVisible={isVisible} // Usually count is not sensitive, but for consistency
          />
        </motion.div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 gap-6">
        <SettlementCard
          settlement={metrics.settlement}
          onSettle={handleSettle}
          isVisible={isVisible}
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item}>
          <CategoryPieChart
            data={categoryExpenses}
            title="Despesas por Categoria"
            isVisible={isVisible}
          />
        </motion.div>
        <motion.div variants={item}>
          <FairnessGraph data={metrics.fairness} isVisible={isVisible} />
        </motion.div>
      </div>

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
