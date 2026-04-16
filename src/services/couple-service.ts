import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";

export interface SettlementBreakdown {
  sharedFiftyFifty: number;
  sharedProportional: number;
  individual: number;
  transfer: number;
}

export interface SettlementResult {
  p1: { id: string; name: string };
  p2: { id: string; name: string };
  summary: {
    payer: "p1" | "p2" | null;
    amount: number;
  };
  breakdown: SettlementBreakdown;
}

// Cache household config in-memory for the duration of a request batch
// (both getNetWorth and listSharedTransactions need it in the same call)
let _configCache: {
  partner1Id: string;
  partner2Id: string;
  partner1Share: number;
  p1Name: string;
  p1Id: string;
  p2Name: string;
  p2Id: string;
} | null = null;

async function getHouseholdConfig() {
  if (_configCache) return _configCache;

  const config = await prisma.householdConfig.findFirst({
    select: {
      partner1Id: true,
      partner2Id: true,
      partner1Share: true,
      User_HouseholdConfig_partner1IdToUser: { select: { id: true, name: true } },
      User_HouseholdConfig_partner2IdToUser: { select: { id: true, name: true } },
    },
  });

  if (!config) return null;

  _configCache = {
    partner1Id: config.partner1Id,
    partner2Id: config.partner2Id,
    partner1Share: Number(config.partner1Share),
    p1Name: config.User_HouseholdConfig_partner1IdToUser.name,
    p1Id: config.User_HouseholdConfig_partner1IdToUser.id,
    p2Name: config.User_HouseholdConfig_partner2IdToUser.name,
    p2Id: config.User_HouseholdConfig_partner2IdToUser.id,
  };

  return _configCache;
}

export function clearConfigCache() {
  _configCache = null;
}

