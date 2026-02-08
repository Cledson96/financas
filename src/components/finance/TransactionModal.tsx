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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Category, Account, User } from "@/types/finance";

interface TransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void; // Keeping data as any for now to avoid strict validation hell, but could be specific
  categories?: Category[];
  accounts?: Account[];
  members?: User[];
  editData?: any; // To verify if we have a type for editData
  isLoading?: boolean;
}

export default function TransactionModal({
  open,
  onOpenChange,
  onSubmit,
  categories = [],
  accounts = [],
  members = [],
  editData = null,
  isLoading = false,
}: TransactionModalProps) {
  const [type, setType] = useState<string>("EXPENSE");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [purchaseDate, setPurchaseDate] = useState<Date | undefined>(
    new Date(),
  );
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [payerId, setPayerId] = useState("");
  const [isShared, setIsShared] = useState(true);
  const [splitMethod, setSplitMethod] = useState<"EQUAL" | "PROPORTIONAL">(
    "EQUAL",
  );
  const [customShare, setCustomShare] = useState("50");

  useEffect(() => {
    if (editData) {
      setType(editData.type || "EXPENSE");
      setDescription(editData.description || "");
      setAmount(editData.amount?.toString() || "");
      setPurchaseDate(
        editData.purchaseDate ? new Date(editData.purchaseDate) : new Date(),
      );
      setCategoryId(editData.categoryId || "");
      setAccountId(editData.accountId || "");
      setPayerId(editData.payerId || "");
      setIsShared(
        editData.splitType === "SHARED" ||
          editData.splitType === "SHARED_PROPORTIONAL",
      );
      if (editData.splitType === "SHARED_PROPORTIONAL") {
        setSplitMethod("PROPORTIONAL");
        // splitShare is decimal (0.4), UI wants integer percentage (40)
        setCustomShare(
          editData.splitShare ? (editData.splitShare * 100).toString() : "50",
        );
      } else {
        setSplitMethod("EQUAL");
        setCustomShare("50");
      }
    } else {
      resetForm();
    }
  }, [editData, open]);

  const resetForm = () => {
    setType("EXPENSE");
    setDescription("");
    setAmount("");
    setPurchaseDate(new Date());
    setCategoryId("");
    setAccountId("");
    setPayerId("");
    setIsShared(true);
    setSplitMethod("EQUAL");
    setCustomShare("50");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedCategory = categories.find((c) => c.id === categoryId);
    const selectedAccount = accounts.find((a) => a.id === accountId);
    const selectedPayer = members.find((m) => m.id === payerId);

    // Safety check for date
    const dateStr = purchaseDate
      ? format(purchaseDate, "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd");

    onSubmit({
      description,
      amount: parseFloat(amount),
      purchaseDate: dateStr,
      type,
      categoryId,
      categoryName: selectedCategory?.name || "",
      accountId,
      accountName: selectedAccount?.name || "",
      payerId,
      payerName: selectedPayer?.name || "",
      payerName: selectedPayer?.name || "",
      splitType: isShared
        ? splitMethod === "PROPORTIONAL"
          ? "SHARED_PROPORTIONAL"
          : "SHARED"
        : "INDIVIDUAL",
      splitShare:
        isShared && splitMethod === "PROPORTIONAL"
          ? (parseFloat(customShare) || 0) / 100
          : null,
      ownerId: !isShared ? payerId : null,
      status: "PENDING",
    });
  };

  const filteredCategories = categories.filter(
    (c) =>
      (type === "EXPENSE" && c.type === "EXPENSE") ||
      (type === "INCOME" && c.type === "INCOME"),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {editData ? "Editar Transação" : "Nova Transação"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Tabs value={type} onValueChange={setType} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-zinc-100 dark:bg-zinc-800">
              <TabsTrigger
                value="EXPENSE"
                className="data-[state=active]:bg-rose-500 data-[state=active]:text-white"
              >
                Despesa
              </TabsTrigger>
              <TabsTrigger
                value="INCOME"
                className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
              >
                Receita
              </TabsTrigger>
              <TabsTrigger
                value="TRANSFER"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                Transf.
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Supermercado, Salário..."
              className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700",
                      !purchaseDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {purchaseDate
                      ? format(purchaseDate, "dd/MM/yyyy", { locale: ptBR })
                      : "Selecione"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={purchaseDate}
                    onSelect={setPurchaseDate}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {type !== "TRANSFER" && (
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={categoryId}
                  onValueChange={setCategoryId}
                  required={type !== "TRANSFER"}
                >
                  <SelectTrigger className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="flex items-center gap-2">
                          {/* {cat.icon && <span>{cat.icon}</span>} */}
                          {cat.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Conta</Label>
              <Select value={accountId} onValueChange={setAccountId} required>
                <SelectTrigger className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{type === "TRANSFER" ? "Quem Enviou" : "Quem Pagou"}</Label>
            <Select value={payerId} onValueChange={setPayerId} required>
              <SelectTrigger className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {type !== "TRANSFER" && (
            <div className="space-y-4 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="shared" className="text-sm font-medium">
                    Dividir com o Casal?
                  </Label>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {isShared
                      ? "A despesa será compartilhada"
                      : "Despesa individual sua"}
                  </p>
                </div>
                <Switch
                  id="shared"
                  checked={isShared}
                  onCheckedChange={setIsShared}
                />
              </div>

              {isShared && (
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-zinc-500 uppercase font-bold tracking-wider">
                      Método de Divisão
                    </Label>
                    <Tabs
                      value={splitMethod}
                      onValueChange={(v) =>
                        setSplitMethod(v as "EQUAL" | "PROPORTIONAL")
                      }
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-2 h-8">
                        <TabsTrigger value="EQUAL" className="text-xs">
                          Igual (50/50)
                        </TabsTrigger>
                        <TabsTrigger value="PROPORTIONAL" className="text-xs">
                          Proporcional / Outro
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {splitMethod === "PROPORTIONAL" && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                      <Label className="text-xs">
                        Quanto a <strong>outra pessoa</strong> deve pagar? (%)
                      </Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={customShare}
                          onChange={(e) => setCustomShare(e.target.value)}
                          placeholder="Ex: 30"
                          min="0"
                          max="100"
                          className="pr-8"
                        />
                        <span className="absolute right-3 top-2.5 text-sm text-zinc-400">
                          %
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500">
                        Você pagará:{" "}
                        <span className="font-bold text-zinc-700 dark:text-zinc-300">
                          {100 - (parseFloat(customShare) || 0)}%
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

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
              disabled={isLoading}
              className={cn(
                "flex-1",
                type === "EXPENSE"
                  ? "bg-rose-500 hover:bg-rose-600"
                  : type === "INCOME"
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : "bg-blue-500 hover:bg-blue-600",
              )}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editData ? "Salvar" : "Adicionar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
