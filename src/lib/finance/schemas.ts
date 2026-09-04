import { z } from "zod";

export const accountTypeSchema = z.enum(["checking", "savings", "digital", "investment", "crypto", "wallet", "credit-card"]);
export const transactionTypeSchema = z.enum(["income", "expense", "transfer"]);
export const creditCardInputSchema = z.object({
  name: z.string().trim().min(2).max(80),
  last4: z.string().regex(/^\d{4}$/),
  brand: z.enum(["Visa", "Mastercard", "Elo", "Amex"]),
  color: z.enum(["ocean", "forest", "plum", "sunset", "graphite"]).default("ocean"),
  limit: z.number().positive().finite(),
  closingDay: z.number().int().min(1).max(31),
  dueDay: z.number().int().min(1).max(31),
});
export const transactionStatusSchema = z.enum(["planned", "completed"]);

export const accountInputSchema = z.object({
  name: z.string().trim().min(2).max(80),
  type: accountTypeSchema,
  balance: z.number().finite().default(0),
  color: z.string().trim().max(30).default("mint"),
  icon: z.string().trim().max(30).default("bank"),
  currency: z.literal("BRL").default("BRL"),
  createAdjustment: z.boolean().default(true).optional(),
});

export const transactionInputSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  payee: z.string().trim().min(1).max(120),
  category: z.string().trim().min(1).max(80),
  accountId: z.string().trim().min(1).max(120),
  destinationAccountId: z.string().trim().max(120).optional(),
  amount: z.number().positive().finite(),
  type: transactionTypeSchema,
  status: transactionStatusSchema.default("completed"),
  sourceType: z.enum(["account", "credit-card"]).default("account"),
  sourceId: z.string().trim().max(120).optional(),
  invoiceId: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export const categoryInputSchema = z.object({
  name: z.string().trim().min(2).max(80),
  type: z.enum(["income", "expense"]),
  tone: z.enum(["mint", "blue", "lavender", "peach", "coral"]).default("blue"),
  active: z.boolean().default(true),
});

export const goalInputSchema = z.object({
  name: z.string().trim().min(2).max(100),
  targetAmount: z.number().positive().finite(),
  currentAmount: z.number().nonnegative().finite().default(0),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  color: z.string().trim().max(30).default("mint"),
});

export const budgetInputSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  categoryId: z.string().trim().min(1).max(120),
  limitAmount: z.number().nonnegative().finite(),
});

export type AccountInput = z.infer<typeof accountInputSchema>;
export type CreditCardInput = z.infer<typeof creditCardInputSchema>;
export type TransactionInput = z.infer<typeof transactionInputSchema>;
export type CategoryInput = z.infer<typeof categoryInputSchema>;
export type GoalInput = z.infer<typeof goalInputSchema>;
export type BudgetInput = z.infer<typeof budgetInputSchema>;

export const normalizedCollections = {
  accounts: "accounts",
  transactions: "transactions",
  categories: "categories",
  goals: "goals",
  budgets: "budgets",
  creditCards: "creditCards",
} as const;
