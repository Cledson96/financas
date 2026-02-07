import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  Search,
  Download,
  ArrowUpDown,
} from "lucide-react";
import { format, parseISO, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const toNumber = (val: any) => Number(val) || 0;

interface TransactionTableProps {
  transactions: any[];
  categories: any[];
  onEdit?: (t: any) => void;
  onDelete?: (t: any) => void;
  onDuplicate?: (t: any) => void;
  onExport?: (data: any[]) => void;
}

export default function TransactionTable({
  transactions = [],
  categories = [],
  onEdit,
  onDelete,
  onDuplicate,
  onExport,
}: TransactionTableProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortField, setSortField] = useState("purchaseDate");
  const [sortOrder, setSortOrder] = useState("desc");

  const isOverdue = (transaction: any) => {
    if (transaction.status === "PAID" || transaction.settled) return false;
    if (!transaction.paymentDate) return false;
    // Check overdue only on unchecked/unsettled transactions
    return isBefore(parseISO(transaction.paymentDate), new Date());
  };

  const filteredTransactions = transactions
    .filter((t) => {
      const matchSearch = t.description
        ?.toLowerCase()
        .includes(search.toLowerCase());
      const matchCategory =
        categoryFilter === "all" || t.categoryId === categoryFilter;
      const matchType = typeFilter === "all" || t.type === typeFilter;
      return matchSearch && matchCategory && matchType;
    })
    .sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Fix numeric sort for amount
      if (sortField === "amount") {
        aVal = toNumber(aVal);
        bVal = toNumber(bVal);
      }

      if (sortOrder === "asc") return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handleExport = () => {
    onExport?.(filteredTransactions);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Buscar transação..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px] bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px] bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="EXPENSE">Despesas</SelectItem>
              <SelectItem value="INCOME">Receitas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" />
          Exportar Excel
        </Button>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
              <TableHead
                className="cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100"
                onClick={() => toggleSort("purchaseDate")}
              >
                <span className="flex items-center gap-1">
                  Data
                  <ArrowUpDown className="h-3 w-3" />
                </span>
              </TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Conta</TableHead>
              <TableHead
                className="cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100"
                onClick={() => toggleSort("amount")}
              >
                <span className="flex items-center gap-1">
                  Valor
                  <ArrowUpDown className="h-3 w-3" />
                </span>
              </TableHead>
              <TableHead>Quem Pagou</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-zinc-500"
                >
                  Nenhuma transação encontrada
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction) => {
                // Use safe optional chaining for potential relations
                const categoryName =
                  transaction.Category?.name ||
                  transaction.categoryName ||
                  "Geral";
                const accountName =
                  transaction.Account?.name ||
                  transaction.accountName ||
                  "Conta";
                // Payer relation: User_Transaction_payerIdToUser or payerName fallback
                const payerName =
                  transaction.User_Transaction_payerIdToUser?.name ||
                  transaction.payerName ||
                  "Desconhecido";

                const overdue = isOverdue(transaction);
                const isPaid =
                  transaction.settled || transaction.status === "PAID";

                return (
                  <TableRow
                    key={transaction.id}
                    className={cn(
                      "transition-colors",
                      overdue &&
                        "bg-rose-50 dark:bg-rose-950/20 border-l-2 border-l-rose-500",
                    )}
                  >
                    <TableCell className="font-medium text-zinc-600 dark:text-zinc-400">
                      {transaction.purchaseDate &&
                        format(parseISO(transaction.purchaseDate), "dd/MM/yy", {
                          locale: ptBR,
                        })}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          {transaction.description}
                        </span>
                        {transaction.splitType === "SHARED" && (
                          <span className="text-xs text-blue-500">Casal</span>
                        )}
                        {transaction.splitType === "INDIVIDUAL" && (
                          <span className="text-xs text-zinc-400">
                            Individual
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1 font-normal">
                        {categoryName}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-zinc-600 dark:text-zinc-400">
                      {accountName}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "font-semibold",
                          transaction.type === "EXPENSE"
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-emerald-600 dark:text-emerald-400",
                        )}
                      >
                        {transaction.type === "EXPENSE" ? "-" : "+"}
                        R${" "}
                        {toNumber(transaction.amount).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </TableCell>
                    <TableCell className="text-zinc-600 dark:text-zinc-400">
                      {payerName}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          overdue
                            ? "destructive"
                            : isPaid
                              ? "default"
                              : "secondary"
                        }
                        className={cn(
                          isPaid &&
                            "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                        )}
                      >
                        {overdue ? "Atrasado" : isPaid ? "Pago" : "Pendente"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => onEdit?.(transaction)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDuplicate?.(transaction)}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDelete?.(transaction)}
                            className="text-rose-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-zinc-500 dark:text-zinc-400">
        {filteredTransactions.length} transação(ões) encontrada(s)
      </div>
    </div>
  );
}
