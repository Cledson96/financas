"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  parseISO,
  format,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import SettlementCard from "@/components/finance/SettlementCard"; // Assuming we use this or create wrapper
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import { Users, Calendar } from "lucide-react";
import { getMonthNetWorth } from "@/app/actions/couple-actions";
import { closeMonthAction } from "@/app/actions/monthly-balance-actions";
import { toast } from "sonner";
import { SettlementData } from "@/types/finance";
// Note: SettlementData needs to be compatible or we redefine local interface

async function fetchData(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export default function CouplePage() {
  const [selectedMonth, setSelectedMonth] = useState("current");
  const [netWorth, setNetWorth] = useState<any>(null);
  const [loadingNetWorth, setLoadingNetWorth] = useState(false);
  const [settleDialogOpen, setSettleDialogOpen] = useState(false);

  // We still need transactions for the list
  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => fetchData("/api/transactions"),
  });

  const { data: members = [] } = useQuery({
    queryKey: ["members"],
    queryFn: () => fetchData("/api/family-members"),
  });

  useEffect(() => {
    async function loadNetWorth() {
      setLoadingNetWorth(true);
      try {
        const date =
          selectedMonth === "current"
            ? new Date()
            : new Date(selectedMonth + "-01");
        const m = date.getMonth() + 1;
        const y = date.getFullYear();
        const data = await getMonthNetWorth(m, y);
        setNetWorth(data);
      } catch (error) {
        console.error(error);
        toast.error("Erro ao calcular saldo do casal");
      } finally {
        setLoadingNetWorth(false);
      }
    }
    loadNetWorth();
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

  const filteredTransactions = useMemo(() => {
    let start, end;

    if (selectedMonth === "current") {
      start = startOfMonth(new Date());
      end = endOfMonth(new Date());
    } else {
      const [year, month] = selectedMonth.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      start = startOfMonth(date);
      end = endOfMonth(date);
    }

    // Filter logic: show SHARED, TRANSFER, and INDIVIDUAL (cross)
    // Actually just show all relevant transactions for transparency?
    // Let's filter to meaningful ones: SHARED, SHARED_PROPORTIONAL, INDIVIDUAL (if payer != owner), TRANSFER
    return transactions.filter((t: any) => {
      const date = parseISO(t.purchaseDate);
      if (!(date >= start && date <= end)) return false;

      if (t.type === "TRANSFER") return true;
      if (t.splitType === "SHARED" || t.splitType === "SHARED_PROPORTIONAL")
        return true;
      if (t.splitType === "INDIVIDUAL" && t.payerId !== t.ownerId) return true;

      return false;
    });
  }, [transactions, selectedMonth]);

  // Adapter for SettlementCard
  const settlementData: SettlementData | null = useMemo(() => {
    if (!netWorth || !netWorth.summary) return null;

    return {
      total: netWorth.summary.amount,
      debtorName:
        netWorth.summary.payer === "p1" ? netWorth.p1.name : netWorth.p2.name,
      creditorName:
        netWorth.summary.payer === "p1" ? netWorth.p2.name : netWorth.p1.name,
      breakdown: {
        sharedFiftyFifty: Math.abs(netWorth.breakdown.sharedFiftyFifty),
        sharedProportional: Math.abs(netWorth.breakdown.sharedProportional),
        individualPaidByOther: Math.abs(netWorth.breakdown.individual),
      },
    };
  }, [netWorth]);

  const handleSettle = () => {
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
      // Refresh data ideally
    } catch (error) {
      toast.error("Erro ao fechar mês");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-500" />
            Divisão do Casal
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Acompanhe e acerte as contas compartilhadas
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settlement Card - Only show if we have data */}
        {loadingNetWorth ? (
          <Card>
            <CardContent className="p-6">Calculando...</CardContent>
          </Card>
        ) : settlementData ? (
          <SettlementCard settlement={settlementData} onSettle={handleSettle} />
        ) : (
          <Card>
            <CardContent className="p-6">
              Nenhum dado para o período.
            </CardContent>
          </Card>
        )}

        {/* Shared Transactions List */}
        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Transações do Casal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Quem Pagou</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-zinc-500"
                      >
                        Nenhuma transação compartilhada no período
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((t: any) => (
                      <TableRow key={t.id}>
                        <TableCell className="text-zinc-500">
                          {format(parseISO(t.purchaseDate), "dd/MM")}
                        </TableCell>
                        <TableCell className="font-medium">
                          {t.description}
                          <div className="text-xs text-muted-foreground">
                            {t.type === "TRANSFER"
                              ? "Transferência"
                              : t.splitType}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {t.payer?.name || "Não informado"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-rose-600">
                          R${" "}
                          {t.amount?.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      <AlertDialog open={settleDialogOpen} onOpenChange={setSettleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fechar Mês e Confirmar Dívida?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso criará um registro de fechamento para o mês selecionado. O
              saldo será registrado e o mês seguinte iniciará zerado (se a
              lógica de histórico suportar).
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
