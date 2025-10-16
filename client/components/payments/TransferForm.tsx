import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export type Transaction = {
  id: string;
  date: string; // ISO string
  description: string;
  amount: number; // positive credit, negative debit
  method: "pix" | "boleto" | "cartao" | "deposito" | "outro" |"withdraw";
};

const STORAGE_KEY = "agipay:transactions";
const BALANCE_PIN_KEY = "agipay:balance_pin_5000";

const initialSeed: Transaction[] = [
  { id: "1", date: "2025-09-10T09:00:00.000Z", description: "Depósito inicial", amount: 6000.0, method: "deposito" },
  { id: "2", date: "2025-09-10T09:30:00.000Z", description: "PIX - João Silva", amount: -150.0, method: "pix" },
  { id: "4", date: "2025-09-10T11:00:00.000Z", description: "Boleto - Luz", amount: -200.0, method: "boleto" },
  { id: "5", date: "2025-09-10T12:00:00.000Z", description: "Cartão - Supermercado", amount: -350.0, method: "cartao" },
];

function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Transaction[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return initialSeed;
}

function saveTransactions(txs: Transaction[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(txs));
  } catch {}
}

export type TransactionsContextValue = {
  transactions: Transaction[];
  balance: number;
  addTransaction: (input: Omit<Transaction, "id" | "date"> & { date?: string }) => void;
  clearAll: () => void;
};

const TransactionsContext = createContext<TransactionsContextValue | null>(null);

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadTransactions());

  // One-time adjustment to set initial balance to R$ 5.000,00 for the demo
  useEffect(() => {
    try {
      const pinned = localStorage.getItem(BALANCE_PIN_KEY);
      if (!pinned) {
        const initialBalance = transactions.reduce((acc, t) => acc + t.amount, 0);
        const delta = 5000 - initialBalance;
        if (Math.abs(delta) > 0.005) {
          const id = typeof crypto !== "undefined" && (crypto as any)?.randomUUID ? (crypto as any).randomUUID() : Math.random().toString(36).slice(2);
          const adj: Transaction = { id, date: new Date().toISOString(), description: "Ajuste de saldo", amount: delta, method: "outro" };
          setTransactions((prev) => [adj, ...prev]);
        }
        localStorage.setItem(BALANCE_PIN_KEY, "1");
      }
    } catch {}
    // run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  const addTransaction = useCallback((input: Omit<Transaction, "id" | "date"> & { date?: string }) => {
    const id = crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    const date = input.date ?? new Date().toISOString();
    setTransactions((prev) => [{ id, date, description: input.description, amount: input.amount, method: input.method }, ...prev]);
  }, []);

  const clearAll = useCallback(() => setTransactions([]), []);

  const balance = useMemo(() => transactions.reduce((acc, t) => acc + t.amount, 0), [transactions]);

  const value = useMemo(() => ({ transactions, addTransaction, clearAll, balance }), [transactions, addTransaction, clearAll, balance]);

  return <TransactionsContext.Provider value={value}>{children}</TransactionsContext.Provider>;
}

export function useTransactions() {
  const ctx = useContext(TransactionsContext);
  if (!ctx) throw new Error("useTransactions must be used within TransactionsProvider");
  return ctx;
}
