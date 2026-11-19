import { categoryById, today, type Account, type Budget, type CategoryId, type Transaction } from "@/data/finance";

/* ------------------------------------------------------------------ money */

export type Currency = "USD" | "EUR" | "GBP" | "CAD" | "AUD";

export const currencies: { value: Currency; label: string }[] = [
  { value: "USD", label: "US dollar ($)" },
  { value: "EUR", label: "Euro (€)" },
  { value: "GBP", label: "British pound (£)" },
  { value: "CAD", label: "Canadian dollar (CA$)" },
  { value: "AUD", label: "Australian dollar (A$)" },
];

export type MoneyOptions = {
  /** Show a + for positive amounts. */
  sign?: boolean;
  /** Drop the cents. */
  whole?: boolean;
  /** 12.4K style. */
  compact?: boolean;
  /** Ignore "hide balances" (e.g. for inputs and budgets you set yourself). */
  always?: boolean;
};

const formatters = new Map<string, Intl.NumberFormat>();
function nf(currency: Currency, o: MoneyOptions) {
  const key = `${currency}-${o.whole ? 1 : 0}-${o.compact ? 1 : 0}`;
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      notation: o.compact ? "compact" : "standard",
      maximumFractionDigits: o.compact ? 1 : o.whole ? 0 : 2,
      minimumFractionDigits: o.compact || o.whole ? 0 : 2,
    });
    formatters.set(key, f);
  }
  return f;
}

/** Formats an amount in the chosen currency. Use `useFinance().money` in components (it knows the currency and privacy mode). */
export function formatMoney(n: number, currency: Currency, o: MoneyOptions = {}) {
  const s = nf(currency, o).format(Math.abs(n));
  return n < 0 ? `−${s}` : o.sign && n > 0 ? `+${s}` : s;
}

/* ------------------------------------------------------------------ dates */

const utc = (d: string) => new Date(`${d}T00:00:00Z`);
const dateFormats = {
  short: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
  long: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }),
  weekday: new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" }),
  month: new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }),
  monthYear: new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }),
};

export const formatDate = (d: string, style: keyof typeof dateFormats = "short") => dateFormats[style].format(utc(d));

/** "YYYY-MM" of a date. */
export const monthOf = (d: string) => d.slice(0, 7);
export const thisMonth = monthOf(today);

/** The last `n` months as "YYYY-MM", oldest first, ending with the current month. */
export function lastMonths(n: number, end = thisMonth) {
  const [y, m] = end.split("-").map(Number);
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(Date.UTC(y, m - 1 - (n - 1 - i), 1));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  });
}

export const monthLabel = (ym: string, style: "month" | "monthYear" = "month") => formatDate(`${ym}-01`, style);

export const daysBetween = (from: string, to: string) => Math.round((utc(to).getTime() - utc(from).getTime()) / 86_400_000);

export const addDays = (d: string, n: number) => {
  const x = utc(d);
  x.setUTCDate(x.getUTCDate() + n);
  return x.toISOString().slice(0, 10);
};

export const addMonths = (d: string, n: number) => {
  const x = utc(d);
  x.setUTCMonth(x.getUTCMonth() + n);
  return x.toISOString().slice(0, 10);
};

export const daysInMonth = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
};

/** "in 3 days", "today", "2 days ago". */
export function relativeDay(d: string) {
  const n = daysBetween(today, d);
  if (n === 0) return "Today";
  if (n === 1) return "Tomorrow";
  if (n === -1) return "Yesterday";
  return n > 0 ? `In ${n} days` : `${-n} days ago`;
}

/** A local Date (from a date picker) → "YYYY-MM-DD". */
export const toISODate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
/** "YYYY-MM-DD" → a local Date for a date picker. */
export const fromISODate = (d: string) => {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day);
};

/* ------------------------------------------------------------------ transactions */

/** A transaction's amount per category, honouring splits. */
export const categoryParts = (t: Transaction): { category: CategoryId; amount: number }[] =>
  t.splits?.length ? t.splits : [{ category: t.category, amount: t.amount }];

