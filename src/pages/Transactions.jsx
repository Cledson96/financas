import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import TransactionTable from "@/components/finance/TransactionTable";
import TransactionModal from "@/components/finance/TransactionModal";
import BudgetManager from "@/components/finance/BudgetManager";
import BudgetModal from "@/components/finance/BudgetModal";
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

export default function Transactions() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [editBudget, setEditBudget] = useState(null);
  const [budgetMonth, setBudgetMonth] = useState(new Date().getMonth() + 1);
  const [budgetYear, setBudgetYear] = useState(new Date().getFullYear());
  const [deleteBudgetId, setDeleteBudgetId] = useState(null);
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => base44.entities.Transaction.list("-purchaseDate", 1000),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => base44.entities.Category.list(),
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => base44.entities.Account.list(),
  });

  const { data: members = [] } = useQuery({
    queryKey: ["members"],
    queryFn: () => base44.entities.FamilyMember.list(),
  });

  const { data: budgets = [] } = useQuery({
    queryKey: ["budgets"],
    queryFn: () => base44.entities.Budget.list(),
  });

  const createTransaction = useMutation({
    mutationFn: (data) => base44.entities.Transaction.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setModalOpen(false);
      setEditData(null);
      toast.success("Transação criada com sucesso!");
    },
  });

  const updateTransaction = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Transaction.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setModalOpen(false);
      setEditData(null);
      toast.success("Transação atualizada!");
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: (id) => base44.entities.Transaction.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setDeleteId(null);
      toast.success("Transação excluída!");
    },
  });

  const handleSubmit = (data) => {
    if (editData) {
      updateTransaction.mutate({ id: editData.id, data });
    } else {
      createTransaction.mutate(data);
    }
  };

  const handleEdit = (transaction) => {
    setEditData(transaction);
    setModalOpen(true);
  };

  const handleDuplicate = (transaction) => {
    const { id, created_date, updated_date, ...rest } = transaction;
    createTransaction.mutate(rest);
  };

  const handleExport = (filteredData) => {
    const exportData = filteredData.map((t) => ({
      Data: t.purchaseDate,
      Descrição: t.description,
      Categoria: t.categoryName,
      Conta: t.accountName,
      Valor: t.amount,
      Tipo: t.type === "EXPENSE" ? "Despesa" : "Receita",
      "Quem Pagou": t.payerName,
      Divisão: t.splitType === "SHARED" ? "Casal" : "Individual",
      Status: t.status === "PAID" ? "Pago" : "Pendente",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transações");
    XLSX.writeFile(
      wb,
      `transacoes_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
    toast.success("Arquivo exportado com sucesso!");
  };

  // Budget mutations
  const createBudget = useMutation({
    mutationFn: (data) => base44.entities.Budget.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      setBudgetModalOpen(false);
      setEditBudget(null);
      toast.success("Orçamento criado!");
    },
  });

  const updateBudget = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Budget.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      setBudgetModalOpen(false);
      setEditBudget(null);
      toast.success("Orçamento atualizado!");
    },
  });

  const deleteBudget = useMutation({
    mutationFn: (id) => base44.entities.Budget.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      setDeleteBudgetId(null);
      toast.success("Orçamento excluído!");
    },
  });

  const handleBudgetSubmit = (data) => {
    if (editBudget) {
      updateBudget.mutate({ id: editBudget.id, data });
    } else {
      createBudget.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Transações
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Extrato completo de receitas e despesas
          </p>
        </div>
        <Button
          onClick={() => {
            setEditData(null);
            setModalOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Transação
        </Button>
      </div>

      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="bg-zinc-100 dark:bg-zinc-800">
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="budgets">Orçamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <TransactionTable
            transactions={transactions}
            categories={categories}
            onEdit={handleEdit}
            onDelete={(t) => setDeleteId(t.id)}
            onDuplicate={handleDuplicate}
            onExport={handleExport}
          />
        </TabsContent>

        <TabsContent value="budgets">
          <BudgetManager
            budgets={budgets}
            transactions={transactions}
            categories={categories}
            onAdd={(month, year) => {
              setEditBudget(null);
              setBudgetMonth(month);
              setBudgetYear(year);
              setBudgetModalOpen(true);
            }}
            onEdit={(budget) => {
              setEditBudget(budget);
              setBudgetModalOpen(true);
            }}
            onDelete={(budget) => setDeleteBudgetId(budget.id)}
          />
        </TabsContent>
      </Tabs>

      {/* Transaction Modal */}
      <TransactionModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditData(null);
        }}
        onSubmit={handleSubmit}
        categories={categories}
        accounts={accounts}
        members={members}
        editData={editData}
        isLoading={createTransaction.isPending || updateTransaction.isPending}
      />

      {/* Budget Modal */}
      <BudgetModal
        open={budgetModalOpen}
        onOpenChange={(open) => {
          setBudgetModalOpen(open);
          if (!open) setEditBudget(null);
        }}
        onSubmit={handleBudgetSubmit}
        categories={categories}
        existingBudgets={budgets}
        editData={editBudget}
        defaultMonth={budgetMonth}
        defaultYear={budgetYear}
        isLoading={createBudget.isPending || updateBudget.isPending}
      />

      {/* Delete Transaction Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir transação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A transação será removida
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTransaction.mutate(deleteId)}
              className="bg-rose-500 hover:bg-rose-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Budget Confirmation */}
      <AlertDialog
        open={!!deleteBudgetId}
        onOpenChange={() => setDeleteBudgetId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir orçamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O orçamento será removido
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteBudget.mutate(deleteBudgetId)}
              className="bg-rose-500 hover:bg-rose-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
