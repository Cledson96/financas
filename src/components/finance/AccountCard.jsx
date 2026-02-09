import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Wallet,
  Banknote,
  Pencil,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const accountIcons = {
  CREDIT_CARD: CreditCard,
  CHECKING_ACCOUNT: Wallet,
  CASH: Banknote,
};

const accountLabels = {
  CREDIT_CARD: "Cartão de Crédito",
  CHECKING_ACCOUNT: "Conta Corrente",
  CASH: "Dinheiro",
};

export default function AccountCard({ account, onEdit, onDelete }) {
  const Icon = accountIcons[account.type] || Wallet;
  const isCreditCard = account.type === "CREDIT_CARD";

  const usedLimit =
    isCreditCard && account.limit ? account.limit - account.balance : 0;

  const usagePercent =
    isCreditCard && account.limit ? (usedLimit / account.limit) * 100 : 0;

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-lg",
        "bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-800",
        "border-zinc-200 dark:border-zinc-700",
      )}
    >
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 -translate-y-8 translate-x-8 pointer-events-none"
        style={{ backgroundColor: account.color || "#3b82f6" }}
      />

      <CardContent className="p-5 relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-xl"
              style={{ backgroundColor: `${account.color || "#3b82f6"}20` }}
            >
              <Icon
                className="w-5 h-5"
                style={{ color: account.color || "#3b82f6" }}
              />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                {account.name}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {account.bankName || accountLabels[account.type]}
              </p>
              {account.User && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 mt-1 inline-block border border-zinc-200 dark:border-zinc-700">
                  {account.User.name}
                </span>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(account)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(account)}
                className="text-rose-600"
              >
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {isCreditCard ? (
          <div className="space-y-3">
            <div>
              <p className="text-xs text-zinc-500 mb-1">Fatura Atual</p>
              <p className="text-xl font-bold text-rose-600 dark:text-rose-400">
                R${" "}
                {usedLimit.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Limite Usado</span>
                <span className="text-zinc-600 dark:text-zinc-400">
                  {usagePercent.toFixed(0)}%
                </span>
              </div>
              <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    usagePercent > 80
                      ? "bg-rose-500"
                      : usagePercent > 50
                        ? "bg-amber-500"
                        : "bg-emerald-500",
                  )}
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-zinc-500">
                <span>
                  Disponível: R${" "}
                  {(account.balance || 0).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
                <span>
                  Limite: R${" "}
                  {(account.limit || 0).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            {account.dueDay && (
              <div className="flex gap-3 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                <Badge variant="outline" className="text-xs">
                  Venc: Dia {account.dueDay}
                </Badge>
                {account.closingDay && (
                  <Badge variant="outline" className="text-xs">
                    Fecha: Dia {account.closingDay}
                  </Badge>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            <p className="text-xs text-zinc-500 mb-1">Saldo Atual</p>
            <p
              className={cn(
                "text-2xl font-bold",
                account.balance >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400",
              )}
            >
              R${" "}
              {(account.balance || 0).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
