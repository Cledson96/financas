import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  DollarSign,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionSummaryProps {
  transactions: any[];
  invoiceFilter: string;
}

export default function TransactionSummary({
  transactions,
  invoiceFilter,
}: TransactionSummaryProps) {
  // Calcular totais
  const { income, expense, balance, invoiceTotal } = transactions.reduce(
    (acc, t) => {
      const amount = Number(t.amount) || 0;

      if (t.type === "INCOME") {
        acc.income += amount;
        acc.balance += amount;
      } else if (t.type === "EXPENSE" || t.type === "PAYMENT") {
        acc.expense += amount;
        acc.balance -= amount;
      }
      // Se for TRANSFER, geralmente não afeta o balanço liquido global,
      // a menos que seja filtrado por conta. Mas vamos manter simples:
      // Balanço = Entradas - Saídas (Despesas + Pagamentos)

      // Se estiver filtrando por fatura, somar o total da fatura
      // Assumindo que o filtro de fatura seleciona apenas transações daquela fatura
      if (invoiceFilter !== "all" && t.invoiceId === invoiceFilter) {
        acc.invoiceTotal += amount;
      }

      return acc;
    },
    { income: 0, expense: 0, balance: 0, invoiceTotal: 0 },
  );

  // Se o filtro de fatura estiver ativo, o balanço perde um pouco o sentido
  // pois estamos vendo itens de uma fatura (que são despesas)
  // Mas vamos manter a consistência.

  const formatCurrency = (val: number) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 animate-in fade-in slide-in-from-top-4 duration-500">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Entradas</CardTitle>
          <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">
            {formatCurrency(income)}
          </div>
          <p className="text-xs text-muted-foreground">
            Receitas no período selecionado
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saídas</CardTitle>
          <ArrowDownCircle className="h-4 w-4 text-rose-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-500">
            {formatCurrency(expense)}
          </div>
          <p className="text-xs text-muted-foreground">Despesas e pagamentos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Balanço</CardTitle>
          <DollarSign className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "text-2xl font-bold",
              balance >= 0
                ? "text-blue-600 dark:text-blue-500"
                : "text-rose-600 dark:text-rose-500",
            )}
          >
            {formatCurrency(balance)}
          </div>
          <p className="text-xs text-muted-foreground">Entradas - Saídas</p>
        </CardContent>
      </Card>

      {invoiceFilter !== "all" && (
        <Card className="bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Fatura Selecionada
            </CardTitle>
            <CreditCard className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            {/* 
                Aqui calculamos o total das transações listadas. 
                Se o filtro de fatura traz os itens da fatura, isso deve bater com o total da fatura.
             */}
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {formatCurrency(expense)}{" "}
              {/* O total de despesas filtradas IS o total da fatura neste contexto */}
            </div>
            <p className="text-xs text-purple-600/80 dark:text-purple-400/80">
              Total nesta fatura
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
