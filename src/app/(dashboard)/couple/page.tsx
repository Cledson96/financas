"use client";

import { useState, useMemo } from "react";
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
import CoupleSettlement from "@/components/finance/CoupleSettlement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar } from "lucide-react";

async function fetchData(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export default function CouplePage() {
  const [selectedMonth, setSelectedMonth] = useState("current");

  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => fetchData("/api/transactions"),
  });

  const { data: members = [] } = useQuery({
    queryKey: ["members"],
    queryFn: () => fetchData("/api/family-members"),
  });

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

    return transactions.filter((t: any) => {
      const date = parseISO(t.purchaseDate);
      return date >= start && date <= end && t.splitType === "SHARED";
    });
  }, [transactions, selectedMonth]);

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
        {/* Settlement Card */}
        <CoupleSettlement
          transactions={filteredTransactions}
          members={members}
        />

        {/* Shared Transactions List */}
        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Transações Compartilhadas
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
    </div>
  );
}
