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
  Search,
  Download,
  ArrowUpDown,
  MoreHorizontal,
  User,
  Scale,
  PieChart,
  Calendar,
  CreditCard,
  Banknote,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format, parseISO, isBefore, addMonths } from "date-fns";
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
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
  // ... keeping existing state ...

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
    // Income never overdue
    if (transaction.type === "INCOME") return false;
    // Paid, Settled, or Reconciled never overdue
    if (
      transaction.status === "PAID" ||
      transaction.settled ||
      transaction.isReconciled
    )
      return false;
    // Credit Card expenses are "Billed", not overdue in this context usually (unless invoice is overdue, but that's invoice level)
    if (transaction.Account?.type === "CREDIT_CARD") return false;

    if (!transaction.paymentDate) return false;
    // Check overdue only on unchecked/unsettled transactions
    return isBefore(parseISO(transaction.paymentDate), new Date());
  };

  const filteredTransactions = [...transactions].sort((a, b) => {
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

  // Calculate Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    endIndex,
  );

  // Reset page when filters change
  // Note: ideally use useEffect, but simple reset on render check is ok or just let user navigate
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

  const handleExport = () => {
    onExport?.(filteredTransactions);
  };

  return (
    <div className="space-y-4">
      {/* Filters removed */}

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-4 bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 animate-in slide-in-from-top-2">
          <span className="text-sm font-medium ml-2">
            {selectedIds.size} selecionado(s)
          </span>
          <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-600" />
          <Button variant="outline" size="sm" className="gap-2">
            <Pencil className="h-4 w-4" /> Mudar Categoria
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-rose-600 hover:text-rose-700"
          >
            <Trash2 className="h-4 w-4" /> Excluir
          </Button>
        </div>
      )}

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={
                    filteredTransactions.length > 0 &&
                    selectedIds.size === filteredTransactions.length
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100"
                onClick={() => toggleSort("purchaseDate")}
              >
                <span className="flex items-center gap-1">
                  Data
                  <ArrowUpDown className="h-3 w-3" />
                </span>
              </TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Conta</TableHead>
              <TableHead>Divisão</TableHead>
              <TableHead>Fatura</TableHead>
              <TableHead
                className="cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100"
                onClick={() => toggleSort("amount")}
              >
                <span className="flex items-center gap-1">
                  Valor
                  <ArrowUpDown className="h-3 w-3" />
                </span>
              </TableHead>
              <TableHead>Quem Comprou</TableHead>
              <TableHead>Quem Pagou</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={13}
                  className="text-center py-8 text-zinc-500"
                >
                  Nenhuma transação encontrada
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((transaction) => {
                // Use safe optional chaining for potential relations
                const categoryName =
                  transaction.Category?.name ||
                  transaction.categoryName ||
                  "Geral";
                const accountName =
                  transaction.Account?.name ||
                  transaction.accountName ||
                  "Conta";
                const payerName =
                  transaction.User_Transaction_payerIdToUser?.name ||
                  transaction.payerName ||
                  "Desconhecido";

                // Owner Logic
                let ownerName = "";

                // Priority 1: Check explicit owner relation
                if (transaction.User_Transaction_ownerIdToUser?.name) {
                  ownerName = transaction.User_Transaction_ownerIdToUser.name;
                }
                // Priority 2: Check userId if mapped
                else if (transaction.userId) {
                  const ownerMember = members?.find(
                    (m: any) => m.id === transaction.userId,
                  );
                  if (ownerMember) ownerName = ownerMember.name;
                }

                // Fallback if no owner identified yet
                if (!ownerName) {
                  if (
                    transaction.splitType === "SHARED" ||
                    transaction.splitType === "SHARED_PROPORTIONAL"
                  ) {
                    ownerName = "Casal ⚖️";
                  } else if (transaction.splitType === "INDIVIDUAL") {
                    ownerName = payerName;
                  } else {
                    ownerName = payerName; // Final fallback
                  }
                }

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
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(transaction.id)}
                        onCheckedChange={() => toggleSelection(transaction.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-zinc-600 dark:text-zinc-400">
                      {transaction.purchaseDate &&
                        format(parseISO(transaction.purchaseDate), "dd/MM/yy", {
                          locale: ptBR,
                        })}
                    </TableCell>
                    <TableCell>
                      {transaction.paymentDate ? (
                        format(parseISO(transaction.paymentDate), "dd/MM/yy", {
                          locale: ptBR,
                        })
                      ) : (
                        <span className="text-zinc-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[200px] block text-left cursor-default">
                                {transaction.description}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{transaction.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
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
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            {transaction.splitType === "INDIVIDUAL" && (
                              <User className="h-4 w-4 text-zinc-400" />
                            )}
                            {transaction.splitType === "SHARED" && (
                              <Scale className="h-4 w-4 text-blue-500" />
                            )}
                            {transaction.splitType ===
                              "SHARED_PROPORTIONAL" && (
                              <PieChart className="h-4 w-4 text-purple-500" />
                            )}
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {transaction.splitType === "INDIVIDUAL" &&
                                `Individual (${payerName})`}
                              {transaction.splitType === "SHARED" &&
                                "Casal (50/50)"}
                              {transaction.splitType ===
                                "SHARED_PROPORTIONAL" &&
                                `Proporcional (${(transaction.splitShare * 100).toFixed(0)}%)`}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      {transaction.invoiceId ? (
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800 cursor-pointer hover:bg-purple-100"
                            onClick={() =>
                              onViewInvoice?.(transaction.invoiceId)
                            }
                          >
                            {transaction.Invoice
                              ? `${format(new Date(2024, transaction.Invoice.month - 1), "MMM", { locale: ptBR }).toUpperCase()}/${transaction.Invoice.year.toString().slice(2)}`
                              : "FATURA"}
                          </Badge>
                          {transaction.type === "PAYMENT" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-[10px] px-2 text-purple-600"
                              onClick={() =>
                                onViewInvoice?.(transaction.invoiceId)
                              }
                            >
                              Ver Itens
                            </Button>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "font-semibold",
                          transaction.type === "INCOME"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400",
                        )}
                      >
                        {transaction.type === "INCOME" ? "+" : "-"}
                        R${" "}
                        {toNumber(transaction.amount).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </TableCell>
                    <TableCell className="text-zinc-600 dark:text-zinc-400">
                      {ownerName}
                    </TableCell>
                    <TableCell className="text-zinc-600 dark:text-zinc-400">
                      {payerName}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const isCreditCard =
                          transaction.Account?.type === "CREDIT_CARD" &&
                          transaction.type === "EXPENSE";
                        const isIncome = transaction.type === "INCOME";
                        const isPayment = transaction.type === "PAYMENT";
                        const isPaid =
                          transaction.isReconciled ||
                          transaction.settled ||
                          transaction.status === "PAID";

                        // Status Priority:
                        // 1. Income -> Always Received (Green)
                        // 2. Paid -> Always Paid (Green)
                        // 3. Credit Card -> Billed (Purple)
                        // 4. Overdue -> Late (Red)
                        // 5. Default -> Pending (Yellow/Gray)

                        if (isIncome) {
                          return (
                            <Badge
                              variant="default"
                              className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-200"
                            >
                              Recebido
                            </Badge>
                          );
                        }

                        if (isPaid) {
                          return (
                            <Badge
                              variant="default"
                              className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-200"
                            >
                              {isPayment ? "Pago" : "Pago"}
                            </Badge>
                          );
                        }

                        if (isCreditCard) {
                          return (
                            <Badge
                              variant="secondary"
                              className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 hover:bg-purple-200"
                            >
                              Faturado
                            </Badge>
                          );
                        }

                        if (overdue) {
                          return <Badge variant="destructive">Atrasado</Badge>;
                        }

                        // Pending
                        return (
                          <Badge
                            variant="secondary"
                            className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-200"
                          >
                            {isPayment ? "Agendado" : "Pendente"}
                          </Badge>
                        );
                      })()}
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
          <span>de {filteredTransactions.length} transações</span>
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

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Simple logic to show window of pages around current
                let p = i + 1;
                if (totalPages > 5) {
                  if (currentPage > 3) p = currentPage - 2 + i;
                  if (p > totalPages) p = totalPages - 4 + i;
                }

                // Keep within bounds
                if (p <= 0) return null;

                return (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === p}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(p);
                      }}
                      className="h-8 w-8"
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                );
              }).filter(Boolean)}

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
