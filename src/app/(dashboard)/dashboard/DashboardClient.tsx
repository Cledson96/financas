"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Wallet,
  TrendingDown,
  CreditCard,
  AlertTriangle,
  Plus,
  Scale,
  Calendar,
  Filter,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import KPICard from "@/components/finance/KPICard";
import CategoryPieChart from "@/components/finance/CategoryPieChart";
import ExpenseBarChart from "@/components/finance/ExpenseBarChart";
import TransactionModal from "@/components/finance/TransactionModal";
import SettlementCard from "@/components/finance/SettlementCard";
import { MonthSelector } from "@/components/finance/MonthSelector";
import FairnessGraph from "@/components/finance/FairnessGraph";
import NextInvoiceCard from "@/components/finance/NextInvoiceCard";
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
  const searchParams = useSearchParams();

  const [modalOpen, setModalOpen] = useState(false);
  const [prefilledData, setPrefilledData] = useState<any>(null);

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

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || !value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`?${params.toString()}`);
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
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Visão Geral
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg">
            Gerencie suas finanças com precisão.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm w-full sm:w-auto overflow-x-auto">
            <MonthSelector />
            <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

            {/* Scope Filter */}
            <Tabs
              value={filterScope || "ALL"}
              onValueChange={(val) => updateFilters("scope", val)}
              className="w-auto"
            >
              <TabsList className="bg-zinc-100 dark:bg-zinc-800 h-7">
                <TabsTrigger value="ALL" className="text-xs px-3">
                  Topics
                </TabsTrigger>
                <TabsTrigger value="SHARED" className="text-xs px-3">
                  Casal
                </TabsTrigger>
                <TabsTrigger value="INDIVIDUAL" className="text-xs px-3">
                  Meus
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

            {/* User Filter */}
            <Select
              value={filterUser || "all"}
              onValueChange={(val) => updateFilters("userId", val)}
            >
              <SelectTrigger className="w-[130px] border-none shadow-none bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800 focus:ring-0 h-7 text-xs">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-zinc-500" />
                  <SelectValue placeholder="Usuário" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
          />
        </motion.div>
        <motion.div variants={item}>
          <KPICard
            title="Gastos do Mês"
            value={`R$ ${metrics.currentMonthExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            icon={TrendingDown}
            variant="default"
          />
        </motion.div>

        <motion.div variants={item}>
          {metrics.nextInvoice ? (
            <NextInvoiceCard nextInvoice={metrics.nextInvoice} />
          ) : (
            <KPICard
              title="Faturas em Aberto"
              value={`R$ ${metrics.openInvoices.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}`}
              icon={CreditCard}
              variant="warning"
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
          />
        </motion.div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 gap-6">
        <SettlementCard
          settlement={metrics.settlement}
          onSettle={handleSettle}
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item}>
          <CategoryPieChart
            data={categoryExpenses}
            title="Despesas por Categoria"
          />
        </motion.div>
        <motion.div variants={item}>
          <FairnessGraph data={metrics.fairness} />
        </motion.div>
      </div>

      <motion.div variants={item} className="grid grid-cols-1 gap-6">
        <ExpenseBarChart data={evolutionData} title="Evolução Mensal" />
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
