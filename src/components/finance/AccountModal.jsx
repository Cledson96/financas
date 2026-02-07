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

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f43f5e",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#6366f1",
];

export default function AccountModal({
  open,
  onOpenChange,
  onSubmit,
  editData = null,
  isLoading = false,
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState("CHECKING_ACCOUNT");
  const [bankName, setBankName] = useState("");
  const [balance, setBalance] = useState("");
  const [limit, setLimit] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [closingDay, setClosingDay] = useState("");
  const [color, setColor] = useState("#3b82f6");

  useEffect(() => {
    if (editData) {
      setName(editData.name || "");
      setType(editData.type || "CHECKING_ACCOUNT");
      setBankName(editData.bankName || "");
      setBalance(editData.balance?.toString() || "");
      setLimit(editData.limit?.toString() || "");
      setDueDay(editData.dueDay?.toString() || "");
      setClosingDay(editData.closingDay?.toString() || "");
      setColor(editData.color || "#3b82f6");
    } else {
      resetForm();
    }
  }, [editData, open]);

  const resetForm = () => {
    setName("");
    setType("CHECKING_ACCOUNT");
    setBankName("");
    setBalance("");
    setLimit("");
    setDueDay("");
    setClosingDay("");
    setColor("#3b82f6");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name,
      type,
      bankName: bankName || null,
      balance: parseFloat(balance) || 0,
      limit: type === "CREDIT_CARD" ? parseFloat(limit) || null : null,
      dueDay: type === "CREDIT_CARD" ? parseInt(dueDay) || null : null,
      closingDay: type === "CREDIT_CARD" ? parseInt(closingDay) || null : null,
      color,
    });
  };

  const isCreditCard = type === "CREDIT_CARD";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {editData ? "Editar Conta" : "Nova Conta"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Conta</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Nubank, Itaú..."
                className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CHECKING_ACCOUNT">
                    Conta Corrente
                  </SelectItem>
                  <SelectItem value="CREDIT_CARD">Cartão de Crédito</SelectItem>
                  <SelectItem value="CASH">Dinheiro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Banco (opcional)</Label>
              <Input
                id="bankName"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Ex: Nubank"
                className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="balance">
                {isCreditCard ? "Limite Disponível (R$)" : "Saldo Atual (R$)"}
              </Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="0,00"
                className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
              />
            </div>
          </div>

          {isCreditCard && (
            <>
              <div className="space-y-2">
                <Label htmlFor="limit">Limite Total (R$)</Label>
                <Input
                  id="limit"
                  type="number"
                  step="0.01"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  placeholder="0,00"
                  className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dueDay">Dia Vencimento</Label>
                  <Input
                    id="dueDay"
                    type="number"
                    min="1"
                    max="31"
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)}
                    placeholder="15"
                    className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="closingDay">Dia Fechamento</Label>
                  <Input
                    id="closingDay"
                    type="number"
                    min="1"
                    max="31"
                    value={closingDay}
                    onChange={(e) => setClosingDay(e.target.value)}
                    placeholder="8"
                    className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    color === c
                      ? "ring-2 ring-offset-2 ring-zinc-900 dark:ring-zinc-100 dark:ring-offset-zinc-900"
                      : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
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
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editData ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
