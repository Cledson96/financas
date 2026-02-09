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
import { format, parseISO } from "date-fns";
import { ArrowRightLeft } from "lucide-react";

interface SharedTransactionTableProps {
  transactions: any[];
}

export function SharedTransactionTable({
  transactions,
}: SharedTransactionTableProps) {
  return (
    <div className="rounded-md border bg-white dark:bg-zinc-900">
      <Table>
        <TableHeader>
          <TableRow>
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
              <TableCell colSpan={6} className="h-24 text-center">
                Nenhuma transação encontrada.
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">
                  {format(parseISO(t.purchaseDate), "dd/MM/yyyy")}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{t.description}</span>
                    {t.installments > 1 && (
                      <span className="text-xs text-muted-foreground">
                        Parcela {t.installment}/{t.totalInstallments}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{t.Category?.icon || "📦"}</span>
                    <span className="text-sm text-muted-foreground">
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
                <TableCell className="text-right font-medium">
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
  );
}
