export type TransactionType = "EXPENSE" | "INCOME" | "PAYMENT";
export type AccountType = "CREDIT_CARD" | "CHECKING_ACCOUNT" | "CASH";
export type CategoryType = "EXPENSE" | "INCOME" | "TRANSFER" | "PAYMENT";
export type SplitType = "SHARED" | "INDIVIDUAL" | "SHARED_PROPORTIONAL";
export type InvoiceStatus = "OPEN" | "CLOSED" | "PAID";

export interface User {
  id: string;
  name: string;
  email?: string | null;
}

export interface Account {
  id: string;
  name: string;
  type: string; // Using string to match Prisma default, but logically AccountType
  bankName?: string | null;
  balance: number; // Decimal in Prisma is usually string/number in JS
  limit?: number | null;
  dueDay?: number | null;
  closingDay?: number | null;
  userId?: string | null;
  Invoice?: Invoice[];
}

export interface Category {
  id: string;
  name: string;
  type: string;
  icon?: string | null;
}

export interface Invoice {
  id: string;
  month: number;
  year: number;
  dueDate: Date;
  closingDate: Date;
  status: string; // InvoiceStatus
  amount: number;
  accountId: string;
}

export interface Transaction {
  id: string;
  description: string;
  originalDesc?: string | null;
  amount: number;
  purchaseDate: Date;
  paymentDate?: Date | null;
  type: string; // TransactionType
  installment?: number | null;
  totalInstallments?: number | null;
  installmentId?: string | null;
  isReconciled: boolean;
  isManual: boolean;
  settled: boolean; // Added based on schema
  categoryId: string;
  accountId: string;
  invoiceId?: string | null;
  payerId: string;
  splitType: string; // SplitType
  splitShare?: number | null; // Added for SHARED_PROPORTIONAL
  ownerId?: string | null;

  // Relations used in UI
  Category?: Category;
  Account?: Account;
  Invoice?: Invoice;
  payer?: User;
}

export interface SettlementDebt {
  amount: number;
  creditorName: string;
}

export interface SettlementData {
  total: number;
  debtorName: string | null;
  creditorName: string | null;
  breakdown: {
    sharedFiftyFifty: number; // 50/50 division
    sharedProportional: number; // Custom division
    individualPaidByOther: number; // Individual items paid by partner
  };
}

export interface FairnessData {
  userA: { name: string; paid: number; shouldHavePaid: number };
  userB: { name: string; paid: number; shouldHavePaid: number };
}

export interface DashboardMetrics {
  totalBalance: number;
  currentMonthExpenses: number;
  openInvoices: number;
  nextInvoice?: {
    amount: number;
    daysUntilDue: number;
    bankName: string;
    dueDate: Date;
  } | null;
  overdueCount: number;
  settlement: SettlementData;
  fairness: FairnessData;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  recentTransactions: Transaction[];
  categoryExpenses: { name: string; value: number }[];
  evolutionData: { month: string; expenses: number; income: number }[];
  accounts: Account[];
  categories: Category[];
  users: User[];
}
