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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Trash2,
  Pencil,
  Copy,
  ArrowUpDown,
  MoreHorizontal,
  User,
  Scale,
  PieChart,
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
} from "lucide-react";
import { format, parseISO, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const toNumber = (val: any) => Number(val) || 0;

interface TransactionTableProps {
  transactions: any[];
  categories: any[];
  members?: any[];
  accounts?: any[];
  onEdit?: (t: any) => void;
  onDelete?: (t: any) => void;
  onDuplicate?: (t: any) => void;
  onExport?: (data: any[]) => void;
  onBulkDelete?: (ids: string[]) => void;
  onBulkCategoryChange?: (ids: string[]) => void;
}

export default function TransactionTable({
  transactions = [],
  categories = [],
  members = [],
  accounts = [],
  onEdit,
  onDelete,
  onDuplicate,
  onExport,
  onBulkDelete,
  onBulkCategoryChange,
  onViewInvoice,
}: TransactionTableProps & {
  onViewInvoice?: (invoiceId: string) => void;
}) {
  const [sortField, setSortField] = useState("purchaseDate");
  const [sortOrder, setSortOrder] = useState("desc");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Toggle selection
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredTransactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTransactions.map((t) => t.id)));
    }
  };

  const isOverdue = (transaction: any) => {
    if (transaction.type === "INCOME") return false;
    if (
      transaction.status === "PAID" ||
      transaction.settled ||
      transaction.isReconciled
    )
      return false;
    if (transaction.Account?.type === "CREDIT_CARD") return false;

    if (!transaction.paymentDate) return false;
    return isBefore(parseISO(transaction.paymentDate), new Date());
  };

  const filteredTransactions = [...transactions].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === "amount") {
      aVal = toNumber(aVal);
      bVal = toNumber(bVal);
    }

    if (sortOrder === "asc") return aVal > bVal ? 1 : -1;
    return aVal < bVal ? 1 : -1;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    endIndex,
  );

  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
  }

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-4">
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-4 bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800 animate-in slide-in-from-top-2">
          <span className="text-sm font-medium ml-2 text-emerald-800 dark:text-emerald-300">
            {selectedIds.size} selecionado(s)
          </span>
          <div className="h-4 w-px bg-emerald-200 dark:bg-emerald-700" />
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-emerald-200 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-800"
          >
            <Pencil className="h-4 w-4" /> Mudar Categoria
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBulkDelete?.(Array.from(selectedIds))}
            className="gap-2 text-rose-600 hover:text-rose-700 border-rose-200 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-900/20"
          >
            <Trash2 className="h-4 w-4" /> Excluir
          </Button>
        </div>
      )}

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-950 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/80">
              <TableHead className="w-[40px] pl-4">
                <Checkbox
                  checked={
                    filteredTransactions.length > 0 &&
                    selectedIds.size === filteredTransactions.length
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead
                className="w-[100px] hover:text-emerald-600 cursor-pointer transition-colors"
                onClick={() => toggleSort("purchaseDate")}
              >
                <span className="flex items-center gap-1">
                  Data <ArrowUpDown className="h-3 w-3" />
                </span>
              </TableHead>
              <TableHead className="w-[200px]">Descrição</TableHead>
              <TableHead className="w-[140px]">Categoria</TableHead>
              <TableHead>Conta / Pagamento</TableHead>
              <TableHead
                className="text-right hover:text-emerald-600 cursor-pointer transition-colors"
                onClick={() => toggleSort("amount")}
              >
                <span className="flex items-center justify-end gap-1">
                  Valor <ArrowUpDown className="h-3 w-3" />
                </span>
              </TableHead>
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-12 text-zinc-500"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                      <Search className="h-6 w-6 text-zinc-400" />
                    </div>
                    <p className="font-medium">Nenhuma transação encontrada</p>
                    <p className="text-sm text-zinc-400">
                      Tente ajustar os filtros ou buscar por outro termo.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((transaction) => {
                const category = categories?.find(
                  (c) => c.id === transaction.categoryId,
                );
                const categoryIcon = category?.icon || "📦";
                const categoryName = category?.name || "Geral";

                const accountName = transaction.Account?.name || "Conta";

                const payer = members?.find(
                  (m) => m.id === transaction.payerId,
                );
                const payerName = payer?.name || "Desconhecido";

                const owner = members?.find((m) => m.id === transaction.userId);

                // Determine display based on split type
                let splitLabel = "";
                let SplitIcon = User;
                let splitColor = "text-zinc-500";

                if (transaction.splitType === "SHARED") {
                  splitLabel = "Casal (50/50)";
                  SplitIcon = Scale;
                  splitColor = "text-blue-500";
                } else if (transaction.splitType === "SHARED_PROPORTIONAL") {
                  splitLabel = `Prop. (${(transaction.splitShare * 100).toFixed(0)}%)`;
                  SplitIcon = PieChart;
                  splitColor = "text-purple-500";
                }

                const overdue = isOverdue(transaction);
                const isPaid =
                  transaction.settled ||
                  transaction.status === "PAID" ||
                  transaction.isReconciled;
                const isIncome = transaction.type === "INCOME";

                return (
                  <TableRow
                    key={transaction.id}
                    className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                  >
                    <TableCell className="pl-4">
                      <Checkbox
                        checked={selectedIds.has(transaction.id)}
                        onCheckedChange={() => toggleSelection(transaction.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm text-zinc-700 dark:text-zinc-300">
                          {transaction.purchaseDate &&
                            format(
                              parseISO(transaction.purchaseDate),
                              "dd MMM, yy",
                              { locale: ptBR },
                            )}
                        </span>
                        {transaction.paymentDate &&
                          transaction.paymentDate !==
                            transaction.purchaseDate && (
                            <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                              Ven:{" "}
                              {format(
                                parseISO(transaction.paymentDate),
                                "dd/MM",
                              )}
                            </span>
                          )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-zinc-900 dark:text-zinc-100 line-clamp-1">
                          {transaction.description}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          {owner && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Avatar className="h-4 w-4">
                                    <AvatarImage src={owner.image} />
                                    <AvatarFallback className="text-[9px]">
                                      {getInitials(owner.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Comprou: {owner.name}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {transaction.splitType !== "INDIVIDUAL" && (
                            <Badge
                              variant="secondary"
                              className="h-4 px-1 text-[10px] font-normal gap-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                            >
                              <SplitIcon
                                className={cn("h-3 w-3", splitColor)}
                              />
                              {splitLabel}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="font-normal gap-1.5 py-1 pr-3 bg-white dark:bg-zinc-900"
                      >
                        <span>{categoryIcon}</span>
                        <span>{categoryName}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                          {accountName}
                        </span>
                        {transaction.invoiceId && (
                          <div
                            className="flex items-center gap-1 text-[10px] text-purple-600 dark:text-purple-400 cursor-pointer hover:underline"
                            onClick={() =>
                              onViewInvoice?.(transaction.invoiceId)
                            }
                          >
                            <span>Fatura</span>
                            <Eye className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span
                          className={cn(
                            "font-bold text-base",
                            isIncome
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-zinc-900 dark:text-zinc-100",
                          )}
                        >
                          {isIncome ? "+" : "-"} R${" "}
                          {toNumber(transaction.amount).toLocaleString(
                            "pt-BR",
                            { minimumFractionDigits: 2 },
                          )}
                        </span>
                        {/* Status Badge */}
                        {overdue ? (
                          <Badge
                            variant="destructive"
                            className="h-4 px-1 text-[9px]"
                          >
                            Atrasado
                          </Badge>
                        ) : isPaid ? (
                          <Badge
                            variant="default"
                            className="h-4 px-1 text-[9px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-200 shadow-none"
                          >
                            Pago
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="h-4 px-1 text-[9px] bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-100 dark:border-amber-900"
                          >
                            Pendente
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 opacity-0 group-hover:opacity-100 transition-opacity"
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
                            className="text-rose-600 focus:text-rose-600"
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

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <span>Mostrar</span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(v) => {
              setItemsPerPage(Number(v));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={itemsPerPage} />
            </SelectTrigger>
            <SelectContent side="top">
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span>por página</span>
        </div>

        {totalPages > 1 && (
          <Pagination className="justify-end w-auto mx-0">
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 p-0"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Anterior</span>
                </Button>
              </PaginationItem>

              <span className="text-sm text-zinc-500 mx-2">
                Página {currentPage} de {totalPages}
              </span>

              <PaginationItem>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 p-0"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Próximo</span>
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
