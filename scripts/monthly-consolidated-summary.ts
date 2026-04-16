import { prisma } from "../src/lib/prisma";

type Args = {
  month?: number;
  year?: number;
  category?: string;
};

function parseArgs(argv: string[]): Args {
  const args: Args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];
    const [flag, inlineValue] = current.split("=");
    const next = argv[i + 1];

    const takeValue = () => {
      if (inlineValue !== undefined) return inlineValue;
      if (next && !next.startsWith("--")) {
        i += 1;
        return next;
      }
      return undefined;
    };

    if (flag === "--month") args.month = Number(takeValue());
    if (flag === "--year") args.year = Number(takeValue());
    if (flag === "--category") args.category = takeValue();
  }
  return args;
}

function startOfMonthUTC(year: number, month: number) {
  return new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
}

function endOfMonthUTC(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
}

function formatMoney(value: number) {
  return Number(value.toFixed(2));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const now = new Date();
  const month = args.month ?? now.getMonth() + 1;
  const year = args.year ?? now.getFullYear();
  const category = args.category?.trim();

  if (!month || month < 1 || month > 12) {
    throw new Error("Informe um month válido entre 1 e 12");
  }
  if (!year || year < 1900) {
    throw new Error("Informe um year válido");
  }

  const where = {
    purchaseDate: { gte: startOfMonthUTC(year, month), lte: endOfMonthUTC(year, month) },
    isArchived: false,
    ...(category
      ? {
          Category: {
            name: {
              equals: category,
              mode: "insensitive" as const,
            },
          },
        }
      : {}),
  };

  const txs = await prisma.transaction.findMany({
    where,
    include: { Category: true, Account: true },
    orderBy: [{ purchaseDate: "asc" }, { createdAt: "asc" }],
  });

  const byType = new Map<string, number>();
  const byCategory = new Map<string, number>();
  const byAccount = new Map<string, number>();

  for (const tx of txs) {
    const amount = Number(tx.amount);
    byType.set(tx.type, (byType.get(tx.type) ?? 0) + amount);
    const categoryName = tx.Category?.name ?? "Sem categoria";
    byCategory.set(categoryName, (byCategory.get(categoryName) ?? 0) + amount);
    byAccount.set(tx.Account.name, (byAccount.get(tx.Account.name) ?? 0) + amount);
  }

  const income = byType.get("INCOME") ?? 0;
  const expense = byType.get("EXPENSE") ?? 0;
  const payment = byType.get("PAYMENT") ?? 0;
  const transfer = byType.get("TRANSFER") ?? 0;

  const totalOutflow = expense + payment + transfer;
  const balance = income - totalOutflow;

  const summary = {
    month: `${year}-${String(month).padStart(2, "0")}`,
    categoryFilter: category ?? null,
    transactionCount: txs.length,
    byType: Object.fromEntries(
      [...byType.entries()].map(([key, value]) => [key, formatMoney(value)]),
    ),
    balance: formatMoney(balance),
    totalIncome: formatMoney(income),
    totalExpense: formatMoney(expense),
    totalPayments: formatMoney(payment),
    totalTransfers: formatMoney(transfer),
    byCategory: Object.fromEntries(
      [...byCategory.entries()].sort((a, b) => b[1] - a[1]).map(([key, value]) => [key, formatMoney(value)]),
    ),
    byAccount: Object.fromEntries(
      [...byAccount.entries()].sort((a, b) => b[1] - a[1]).map(([key, value]) => [key, formatMoney(value)]),
    ),
    items: txs.map((tx) => ({
      date: tx.purchaseDate.toISOString().slice(0, 10),
      description: tx.description,
      amount: formatMoney(Number(tx.amount)),
      type: tx.type,
      category: tx.Category?.name ?? null,
      account: tx.Account.name,
    })),
  };

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
