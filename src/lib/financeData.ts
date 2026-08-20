export type TransactionStatus = "planned" | "completed";

export type Transaction = {
  id?: string;
  date: string;
  dateISO?: string;
  payee: string;
  category: string;
  account: string;
  destinationAccount?: string;
  sourceType?: "account" | "credit-card";
  sourceId?: string;
  invoiceId?: string;
  amount: number;
  type: "income" | "expense" | "transfer";
  status?: TransactionStatus;
  settled?: boolean;
};

export type CardBrand = "Visa" | "Mastercard" | "Elo" | "Amex";
export type CardColor = "ocean" | "forest" | "plum" | "sunset" | "graphite";

export type CreditCard = {
  id: string;
  name: string;
  last4: string;
  brand: CardBrand;
  color: CardColor;
  balance: string;
  dueDate: string;
  limit: number;
  closingDay: number;
  dueDay: number;
};

export type Account = {
  id?: string;
  name: string;
  number?: string;
  value?: string;
  balance: number;
  locked?: boolean;
  type?: string;
  tone?: "mint" | "lavender" | "peach" | "blue";
};

export type VehicleProfile = {
  type: "car" | "motorcycle";
  manufacturer: string;
  model: string;
  year: number;
  fuel: "Gasolina" | "Etanol" | "Diesel";
  city: string;
};

export type FinanceCategory = {
  id: string;
  name: string;
  type: "income" | "expense";
  tone: "mint" | "blue" | "lavender" | "peach" | "coral";
  active: boolean;
  usage: number;
};

export const defaultFinanceCategories: FinanceCategory[] = [
  { id: "expense-alimentacao", name: "Alimentação", type: "expense", tone: "peach", active: true, usage: 0 },
  { id: "expense-moradia", name: "Moradia", type: "expense", tone: "blue", active: true, usage: 0 },
  { id: "expense-transporte", name: "Transporte", type: "expense", tone: "lavender", active: true, usage: 0 },
  { id: "expense-saude", name: "Saúde", type: "expense", tone: "mint", active: true, usage: 0 },
  { id: "expense-educacao", name: "Educação", type: "expense", tone: "blue", active: true, usage: 0 },
  { id: "expense-lazer", name: "Lazer", type: "expense", tone: "coral", active: true, usage: 0 },
  { id: "expense-compras", name: "Compras", type: "expense", tone: "lavender", active: true, usage: 0 },
  { id: "expense-servicos", name: "Serviços", type: "expense", tone: "mint", active: true, usage: 0 },
  { id: "expense-assinaturas", name: "Assinaturas", type: "expense", tone: "blue", active: true, usage: 0 },
  { id: "expense-impostos", name: "Impostos", type: "expense", tone: "coral", active: true, usage: 0 },
  { id: "income-salario", name: "Salário", type: "income", tone: "mint", active: true, usage: 0 },
  { id: "income-freelance", name: "Freelance", type: "income", tone: "blue", active: true, usage: 0 },
  { id: "income-investimentos", name: "Investimentos", type: "income", tone: "lavender", active: true, usage: 0 },
  { id: "income-reembolso", name: "Reembolso", type: "income", tone: "peach", active: true, usage: 0 },
  { id: "income-vendas", name: "Vendas", type: "income", tone: "mint", active: true, usage: 0 },
  { id: "income-bonus", name: "Bônus", type: "income", tone: "blue", active: true, usage: 0 },
  { id: "income-presente", name: "Presente", type: "income", tone: "lavender", active: true, usage: 0 },
  { id: "income-outras", name: "Outras receitas", type: "income", tone: "coral", active: true, usage: 0 },
];

export function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 }).format(value);
}

export function formatCompactBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact", maximumFractionDigits: 1 }).format(value);
}
