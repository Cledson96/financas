"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { subMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Users, Calendar } from "lucide-react";
import {
  getMonthNetWorth,
  getSharedTransactions,
} from "@/app/actions/couple-actions";
import { getFixedExpensesAction } from "@/app/actions/fixed-expense-actions";
import { toast } from "sonner";
import { CoupleMetrics } from "@/components/couple/CoupleMetrics";
import { FixedExpensesList } from "@/components/couple/FixedExpensesList";
import { SharedTransactionTable } from "@/components/couple/SharedTransactionTable";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { closeMonthAction } from "@/app/actions/monthly-balance-actions";

export default function CouplePage() {
  const [selectedMonth, setSelectedMonth] = useState("current");
  const [loading, setLoading] = useState(true);

  // Data States
  const [netWorth, setNetWorth] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [fixedExpenses, setFixedExpenses] = useState<any[]>([]);
  const [settleDialogOpen, setSettleDialogOpen] = useState(false);

  // Load Data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const date =
          selectedMonth === "current"
            ? new Date()
            : new Date(selectedMonth + "-01");
        const m = date.getMonth() + 1;
        const y = date.getFullYear();

        const [nwData, txData, fxData] = await Promise.all([
          getMonthNetWorth(m, y),
          getSharedTransactions(m, y),
          getFixedExpensesAction(),
        ]);

        setNetWorth(nwData);
        setTransactions(txData);
        setFixedExpenses(fxData);
      } catch (error) {
        console.error(error);
        toast.error("Erro ao carregar dados do casal");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedMonth]);

  const monthOptions = useMemo(() => {
    const options = [];
    for (let i = 0; i < 6; i++) {
      const date = subMonths(new Date(), i);
      options.push({
        value: i === 0 ? "current" : format(date, "yyyy-MM"),
        label: format(date, "MMMM yyyy", { locale: ptBR }),
      });
    }
    return options;
  }, []);

  const handleSettle = () => {
    if (!netWorth?.summary || netWorth.summary.amount === 0) {
      toast.info("Não há nada para acertar neste mês!");
      return;
    }
    setSettleDialogOpen(true);
  };

  const confirmSettle = async () => {
    if (!netWorth || !netWorth.summary || !netWorth.summary.payer) return;

    // Determine month/year from selectedMonth
    let m, y;
    if (selectedMonth === "current") {
      const d = new Date();
      m = d.getMonth() + 1;
      y = d.getFullYear();
    } else {
      const parts = selectedMonth.split("-");
      y = parseInt(parts[0]);
      m = parseInt(parts[1]);
    }

    const debtorId =
      netWorth.summary.payer === "p1" ? netWorth.p1.id : netWorth.p2.id;
    const creditorId =
      netWorth.summary.payer === "p1" ? netWorth.p2.id : netWorth.p1.id;
    const amount = netWorth.summary.amount;

    try {
      await closeMonthAction(m, y, debtorId, creditorId, amount);
      toast.success("Mês fechado com sucesso!");
      setSettleDialogOpen(false);
      // Determine if we should reload...? Ideally yes.
    } catch (error) {
      toast.error("Erro ao fechar mês");
    }
  };

  // Calculate total shared spending from the transactions list?
  // Or use the net worth data?
  // Using the raw transaction list sum might be more intuitive for "Total Spending"
  // but netWorth logic handles splits.
  // Let's sum up the 'amount' of all listed shared transactions for a rough "Total Volume" metric.
  const totalVolume = transactions.reduce(
    (acc, t) => acc + Number(t.amount),
    0,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-500" />
            Finanças do Casal
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Visão unificada das despesas compartilhadas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-zinc-500" />
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px] bg-white dark:bg-zinc-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-zinc-500">
          Carregando dados...
        </div>
      ) : (
        <>
          {/* Top Metrics */}
          <CoupleMetrics
            summary={netWorth?.summary || null}
            p1Name={netWorth?.p1?.name || "Parceiro 1"}
            p2Name={netWorth?.p2?.name || "Parceiro 2"}
            totalSharedRaw={totalVolume}
          />

          <div className="flex justify-end mb-4">
            <Button
              onClick={handleSettle}
              variant={netWorth?.summary?.amount > 0 ? "default" : "outline"}
              disabled={!netWorth?.summary || netWorth.summary.amount === 0}
            >
              Realizar Fechamento do Mês
            </Button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Main Content: Transactions Table */}
            <div className="xl:col-span-2 space-y-6">
              <SharedTransactionTable transactions={transactions} />
            </div>

            {/* Sidebar: Fixed Expenses */}
            <div className="xl:col-span-1">
              <FixedExpensesList expenses={fixedExpenses} />
            </div>
          </div>
        </>
      )}

      {/* Settle Dialog */}
      <AlertDialog open={settleDialogOpen} onOpenChange={setSettleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fechar Mês e Confirmar Dívida?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso criará um registro de fechamento para o mês selecionado.
              <br />
              <br />
              <strong>Valor Final:</strong> R${" "}
              {netWorth?.summary?.amount?.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSettle}>
              Confirmar Fechamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
