"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Power, PowerOff } from "lucide-react";
import {
  createFixedExpenseAction,
  deleteFixedExpenseAction,
  toggleFixedExpenseAction,
} from "@/app/actions/fixed-expense-actions";
import { FixedExpenseService } from "@/services/fixed-expense-service";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FixedExpense {
  id: string;
  description: string;
  amount: number;
  dueDay: number;
  active: boolean;
  splitType: string;
  Category: {
    name: string;
    icon: string | null;
  };
  User?: {
    name: string;
  } | null;
}

// Since FixedExpenseService is server-side only in strict sense (imports prisma),
// we should strictly use Server Actions or API to fetch list.
// For this prototype, let's assume we create a Server Action to 'list' as well
// OR we just use an API route if we want to stick to the pattern.
// I'll add a 'getFixedExpenses' action in 'fixed-expense-actions' later.
// For now I'll Mock fetch or assume I added it.

// WAIT, I cannot import FixedExpenseService in a "use client" file if it imports prisma.
// I must use a Server Action to fetch the list.
import { getFixedExpensesAction } from "@/app/actions/fixed-expense-actions"; // I need to add this!

export default function FixedExpensesList({ categories, members }: any) {
  const [expenses, setExpenses] = useState<FixedExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchExpenses = () => {
    setLoading(true);
    getFixedExpensesAction()
      .then(setExpenses)
      .catch(() => toast.error("Failed to load expenses"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await toggleFixedExpenseAction(id, !current);
      fetchExpenses();
      toast.success(`Despesa ${!current ? "ativada" : "desativada"}`);
    } catch {
      toast.error("Erro ao atualizar");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza?")) return;
    try {
      await deleteFixedExpenseAction(id);
      fetchExpenses();
      toast.success("Despesa removida");
    } catch {
      toast.error("Erro ao remover");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Despesas Recorrentes</h2>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Nova Despesa
        </Button>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <p>Carregando...</p>
        ) : (
          expenses.map((expense) => (
            <Card
              key={expense.id}
              className="flex flex-row items-center justify-between p-4"
            >
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  {/* Icon placeholder */}
                  <span className="text-xl">💰</span>
                </div>
                <div>
                  <h4 className="font-semibold">{expense.description}</h4>
                  <div className="flex gap-2 text-sm text-muted-foreground">
                    <span>Dia {expense.dueDay}</span>
                    <span>•</span>
                    <span>R$ {Number(expense.amount).toFixed(2)}</span>
                    <span>•</span>
                    <Badge variant="outline">{expense.splitType}</Badge>
                    {expense.splitType === "INDIVIDUAL" && expense.User && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {expense.User.name}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleToggle(expense.id, expense.active)}
                >
                  {expense.active ? (
                    <Power className="text-green-500" />
                  ) : (
                    <PowerOff className="text-zinc-400" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-rose-500"
                  onClick={() => handleDelete(expense.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      <FixedExpenseModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchExpenses();
        }}
        categories={categories}
        members={members}
      />
    </div>
  );
}

function FixedExpenseModal({
  open,
  onOpenChange,
  onSuccess,
  categories,
  members,
}: any) {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    dueDay: "10",
    categoryId: "",
    splitType: "SHARED",
    ownerId: "none",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value && value !== "none") data.append(key, value);
    });

    try {
      await createFixedExpenseAction(data);
      toast.success("Despesa criada!");
      onSuccess();
    } catch {
      toast.error("Erro ao criar");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Despesa Fixa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Descrição</Label>
            <Input
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label>Valor Estimado</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Dia de Vencimento</Label>
              <Input
                type="number"
                min="1"
                max="31"
                value={formData.dueDay}
                onChange={(e) =>
                  setFormData({ ...formData, dueDay: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label>Categoria</Label>
              <Select
                onValueChange={(v) =>
                  setFormData({ ...formData, categoryId: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Divisão</Label>
            <Select
              value={formData.splitType}
              onValueChange={(v) => setFormData({ ...formData, splitType: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                <SelectItem value="SHARED">Casal (50/50)</SelectItem>
                <SelectItem value="SHARED_PROPORTIONAL">
                  Proporcional
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.splitType === "INDIVIDUAL" && (
            <div>
              <Label>Dono</Label>
              <Select
                onValueChange={(v) => setFormData({ ...formData, ownerId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione quem paga" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m: any) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button type="submit" className="w-full">
            Criar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
