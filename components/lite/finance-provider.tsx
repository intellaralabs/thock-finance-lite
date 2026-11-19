"use client";

import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from "react";
import {
  accounts as initialAccounts,
  budgets as initialBudgets,
  transactions as initialTransactions,
  type Account,
  type Budget,
  type CategoryId,
  type Transaction,
} from "@/data/finance";
import { formatMoney, type Currency, type MoneyOptions } from "@/lib/finance";

/*
 * All app state lives here, in memory. To connect a real backend, load the initial state from your
 * API and send each action there as well as to the reducer (optimistic UI). Screens only use the
 * useFinance() hook, so they don't need to change.
 */

type State = {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  currency: Currency;
  /** Privacy mode: balances show as •••• */
  hidden: boolean;
};

type TxPatch = Partial<Pick<Transaction, "category" | "reviewed" | "note">>;

type Action =
  | { type: "add-transaction"; tx: Transaction }
  | { type: "update-transactions"; ids: string[]; patch: TxPatch }
  | { type: "set-budget"; budget: Budget }
  | { type: "remove-budget"; category: CategoryId }
  | { type: "currency"; currency: Currency }
  | { type: "hidden"; hidden: boolean };

const round2 = (n: number) => Math.round(n * 100) / 100;

let nextId = 1;

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "add-transaction":
      return {
        ...state,
        transactions: [action.tx, ...state.transactions].sort((a, b) => b.date.localeCompare(a.date)),
        // Money in raises the balance; on a card it lowers what you owe.
        accounts: state.accounts.map((a) => (a.id === action.tx.account ? { ...a, balance: round2(a.balance + action.tx.amount) } : a)),
      };
    case "update-transactions": {
      const ids = new Set(action.ids);
      // A new category replaces any split.
      const extra = action.patch.category ? { splits: undefined } : {};
      return { ...state, transactions: state.transactions.map((t) => (ids.has(t.id) ? { ...t, ...action.patch, ...extra } : t)) };
    }
    case "set-budget": {
      const exists = state.budgets.some((b) => b.category === action.budget.category);
      return {
        ...state,
        budgets: exists ? state.budgets.map((b) => (b.category === action.budget.category ? action.budget : b)) : [...state.budgets, action.budget],
      };
    }
    case "remove-budget":
      return { ...state, budgets: state.budgets.filter((b) => b.category !== action.category) };
    case "currency":
      return { ...state, currency: action.currency };
    case "hidden":
      return { ...state, hidden: action.hidden };
  }
}

type FinanceContext = State & {
  /** Formats money in the chosen currency, masked in privacy mode unless `always` is set. */
  money: (n: number, o?: MoneyOptions) => string;
  account: (id: string) => Account | undefined;
  addTransaction: (tx: Omit<Transaction, "id">) => void;
  updateTransactions: (ids: string[], patch: TxPatch) => void;
  setBudget: (b: Budget) => void;
  removeBudget: (category: CategoryId) => void;
  setCurrency: (c: Currency) => void;
  setHidden: (h: boolean) => void;
};

const Ctx = createContext<FinanceContext | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    accounts: initialAccounts,
    transactions: initialTransactions,
    budgets: initialBudgets,
    currency: "USD",
    hidden: false,
  });

  const money = useCallback(
    (n: number, o: MoneyOptions = {}) => (state.hidden && !o.always ? "••••" : formatMoney(n, state.currency, o)),
    [state.hidden, state.currency],
  );

  const value = useMemo<FinanceContext>(
    () => ({
      ...state,
      money,
      account: (id) => state.accounts.find((a) => a.id === id),
      addTransaction: (tx) => dispatch({ type: "add-transaction", tx: { ...tx, id: `t-live-${nextId++}` } }),
      updateTransactions: (ids, patch) => dispatch({ type: "update-transactions", ids, patch }),
      setBudget: (budget) => dispatch({ type: "set-budget", budget }),
      removeBudget: (category) => dispatch({ type: "remove-budget", category }),
      setCurrency: (currency) => dispatch({ type: "currency", currency }),
      setHidden: (hidden) => dispatch({ type: "hidden", hidden }),
    }),
    [state, money],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFinance() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFinance must be used inside <FinanceProvider>");
  return ctx;
}
