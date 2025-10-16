import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { useIndividualUser, useLegalEntityUser } from "./user";

export interface Transaction {
  id: string;
  date: string; // ISO string
  description: string;
  amount: number; // positive for credit, negative for debit
  method: "pix" | "boleto" | "cartao" | "deposito" | "saque" | "outro";
};

const STORAGE_KEY = "agipay:transactions";
const BALANCE_PIN_KEY = "agipay:balance_pin_5000";
/*
// 1. Matriz de demonstração agora vazia.
const initialSeed: Transaction[] = []; // Alterado para array vazio

function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Transaction[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  // 2. Garante que, se não houver dados, o retorno seja uma lista vazia.
  return []; 
}
*/
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
  const { user: individualUser } = useIndividualUser();
  const { user: legalEntityUser } = useLegalEntityUser();
  const token = individualUser?.token || legalEntityUser?.token;
  const [transactions, setTransactions] = useState<Transaction[]>(() => []);

  // One-time adjustment to set initial balance to R$ 5.000,00 for the demo
  useEffect(() => {
    try {
      const pinned = true;
      if (!pinned) {
        const initialBalance = transactions.reduce((acc, t) => acc + t.amount, 0);
        // O delta será 5000 se transactions for vazio
        const delta = 5000 - initialBalance;
        if (Math.abs(delta) > 0.005) {
          const id = typeof crypto !== "undefined" && (crypto as any)?.randomUUID ? (crypto as any).randomUUID() : Math.random().toString(36).slice(2);
          const adj: Transaction = { id, date: new Date().toISOString(), description: "Ajuste de saldo inicial", amount: delta, method: "deposito" };
          setTransactions((prev) => [adj, ...prev]);
        }
        localStorage.setItem(BALANCE_PIN_KEY, "1");
     }
    } catch {}
    // run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveTransaction = useCallback(async (transaction: Transaction) => {
    // Implemente a lógica para salvar a transação no backend
    // Use o token para autenticar a requisição
    console.log("Salvando transação:", transaction);
    console.log("Token:", token);
  }, [token]);

  useEffect(() => {
    transactions.forEach(transaction => {
      saveTransaction(transaction);
    });
  }, [transactions, saveTransaction]);

  const addTransaction = useCallback((input: Omit<Transaction, "id" | "date"> & { date?: string }) => {
    const id = crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    const date = input.date ?? new Date().toISOString();
    const newTransaction: Transaction = {
      ...input,
      id,
      date,
      amount: Number(input.amount) // Garante que o valor seja numérico
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  }, []);

  // clearAll ajustado para usar a nova lógica de seed vazia
  const clearAll = useCallback(() => {
  }, []);
  const balance = useMemo(() => transactions.reduce((acc, t) => acc + t.amount, 0), [transactions]);

  const value = useMemo(() => ({ transactions, addTransaction, clearAll, balance }), [transactions, addTransaction, clearAll, balance]);

  return <TransactionsContext.Provider value={value}>{children}</TransactionsContext.Provider>;
}

export function useTransactions() {
  const ctx = useContext(TransactionsContext);
  if (!ctx) throw new Error("useTransactions must be used within TransactionsProvider");
  return ctx;
}