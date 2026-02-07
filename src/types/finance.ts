export type TransactionType = "EXPENSE" | "INCOME" | "PAYMENT";
export type AccountType = "CREDIT_CARD" | "CHECKING_ACCOUNT" | "CASH";
export type CategoryType = "EXPENSE" | "INCOME" | "TRANSFER" | "PAYMENT";
export type SplitType = "SHARED" | "INDIVIDUAL";
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
  ownerId?: string | null;

  // Relations used in UI
  Category?: Category;
  Account?: Account;
  Invoice?: Invoice;
  payer?: User;
}

export interface DashboardMetrics {
  totalBalance: number;
  currentMonthExpenses: number;
  openInvoices: number;
  overdueCount: number;
  settlement: {
    amount: number;
    debtorName: string | null; // Who owes the money?
    creditorName: string | null; // Who receives the money?
  };
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