export const isExpense = (c: CategoryId) => categoryById[c].kind === "expense";
export const isIncome = (c: CategoryId) => categoryById[c].kind === "income";

/** Income, spending (positive number) and net for a set of transactions. Transfers are left out. */
export function totals(list: Transaction[]) {
  let income = 0;
  let spending = 0;
  for (const t of list)
    for (const p of categoryParts(t)) {
      if (isIncome(p.category)) income += p.amount;
      else if (isExpense(p.category)) spending -= p.amount;
    }
  return { income, spending, net: income - spending };
}

/** Spending per expense category (positive numbers). */
export function spendingByCategory(list: Transaction[]) {
  const out = {} as Record<CategoryId, number>;
  for (const t of list)
    for (const p of categoryParts(t))
      if (isExpense(p.category)) out[p.category] = (out[p.category] ?? 0) - p.amount;
  return out;
}

export const inMonth = (list: Transaction[], ym: string) => list.filter((t) => t.date.startsWith(ym));

/* ------------------------------------------------------------------ accounts */

export const isLiability = (a: Account) => a.type === "credit" || a.type === "loan";
export const isCash = (a: Account) => a.type === "checking" || a.type === "savings";

export function netWorth(list: Account[]) {
  const assets = list.filter((a) => !isLiability(a)).reduce((s, a) => s + a.balance, 0);
  const debts = list.filter(isLiability).reduce((s, a) => s - a.balance, 0);
  return { assets, debts, net: assets - debts };
}

/** 12 monthly points: the stored history plus the live balance. */
export const accountSeries = (a: Account) => [...a.history, a.balance];

export const netWorthSeries = (list: Account[]) =>
  accountSeries(list[0]).map((_, i) => list.reduce((s, a) => s + accountSeries(a)[i], 0));

export const percent = (n: number, digits = 0) => `${n.toFixed(digits)}%`;
export const pctChange = (now: number, before: number) => (before === 0 ? 0 : Math.round(((now - before) / Math.abs(before)) * 1000) / 10);

/* ------------------------------------------------------------------ budgets */

export const fixedCategories: CategoryId[] = ["housing", "utilities", "subscriptions"];

/** How each budget is doing this month: spent so far, what's left, and the pace for the full month. */
export function budgetProgress(budgets: Budget[], list: Transaction[], ym = thisMonth) {
  const spent = spendingByCategory(inMonth(list, ym));
  const day = ym === thisMonth ? Number(today.slice(8)) : daysInMonth(ym);
  const days = daysInMonth(ym);
  return budgets.map((b) => {
    const s = Math.round((spent[b.category] ?? 0) * 100) / 100;
    // Fixed costs (rent, utilities, subscriptions) are paid once, so they don't extrapolate.
    const projected = fixedCategories.includes(b.category) ? s : (s / day) * days;
    return {
      ...b,
      spent: s,
      left: b.limit - s,
      pct: b.limit ? (s / b.limit) * 100 : 0,
      projected,
      status: s > b.limit ? ("over" as const) : projected > b.limit * 1.05 ? ("risk" as const) : ("ok" as const),
    };
  });
}

/** Days left in the current month, including today. */
export const daysLeft = daysInMonth(thisMonth) - Number(today.slice(8)) + 1;

/** Classes that tint a <Progress> by budget status (green on track, amber at risk, red over). */
export const statusTone = {
  ok: "[&>*]:from-(--tactile-success) [&>*]:to-(--tactile-success) [&>*]:shadow-none [&_[data-on]]:bg-success [&_[data-on]]:shadow-[0_0_6px_var(--tactile-success)]",
  risk: "[&>*]:from-(--tactile-warning) [&>*]:to-(--tactile-warning) [&>*]:shadow-none [&_[data-on]]:bg-warning [&_[data-on]]:shadow-[0_0_6px_var(--tactile-warning)]",
  over: "",
} as const;
