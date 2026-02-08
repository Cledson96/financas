import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

interface InvoiceSheetProps {
  invoiceId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function InvoiceSheet({
  invoiceId,
  open,
  onOpenChange,
}: InvoiceSheetProps) {
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["invoice-transactions", invoiceId],
    queryFn: async () => {
      if (!invoiceId) return [];
      // Assuming we have an endpoint to get transactions by invoice
      // OR we filter from all transactions (but that requires fetching all).
      // Ideally, /api/transactions?invoiceId=X
      // But for now, let's fetch all (cached) and filter, OR assume the page logic handles it?
      // No, Sheet needs to be self-contained or receive data.
      // Let's use the same fetch logic as page but with query param if supported,
      // or just fetch all and filter client side if API doesn't support filter.
      // Given the implementation plan says "Busca transações daquela fatura", let's try to query with filter.
      // If endpoint supports ?invoiceId=..., great. If not, we fetch all.
      // Let's assume we can fetch all and filter since we likely have them cached.
      // Actually, let's create a specific fetcher for this.
      const res = await fetch("/api/transactions");
      if (!res.ok) throw new Error("Failed to fetch transactions");
      const all: any[] = await res.json();
      return all.filter((t: any) => t.invoiceId === invoiceId);
    },
    enabled: !!invoiceId && open,
  });

  const total = transactions.reduce(
    (acc: number, t: any) => acc + Number(t.amount),
    0,
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] bg-white dark:bg-zinc-900 border-l-zinc-200 dark:border-l-zinc-800">
        <SheetHeader>
          <SheetTitle>Detalhes da Fatura</SheetTitle>
          <SheetDescription>
            Transações vinculadas a esta fatura.
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
              <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                Total da Fatura
              </span>
              <span className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                {total.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </div>

            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <p className="text-center text-zinc-500 py-10">
                    Nenhuma transação encontrada nesta fatura.
                  </p>
                ) : (
                  transactions.map((t: any) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-800"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                          {t.description}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {format(parseISO(t.purchaseDate), "dd/MM/yyyy", {
                            locale: ptBR,
                          })}{" "}
                          • {t.Category?.name || "Sem categoria"}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-semibold text-sm text-zinc-700 dark:text-zinc-300">
                          {Number(t.amount).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] h-5 px-1.5 font-normal"
                        >
                          {t.User_Transaction_payerIdToUser?.name ||
                            "Desconhecido"}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