export class CoupleService {
  static async getNetWorth(
    month: number,
    year: number,
  ): Promise<SettlementResult | null> {
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));

    const config = await getHouseholdConfig();
    if (!config) return null;

    const { partner1Id, partner2Id, partner1Share, p1Name, p1Id, p2Name, p2Id } = config;
    const p2Share = 1 - partner1Share;

    // Fetch only the columns we need, filtered at DB level
    const transactions = await prisma.transaction.findMany({
      where: {
        purchaseDate: { gte: startDate, lte: endDate },
        type: { in: ["EXPENSE", "TRANSFER"] },
        splitType: { in: ["SHARED", "SHARED_PROPORTIONAL", "INDIVIDUAL"] },
        payerId: { in: [partner1Id, partner2Id] },
      },
      select: {
        amount: true,
        payerId: true,
        ownerId: true,
        type: true,
        splitType: true,
        splitShare: true,
      },
    });

    let p1PaidForP2_Shared = 0;
    let p1PaidForP2_Prop = 0;
    let p1PaidForP2_Ind = 0;
    let p1PaidForP2_Transfer = 0;

    let p2PaidForP1_Shared = 0;
    let p2PaidForP1_Prop = 0;
    let p2PaidForP1_Ind = 0;
    let p2PaidForP1_Transfer = 0;

    for (const t of transactions) {
      const amount = Number(t.amount);

      if (t.type === "TRANSFER") {
        if (t.payerId === partner1Id) p1PaidForP2_Transfer += amount;
        else if (t.payerId === partner2Id) p2PaidForP1_Transfer += amount;
        continue;
      }

      if (t.splitType === "INDIVIDUAL") {
        if (t.ownerId === partner2Id && t.payerId === partner1Id) {
          p1PaidForP2_Ind += amount;
        } else if (t.ownerId === partner1Id && t.payerId === partner2Id) {
          p2PaidForP1_Ind += amount;
        }
      } else if (t.splitType === "SHARED") {
        if (t.payerId === partner1Id) {
          p1PaidForP2_Shared += amount * 0.5;
        } else if (t.payerId === partner2Id) {
          p2PaidForP1_Shared += amount * 0.5;
        }
      } else if (t.splitType === "SHARED_PROPORTIONAL") {
        const otherOwesPct = t.splitShare
          ? Number(t.splitShare)
          : t.payerId === partner1Id
            ? p2Share
            : partner1Share;

        if (t.payerId === partner1Id) {
          p1PaidForP2_Prop += amount * otherOwesPct;
        } else if (t.payerId === partner2Id) {
          p2PaidForP1_Prop += amount * otherOwesPct;
        }
      }
    }

    const totalP1Credit =
      p1PaidForP2_Shared + p1PaidForP2_Prop + p1PaidForP2_Ind + p1PaidForP2_Transfer;
    const totalP2Credit =
      p2PaidForP1_Shared + p2PaidForP1_Prop + p2PaidForP1_Ind + p2PaidForP1_Transfer;

    const net = totalP1Credit - totalP2Credit;

    const summary = {
      payer: net !== 0 ? ((net > 0 ? "p2" : "p1") as "p1" | "p2") : null,
      amount: Math.abs(net),
    };

    const sign = summary.payer === "p2" ? 1 : -1;

    return {
      p1: { id: p1Id, name: p1Name },
      p2: { id: p2Id, name: p2Name },
      summary,
      breakdown: {
        sharedFiftyFifty: (p1PaidForP2_Shared - p2PaidForP1_Shared) * sign,
        sharedProportional: (p1PaidForP2_Prop - p2PaidForP1_Prop) * sign,
        individual: (p1PaidForP2_Ind - p2PaidForP1_Ind) * sign,
        transfer: (p1PaidForP2_Transfer - p2PaidForP1_Transfer) * sign,
      },
    };
  }

  static async listSharedTransactions(month: number, year: number) {
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));

    const config = await getHouseholdConfig();
    if (!config) return [];

    const { partner1Id, partner2Id } = config;

    // Run targeted queries in parallel instead of fetching ALL transactions
    const [transfers, sharedExpenses, crossPaidIndividual] = await Promise.all([
      // 1. Transfers between partners (always relevant)
      prisma.transaction.findMany({
        where: {
          purchaseDate: { gte: startDate, lte: endDate },
          type: "TRANSFER",
          payerId: { in: [partner1Id, partner2Id] },
        },
        select: transactionSelect,
        orderBy: { purchaseDate: "desc" },
      }),
      // 2. Shared & proportional expenses paid by either partner
      prisma.transaction.findMany({
        where: {
          purchaseDate: { gte: startDate, lte: endDate },
          type: "EXPENSE",
          splitType: { in: ["SHARED", "SHARED_PROPORTIONAL"] },
          payerId: { in: [partner1Id, partner2Id] },
        },
        select: transactionSelect,
        orderBy: { purchaseDate: "desc" },
      }),
      // 3. Individual expenses where one partner paid for the other
      //    DB narrows to partner-related, JS filters payerId !== ownerId
      prisma.transaction.findMany({
        where: {
          purchaseDate: { gte: startDate, lte: endDate },
          type: "EXPENSE",
          splitType: "INDIVIDUAL",
          payerId: { in: [partner1Id, partner2Id] },
          ownerId: { in: [partner1Id, partner2Id] },
        },
        select: transactionSelect,
        orderBy: { purchaseDate: "desc" },
      }),
    ]);

    // Filter cross-paid individual (payerId !== ownerId)
    const filteredIndividual = crossPaidIndividual.filter(
      (t) => t.payerId !== t.ownerId,
    );

    // Combine and sort by date descending
    const all = [...transfers, ...sharedExpenses, ...filteredIndividual];
    all.sort(
      (a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime(),
    );

    return all;
  }
}

// Shared select object for transaction list queries
const transactionSelect = {
  id: true,
  description: true,
  amount: true,
  purchaseDate: true,
  type: true,
  splitType: true,
  installment: true,
  totalInstallments: true,
  payerId: true,
  ownerId: true,
  User_Transaction_payerIdToUser: { select: { id: true, name: true } },
  User_Transaction_ownerIdToUser: { select: { id: true, name: true } },
  Category: { select: { id: true, name: true, icon: true } },
} as const;
