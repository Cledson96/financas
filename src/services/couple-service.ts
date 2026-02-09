import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";

export interface SettlementBreakdown {
  sharedFiftyFifty: number;
  sharedProportional: number;
  individual: number;
  transfer: number; // New: track transfers explicitly
}

export interface SettlementResult {
  p1: { id: string; name: string };
  p2: { id: string; name: string };
  summary: {
    payer: "p1" | "p2" | null; // Who pays?
    amount: number; // How much?
  };
  breakdown: SettlementBreakdown;
}

export class CoupleService {
  static async getNetWorth(
    month: number,
    year: number,
  ): Promise<SettlementResult | null> {
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));

    const config = await prisma.householdConfig.findFirst({
      include: {
        User_HouseholdConfig_partner1IdToUser: true,
        User_HouseholdConfig_partner2IdToUser: true,
      },
    });
    if (!config) return null;

    const p1 = config.User_HouseholdConfig_partner1IdToUser;
    const p2 = config.User_HouseholdConfig_partner2IdToUser;
    const p1Share = Number(config.partner1Share);
    const p2Share = 1 - p1Share;

    const transactions = await prisma.transaction.findMany({
      where: {
        purchaseDate: {
          gte: startDate,
          lte: endDate,
        },
        type: {
          in: ["EXPENSE", "TRANSFER"],
        },
      },
    });

    // We track how much P2 OWES P1 (positive) or P1 OWES P2 (negative)
    // Detailed breakdown of DEBT.
    // Ideally we want: "Total Debt of Debtor".

    let p1PaidForP2_Shared = 0;
    let p1PaidForP2_Prop = 0;
    let p1PaidForP2_Ind = 0;
    let p1PaidForP2_Transfer = 0; // P1 sent money to P2 = reduces P2's debt to P1 (or increases P1's debt to P2)
    // Actually, TRANSFER represents SETTLEMENT.
    // If P1 sends 100 to P2, P1 "paid" 100 "for" P2 (gave cash).
    // So distinct from expense.

    let p2PaidForP1_Shared = 0;
    let p2PaidForP1_Prop = 0;
    let p2PaidForP1_Ind = 0;
    let p2PaidForP1_Transfer = 0; // P2 sent money to P1

    for (const t of transactions) {
      const amount = Number(t.amount);

      if (t.type === "TRANSFER") {
        if (t.payerId === p1.id) p1PaidForP2_Transfer += amount;
        else if (t.payerId === p2.id) p2PaidForP1_Transfer += amount;
        continue;
      }

      // EXPENSES
      // Logic: specific value owed by the OTHER person
      if (t.splitType === "INDIVIDUAL") {
        if (t.ownerId === p2.id && t.payerId === p1.id) {
          p1PaidForP2_Ind += amount;
        } else if (t.ownerId === p1.id && t.payerId === p2.id) {
          p2PaidForP1_Ind += amount;
        }
      } else if (t.splitType === "SHARED") {
        if (t.payerId === p1.id) {
          p1PaidForP2_Shared += amount * 0.5;
        } else if (t.payerId === p2.id) {
          p2PaidForP1_Shared += amount * 0.5;
        }
      } else if (t.splitType === "SHARED_PROPORTIONAL") {
        const otherOwesPct = t.splitShare
          ? Number(t.splitShare)
          : t.payerId === p1.id
            ? p2Share
            : p1Share;

        if (t.payerId === p1.id) {
          p1PaidForP2_Prop += amount * otherOwesPct;
        } else if (t.payerId === p2.id) {
          p2PaidForP1_Prop += amount * otherOwesPct;
        }
      }
    }

    // Total P1 Credited to Relation (What P1 paid that helps P2)
    const totalP1Credit =
      p1PaidForP2_Shared +
      p1PaidForP2_Prop +
      p1PaidForP2_Ind +
      p1PaidForP2_Transfer;
    // Total P2 Credited to Relation
    const totalP2Credit =
      p2PaidForP1_Shared +
      p2PaidForP1_Prop +
      p2PaidForP1_Ind +
      p2PaidForP1_Transfer;

    const net = totalP1Credit - totalP2Credit;
    // If net > 0, P1 has more credit, so P2 owes P1.
    // If net < 0, P2 has more credit, so P1 owes P2.

    const summary = {
      payer: net !== 0 ? ((net > 0 ? "p2" : "p1") as "p1" | "p2") : null,
      amount: Math.abs(net),
    };

    // Breakdown for the DEBTOR (What composes the debt?)
    // This is tricky because it's a net balance.
    // We should probably just return the raw totals and let UI calculate net breakdown?
    // OR return the net diff per category?
    // Let's return the NET per category for simplicity of the UI
    // (e.g. Shared: P1 paid 100 (50 owed), P2 paid 50 (25 owed). Net Shared Debt: P2 owes 25.)

    // Calculate Nets per category (Positive = P2 owes P1)
    const netShared = p1PaidForP2_Shared - p2PaidForP1_Shared;
    const netProp = p1PaidForP2_Prop - p2PaidForP1_Prop;
    const netInd = p1PaidForP2_Ind - p2PaidForP1_Ind;
    const netTransfer = p1PaidForP2_Transfer - p2PaidForP1_Transfer;

    // But wait, the UI expects "Breakdown of the TOTAL debt".
    // If the final payer is P2 (Net > 0), we want to show positive numbers explaining WHY P2 pays.
    // If final payer is P1 (Net < 0), we want positive numbers explaining WHY P1 pays.

    const sign = summary.payer === "p2" ? 1 : -1;

    return {
      p1: { id: p1.id, name: p1.name },
      p2: { id: p2.id, name: p2.name },
      summary,
      breakdown: {
        sharedFiftyFifty: netShared * sign,
        sharedProportional: netProp * sign,
        individual: netInd * sign,
        transfer: netTransfer * sign, // Usually negative (reduces debt) but we handle it
      },
    };
  }

  static async listSharedTransactions(month: number, year: number) {
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));

    const config = await prisma.householdConfig.findFirst({
      select: {
        partner1Id: true,
        partner2Id: true,
      },
    });

    if (!config) return [];

    const transactions = await prisma.transaction.findMany({
      where: {
        purchaseDate: {
          gte: startDate,
          lte: endDate,
        },
        // We fetch broadly and filter in memory to match getNetWorth logic complex conditions
      },
      include: {
        User_Transaction_payerIdToUser: {
          select: { id: true, name: true },
        },
        User_Transaction_ownerIdToUser: {
          select: { id: true, name: true },
        },
        Category: {
          select: { id: true, name: true, icon: true },
        },
      },
      orderBy: {
        purchaseDate: "desc",
      },
    });

    // Apply the "Couple Filter"
    return transactions.filter((t) => {
      // 1. Transfers are always relevant (Settlements)
      if (t.type === "TRANSFER") return true;

      // 2. Shared Expenses are always relevant
      if (t.splitType === "SHARED" || t.splitType === "SHARED_PROPORTIONAL")
        return true;

      // 3. Individual Expenses ONLY if paid by the other person (Debt)
      // If I pay for myself, it's not a couple matter.
      if (t.splitType === "INDIVIDUAL") {
        return t.payerId !== t.ownerId;
      }

      return false;
    });
  }
}
