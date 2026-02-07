import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function BudgetModal({
  open,
  onOpenChange,
  onSubmit,
  categories = [],
  existingBudgets = [],
  editData = null,
  defaultMonth,
  defaultYear,
  isLoading = false,
}) {
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");

  const month = editData?.month || defaultMonth || new Date().getMonth() + 1;
  const year = editData?.year || defaultYear || new Date().getFullYear();

  useEffect(() => {
    if (editData) {
      setCategoryId(editData.categoryId || "");
      setAmount(editData.amount?.toString() || "");
    } else {
      setCategoryId("");
      setAmount("");
    }
  }, [editData, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedCategory = categories.find((c) => c.id === categoryId);

    onSubmit({
      categoryId,
      categoryName: selectedCategory?.name || "",
      categoryIcon: selectedCategory?.icon || "",
      amount: parseFloat(amount),
      month,
      year,
    });
  };

  // Filtra categorias de despesa que ainda não têm orçamento no mês
  const availableCategories = categories.filter((c) => {
    if (c.type !== "EXPENSE") return false;
    if (editData && c.id === editData.categoryId) return true;
    return !existingBudgets.some(
      (b) => b.categoryId === c.id && b.month === month && b.year === year,
    );
  });

  const monthLabel = format(new Date(year, month - 1, 1), "MMMM yyyy", {
    locale: ptBR,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {editData ? "Editar Orçamento" : "Novo Orçamento"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-center">
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium capitalize">
              {monthLabel}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              value={categoryId}
              onValueChange={setCategoryId}
              required
              disabled={!!editData}
            >
              <SelectTrigger className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <span className="flex items-center gap-2">
                      {cat.icon && <span>{cat.icon}</span>}
                      {cat.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableCategories.length === 0 && !editData && (
              <p className="text-xs text-amber-600">
                Todas as categorias já possuem orçamento neste mês
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Limite Mensal (R$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading || (!editData && availableCategories.length === 0)
              }
              className="flex-1"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editData ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
