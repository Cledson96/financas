"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { ArrowRightLeft, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SharedTransactionTableProps {
  transactions: any[];
}

export function SharedTransactionTable({
  transactions,
}: SharedTransactionTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = transactions.slice(startIndex, startIndex + itemsPerPage);

  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50">
              <TableHead className="w-[100px]">Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Quem Pagou</TableHead>
              <TableHead>Divisão</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-16">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="h-14 w-14 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
                      <Heart className="h-7 w-7 text-rose-400" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-zinc-700 dark:text-zinc-300">
                        Nenhuma despesa compartilhada
                      </p>
                      <p className="text-sm text-zinc-400 mt-1 max-w-[300px]">
                        Transações marcadas como &quot;Casal (50/50)&quot; ou &quot;Proporcional&quot;
                        aparecerão aqui.
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((t) => (
                <TableRow
                  key={t.id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                >
                  <TableCell className="font-medium text-sm">
                    {format(parseISO(t.purchaseDate), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {t.description}
                      </span>
                      {t.installments > 1 && (
                        <span className="text-xs text-zinc-400">
                          Parcela {t.installment}/{t.totalInstallments}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{t.Category?.icon || "📦"}</span>
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        {t.Category?.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {t.User_Transaction_payerIdToUser?.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {t.type === "TRANSFER" ? (
                      <Badge
                        variant="secondary"
                        className="flex w-fit items-center gap-1"
                      >
                        <ArrowRightLeft className="w-3 h-3" /> Transferência
                      </Badge>
                    ) : (
                      <Badge
                        variant={
                          t.splitType === "SHARED" ? "default" : "secondary"
                        }
                      >
                        {t.splitType === "SHARED"
                          ? "50/50"
                          : t.splitType === "SHARED_PROPORTIONAL"
                            ? "Proporcional"
                            : "Individual (Cruzado)"}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    R${" "}
                    {Number(t.amount).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                </TableRow>
              ))
            )}
            </TableBody>
        </Table>
        </div>
      </div>

      {transactions.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <span>{transactions.length} transações</span>
            <span className="text-zinc-300">|</span>
            <span>Mostrar</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(v) => {
                setItemsPerPage(Number(v));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-7 w-[60px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-zinc-500">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
