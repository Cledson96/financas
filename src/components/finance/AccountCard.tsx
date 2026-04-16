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
import type { AccountType } from "@/types/finance";

// Extended to include fields returned by the API but not in the base interface
interface AccountCardAccount {
  id: string;
  name: string;
  type: string;
  bankName?: string | null;
  balance: number;
  limit?: number | null;
  dueDay?: number | null;
  closingDay?: number | null;
  userId?: string | null;
  User?: { name: string } | null;
  Invoice?: unknown[];
  isActive?: boolean;
  subtype?: string | null;
  notes?: string | null;
  color?: string | null;
}

interface AccountCardProps {
  account: AccountCardAccount;
  onEdit?: (account: AccountCardAccount) => void;
  onDelete?: (account: AccountCardAccount) => void;
}

const accountIcons: Record<AccountType, React.ElementType> = {
  CREDIT_CARD: CreditCard,
  CHECKING_ACCOUNT: Wallet,
  CASH: Banknote,
};

const accountLabels: Record<AccountType, string> = {
  CREDIT_CARD: "Cartão de Crédito",
  CHECKING_ACCOUNT: "Conta Corrente",
  CASH: "Dinheiro",
};

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

function getUsageBarColor(percent: number): string {
  if (percent > 80) return "bg-rose-500";
  if (percent > 50) return "bg-amber-500";
  return "bg-emerald-500";
}

export default function AccountCard({ account, onEdit, onDelete }: AccountCardProps) {
  const Icon = (accountIcons[account.type as AccountType] as React.ElementType) || Wallet;
  const isCreditCard = account.type === "CREDIT_CARD";
  const isCheckingWithLimit =
    account.type === "CHECKING_ACCOUNT" && (account.limit ?? 0) > 0;

  // Card invoice / limit calculations
  const effectiveLimit = account.limit ?? 0;

  // For pure CREDIT_CARD: balance = available credit, so usedLimit = limit - balance
  // For CHECKING_ACCOUNT with limit: balance = bank balance (unrelated to card),
  //   so we calculate fatura from invoices (sum of Invoice amounts for open cycle)
  let usedLimit = 0;
  let availableLimit = effectiveLimit; // Default: full limit available
  let usagePercent = 0;

  // Both CREDIT_CARD and hybrid CHECKING_ACCOUNT use Invoice data when available
  const invoices = (account.Invoice as Array<{ amount: number; status: string }> | undefined) ?? [];
  const openInvoice = invoices.find((inv) => inv.status === "OPEN");

  if (openInvoice && effectiveLimit > 0) {
    // Open invoice exists — use its amount as fatura atual
    usedLimit = Number(openInvoice.amount);
    availableLimit = effectiveLimit - usedLimit;
    usagePercent = effectiveLimit > 0 ? (usedLimit / effectiveLimit) * 100 : 0;
  } else if (isCreditCard && effectiveLimit > 0 && account.balance !== 0) {
    // No open invoice but has non-zero balance — calculate from balance
    usedLimit = effectiveLimit - account.balance;
    availableLimit = account.balance;
    usagePercent = (usedLimit / effectiveLimit) * 100;
  }
  // Otherwise (no invoice, zero balance, or CHECKING_ACCOUNT): fatura = 0, available = full limit

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
        {/* Header: icon, name, bank, user badge, menu */}
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
                {account.bankName || (accountLabels as Record<string, string>)[account.type] || "Conta"}
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

        {/* ---- CREDIT CARD ---- */}
        {isCreditCard && (
          <CreditCardSection
            usedLimit={usedLimit}
            usagePercent={usagePercent}
            availableLimit={availableLimit}
            totalLimit={effectiveLimit}
            dueDay={account.dueDay}
            closingDay={account.closingDay}
          />
        )}

        {/* ---- CHECKING ACCOUNT WITH LIMIT (hybrid) ---- */}
        {isCheckingWithLimit && (
          <div className="space-y-3">
            {/* Balance section */}
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
                R$ {formatBRL(account.balance)}
              </p>
            </div>

            {/* Divider + Mini card section */}
            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-1.5 mb-2">
                <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Cartão
                </span>
              </div>

              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Fatura Atual</p>
                <p className="text-lg font-bold text-rose-600 dark:text-rose-400">
                  R$ {formatBRL(usedLimit)}
                </p>
              </div>

              <div className="space-y-1.5 mt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Limite Usado</span>
                  <span className="text-zinc-600 dark:text-zinc-400">
                    {usagePercent.toFixed(0)}%
                  </span>
                </div>
                <div className="h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      getUsageBarColor(usagePercent),
                    )}
                    style={{ width: `${Math.min(usagePercent, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-zinc-500">
                  <span>
                    Disponível: R$ {formatBRL(availableLimit)}
                  </span>
                  <span>
                    Limite: R$ {formatBRL(effectiveLimit)}
                  </span>
                </div>
              </div>

              {(account.dueDay || account.closingDay) && (
                <div className="flex gap-2 pt-2 mt-2 border-t border-zinc-100 dark:border-zinc-800">
                  {account.dueDay && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      Venc: Dia {account.dueDay}
                    </Badge>
                  )}
                  {account.closingDay && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      Fecha: Dia {account.closingDay}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---- CHECKING ACCOUNT WITHOUT LIMIT / CASH (balance only) ---- */}
        {!isCreditCard && !isCheckingWithLimit && (
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
              R$ {formatBRL(account.balance || 0)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Reusable sub-component for pure credit card display                */
/* ------------------------------------------------------------------ */

interface CreditCardSectionProps {
  usedLimit: number;
  usagePercent: number;
  availableLimit: number;
  totalLimit: number;
  dueDay?: number | null;
  closingDay?: number | null;
}

function CreditCardSection({
  usedLimit,
  usagePercent,
  availableLimit,
  totalLimit,
  dueDay,
  closingDay,
}: CreditCardSectionProps) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs text-zinc-500 mb-1">Fatura Atual</p>
        <p className="text-xl font-bold text-rose-600 dark:text-rose-400">
          R$ {formatBRL(usedLimit)}
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
              getUsageBarColor(usagePercent),
            )}
            style={{ width: `${Math.min(usagePercent, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-zinc-500">
          <span>Disponível: R$ {formatBRL(availableLimit)}</span>
          <span>Limite: R$ {formatBRL(totalLimit)}</span>
        </div>
      </div>

      {dueDay && (
        <div className="flex gap-3 pt-2 border-t border-zinc-200 dark:border-zinc-700">
          <Badge variant="outline" className="text-xs">
            Venc: Dia {dueDay}
          </Badge>
          {closingDay && (
            <Badge variant="outline" className="text-xs">
              Fecha: Dia {closingDay}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
