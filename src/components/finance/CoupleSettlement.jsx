import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowRight, Scale, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CoupleSettlement({ transactions = [], members = [] }) {
  // Filtrar apenas transações SHARED
  const sharedTransactions = transactions.filter(
    (t) => t.splitType === "SHARED" && t.type === "EXPENSE",
  );

  // Calcular totais por membro
  const memberTotals = members.reduce((acc, member) => {
    acc[member.id] = {
      name: member.name,
      color: member.color || "#3b82f6",
      paid: 0,
      share: 0,
    };
    return acc;
  }, {});

  // Total gasto do casal
  const totalShared = sharedTransactions.reduce(
    (sum, t) => sum + (t.amount || 0),
    0,
  );
  const sharePerPerson = totalShared / (members.length || 1);

  // Calcular quanto cada um pagou
  sharedTransactions.forEach((t) => {
    if (memberTotals[t.payerId]) {
      memberTotals[t.payerId].paid += t.amount || 0;
    }
  });

  // Definir a parte de cada um
  Object.keys(memberTotals).forEach((id) => {
    memberTotals[id].share = sharePerPerson;
  });

  // Calcular saldo (positivo = tem a receber, negativo = deve)
  const balances = Object.entries(memberTotals).map(([id, data]) => ({
    id,
    ...data,
    balance: data.paid - data.share,
  }));

  // Encontrar quem deve para quem
  const creditor = balances.find((b) => b.balance > 0);
  const debtor = balances.find((b) => b.balance < 0);
  const settlementAmount = creditor ? Math.abs(creditor.balance) : 0;

  return (
    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          <Scale className="w-5 h-5 text-blue-500" />
          Divisão do Casal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Compartilhado */}
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
            Total Compartilhado
          </p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            R${" "}
            {totalShared.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-zinc-400 mt-1">
            Dividido em {members.length} = R${" "}
            {sharePerPerson.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}{" "}
            cada
          </p>
        </div>

        {/* Cards dos Membros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {balances.map((member) => (
            <div
              key={member.id}
              className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-3"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback style={{ backgroundColor: member.color }}>
                    {member.name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {member.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {member.balance > 0
                      ? "Tem a receber"
                      : member.balance < 0
                        ? "Deve"
                        : "Zerado"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Pagou</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    R${" "}
                    {member.paid.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Sua parte</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    R${" "}
                    {member.share.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="h-px bg-zinc-200 dark:bg-zinc-700" />
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Saldo</span>
                  <span
                    className={cn(
                      "font-bold flex items-center gap-1",
                      member.balance > 0
                        ? "text-emerald-600"
                        : member.balance < 0
                          ? "text-rose-600"
                          : "text-zinc-500",
                    )}
                  >
                    {member.balance > 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : member.balance < 0 ? (
                      <TrendingDown className="w-4 h-4" />
                    ) : null}
                    {member.balance >= 0 ? "+" : ""}
                    R${" "}
                    {member.balance.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resultado Final */}
        {settlementAmount > 0 && creditor && debtor && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-900">
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-3">
              Acerto Necessário
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <Avatar className="h-12 w-12 mx-auto mb-1">
                  <AvatarFallback style={{ backgroundColor: debtor.color }}>
                    {debtor.name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {debtor.name}
                </p>
              </div>

              <div className="flex flex-col items-center">
                <ArrowRight className="w-6 h-6 text-blue-500" />
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  R${" "}
                  {settlementAmount.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="text-center">
                <Avatar className="h-12 w-12 mx-auto mb-1">
                  <AvatarFallback style={{ backgroundColor: creditor.color }}>
                    {creditor.name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {creditor.name}
                </p>
              </div>
            </div>
          </div>
        )}

        {settlementAmount === 0 && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-center">
            <p className="text-emerald-600 dark:text-emerald-400 font-medium">
              ✓ Tudo acertado! Ninguém deve nada.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
