/**
 * Demo data for the whole app. Every screen reads it through the FinanceProvider
 * (components/lite/finance-provider.tsx). To connect real data, load these shapes from your
 * API (or an aggregator such as Plaid, TrueLayer or GoCardless) in the provider; screens don't change.
 *
 * Money is stored as plain numbers in the user's currency. Spending is negative, income positive.
 * Dates are ISO "YYYY-MM-DD" strings. The demo is pinned to `today` so every number is stable.
 */

export const app = { name: "Harbor", tagline: "Personal finance" };

/** The demo's "today". Swap for the real date when you connect live data. */
export const today = "2026-11-16";

export const profile = {
  name: "Sam Carter",
  email: "sam@example.com",
  initials: "SC",
  plan: "Premium",
  phone: "+1 555 0142",
};

/* ------------------------------------------------------------------ categories */

export type CategoryId =
  | "income"
  | "housing"
  | "groceries"
  | "dining"
  | "transport"
  | "shopping"
  | "utilities"
  | "entertainment"
  | "health"
  | "travel"
  | "subscriptions"
  | "transfer";

export type Category = { id: CategoryId; name: string; color: string; kind: "income" | "expense" | "transfer" };

/** Colours read CSS variables from app/globals.css so they adapt to light and dark mode. */
export const categories: Category[] = [
  { id: "income", name: "Income", color: "var(--chart-income)", kind: "income" },
  { id: "housing", name: "Housing", color: "var(--chart-1)", kind: "expense" },
  { id: "groceries", name: "Groceries", color: "var(--chart-2)", kind: "expense" },
  { id: "dining", name: "Dining out", color: "var(--chart-3)", kind: "expense" },
  { id: "transport", name: "Transport", color: "var(--chart-4)", kind: "expense" },
  { id: "shopping", name: "Shopping", color: "var(--chart-5)", kind: "expense" },
  { id: "utilities", name: "Utilities", color: "var(--chart-6)", kind: "expense" },
  { id: "entertainment", name: "Entertainment", color: "var(--chart-7)", kind: "expense" },
  { id: "health", name: "Health", color: "var(--chart-8)", kind: "expense" },
  { id: "travel", name: "Travel", color: "var(--chart-9)", kind: "expense" },
  { id: "subscriptions", name: "Subscriptions", color: "var(--chart-10)", kind: "expense" },
  { id: "transfer", name: "Transfers", color: "var(--tactile-muted)", kind: "transfer" },
];

export const categoryById = Object.fromEntries(categories.map((c) => [c.id, c])) as Record<CategoryId, Category>;
export const expenseCategories = categories.filter((c) => c.kind === "expense");

/* ------------------------------------------------------------------ institutions & accounts */

export type Institution = {
  id: string;
  name: string;
  /** Monogram shown in the logo key. */
  short: string;
  status: "connected" | "attention";
  lastSync: string;
};

export const institutions: Institution[] = [
  { id: "summit", name: "Summit Bank", short: "SB", status: "connected", lastSync: "2 min ago" },
  { id: "northbank", name: "Northbank Card Services", short: "NB", status: "connected", lastSync: "2 min ago" },
  { id: "atlas", name: "Atlas Credit Union", short: "AC", status: "attention", lastSync: "3 days ago" },
  { id: "meridian", name: "Meridian Invest", short: "MI", status: "connected", lastSync: "1 h ago" },
];


export type AccountType = "checking" | "savings" | "credit" | "investment" | "loan";

export type Account = {
  id: string;
  name: string;
  institution: string;
  type: AccountType;
  /** Last 4 digits. */
  mask: string;
  /** Negative for money owed (cards, loans). */
  balance: number;
  /** Credit limit, or original loan amount. */
  limit?: number;
  /** Savings interest rate, % per year. */
  apy?: number;
  /** Card or loan interest rate, % per year. */
  apr?: number;
  /** Month-end balances for the last 11 months (oldest first). The live balance is the 12th point. */
  history: number[];
};

export const accounts: Account[] = [
  {
    id: "checking",
    name: "Everyday Checking",
    institution: "summit",
    type: "checking",
    mask: "4821",
    balance: 6842.17,
    history: [4210, 5120, 4870, 5560, 6230, 5980, 6410, 7120, 6650, 7340, 6915],
  },
  {
    id: "savings",
    name: "High-Yield Savings",
    institution: "summit",
    type: "savings",
    mask: "9033",
    balance: 24310.55,
    apy: 4.1,
    history: [17800, 18420, 18950, 19510, 20140, 20690, 21280, 21900, 22510, 23140, 23720],
  },
  {
    id: "rewards",
    name: "Rewards Visa",
    institution: "northbank",
    type: "credit",
    mask: "7714",
    balance: -1284.4,
    limit: 8000,
    apr: 21.9,
    history: [-980, -1430, -1120, -1610, -890, -1340, -1520, -1180, -960, -1410, -1105],
  },
  {
    id: "travel",
    name: "Travel Mastercard",
    institution: "atlas",
    type: "credit",
    mask: "2290",
    balance: -436.12,
    limit: 5000,
    apr: 18.4,
    history: [-210, -320, -150, -480, -1890, -620, -340, -260, -2140, -510, -380],
  },
  {
    id: "brokerage",
    name: "Brokerage",
    institution: "meridian",
    type: "investment",
    mask: "6610",
    balance: 68711.22,
    history: [53774, 55842, 54869, 57546, 59370, 57911, 61074, 63142, 64602, 63750, 67887],
  },
  {
    id: "retirement",
    name: "Retirement 401(k)",
    institution: "meridian",
    type: "investment",
    mask: "1187",
    balance: 120210.6,
    history: [102317, 104121, 103272, 106350, 108897, 107624, 111338, 113886, 115796, 114841, 118768],
  },
  {
    id: "car-loan",
    name: "Car loan",
    institution: "atlas",
    type: "loan",
    mask: "5502",
    balance: -12380,
    limit: 24000,
    apr: 5.9,
    history: [-16540, -16170, -15790, -15410, -15030, -14640, -14250, -13860, -13460, -13060, -12720],
  },
];

export const accountTypeLabel: Record<AccountType, string> = {
  checking: "Checking",
  savings: "Savings",
  credit: "Credit card",
  investment: "Investment",
  loan: "Loan",
};



// Small seeded random generator so the demo data is the same on server and client.
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/* ------------------------------------------------------------------ transactions */

export type Split = { category: CategoryId; amount: number };

export type Transaction = {
  id: string;
  date: string;
  merchant: string;
  category: CategoryId;
  /** Negative = money out. */
  amount: number;
  account: string;
  pending?: boolean;
  note?: string;
  /** When set, the amount is shared between these categories (they add up to `amount`). */
  splits?: Split[];
  /** Ticked off after you've looked at it. */
  reviewed?: boolean;
};

type Pattern = { merchant: string; category: CategoryId; account: string; min: number; max: number };

const variable: Record<string, Pattern[]> = {
  groceries: [
    { merchant: "Green Basket Market", category: "groceries", account: "checking", min: 48, max: 142 },
    { merchant: "Corner Grocer", category: "groceries", account: "checking", min: 12, max: 46 },
    { merchant: "FreshCo Wholesale", category: "groceries", account: "rewards", min: 85, max: 210 },
  ],
  dining: [
    { merchant: "The Daily Grind", category: "dining", account: "rewards", min: 4.5, max: 11 },
    { merchant: "Noodle House", category: "dining", account: "rewards", min: 18, max: 42 },
    { merchant: "Slice & Co", category: "dining", account: "rewards", min: 16, max: 38 },
    { merchant: "Blue Door Bistro", category: "dining", account: "rewards", min: 42, max: 118 },
    { merchant: "Taco Stand", category: "dining", account: "checking", min: 9, max: 24 },
  ],
  transport: [
    { merchant: "Metro Transit", category: "transport", account: "checking", min: 2.75, max: 2.75 },
    { merchant: "Fuel Stop", category: "transport", account: "rewards", min: 38, max: 64 },
    { merchant: "RideNow", category: "transport", account: "rewards", min: 11, max: 34 },
  ],
  shopping: [
    { merchant: "Northside Outfitters", category: "shopping", account: "rewards", min: 35, max: 160 },
    { merchant: "Homeware Depot", category: "shopping", account: "rewards", min: 18, max: 120 },
    { merchant: "Bookshop on Main", category: "shopping", account: "checking", min: 12, max: 45 },
    { merchant: "Parcelhub Online", category: "shopping", account: "rewards", min: 15, max: 95 },
  ],
  entertainment: [
    { merchant: "Cinema 8", category: "entertainment", account: "rewards", min: 14, max: 36 },
    { merchant: "Gamevault", category: "entertainment", account: "rewards", min: 9, max: 60 },
    { merchant: "City Concert Hall", category: "entertainment", account: "rewards", min: 45, max: 140 },
  ],
  health: [
    { merchant: "Wellness Pharmacy", category: "health", account: "checking", min: 8, max: 42 },
    { merchant: "Riverside Dental", category: "health", account: "checking", min: 60, max: 180 },
  ],
};

/** How many of each kind per month. */
const perMonth: Record<string, number> = { groceries: 7, dining: 9, transport: 8, shopping: 3, entertainment: 2, health: 1 };

const fixed: { day: number; merchant: string; category: CategoryId; account: string; amount: number }[] = [
  { day: 1, merchant: "Parkside Apartments", category: "housing", account: "checking", amount: -2150 },
  { day: 1, merchant: "Brightline Ltd payroll", category: "income", account: "checking", amount: 3240 },
  { day: 15, merchant: "Brightline Ltd payroll", category: "income", account: "checking", amount: 3240 },
  { day: 2, merchant: "Transfer to savings", category: "transfer", account: "checking", amount: -500 },
  { day: 3, merchant: "Streamflix", category: "subscriptions", account: "rewards", amount: -15.49 },
  { day: 6, merchant: "Tunebox Music", category: "subscriptions", account: "rewards", amount: -10.99 },
  { day: 9, merchant: "FitClub Gym", category: "health", account: "checking", amount: -39 },
  { day: 8, merchant: "City Power & Light", category: "utilities", account: "checking", amount: -112.4 },
  { day: 11, merchant: "Fibernet Internet", category: "utilities", account: "checking", amount: -65 },
  { day: 12, merchant: "Clearwater Utilities", category: "utilities", account: "checking", amount: -46.2 },
  { day: 14, merchant: "Cloudbox Storage", category: "subscriptions", account: "rewards", amount: -2.99 },
  { day: 18, merchant: "Mobile One", category: "utilities", account: "checking", amount: -45 },
  { day: 20, merchant: "Atlas Credit Union car loan", category: "transfer", account: "checking", amount: -389.5 },
  { day: 22, merchant: "Northbank card payment", category: "transfer", account: "checking", amount: -1200 },
  { day: 25, merchant: "Shield Home Insurance", category: "housing", account: "checking", amount: -84 },
  { day: 28, merchant: "Savings interest", category: "income", account: "savings", amount: 78.6 },
];

/** One-offs that make the year feel real. */
const extras: Omit<Transaction, "id">[] = [
  { date: "2026-03-14", merchant: "SkyHigh Airlines", category: "travel", account: "travel", amount: -684.2 },
  { date: "2026-03-28", merchant: "Seaside Hotel", category: "travel", account: "travel", amount: -912.5 },
  { date: "2026-07-03", merchant: "SkyHigh Airlines", category: "travel", account: "travel", amount: -1124.8 },
  { date: "2026-07-19", merchant: "Alpine Lodge", category: "travel", account: "travel", amount: -1380 },
  { date: "2026-08-21", merchant: "Tax refund", category: "income", account: "checking", amount: 1215 },
  { date: "2026-10-09", merchant: "Freelance invoice #1042", category: "income", account: "checking", amount: 1450 },
  { date: "2026-11-04", merchant: "Freelance invoice #1051", category: "income", account: "checking", amount: 980 },
  { date: "2026-11-07", merchant: "Homeware Depot", category: "shopping", account: "rewards", amount: -248.36, note: "New desk lamp and shelves" },
  {
    date: "2026-11-12",
    merchant: "Costwise Superstore",
    category: "groceries",
    account: "rewards",
    amount: -186.4,
    splits: [
      { category: "groceries", amount: -122.9 },
      { category: "shopping", amount: -63.5 },
    ],
    note: "Weekly shop plus a kettle",
  },
  { date: "2026-11-15", merchant: "Blue Door Bistro", category: "dining", account: "rewards", amount: -86.5, pending: true },
  { date: "2026-11-16", merchant: "The Daily Grind", category: "dining", account: "rewards", amount: -6.2, pending: true },
  { date: "2026-11-16", merchant: "Parcelhub Online", category: "shopping", account: "rewards", amount: -54.99, pending: true },
];

const iso = (y: number, m: number, d: number) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const daysIn = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();

function generateTransactions(): Transaction[] {
  const rnd = seeded(42);
  const out: Omit<Transaction, "id">[] = [];
  const [ty, tm, td] = today.split("-").map(Number);
  // Twelve months: Dec 2025 → Nov 2026.
  for (let k = 11; k >= 0; k--) {
    const y = tm - k <= 0 ? ty - 1 : ty;
    const m = ((tm - k - 1 + 12) % 12) + 1;
    const last = y === ty && m === tm ? td : daysIn(y, m);
    for (const f of fixed) if (f.day <= last) out.push({ date: iso(y, m, f.day), merchant: f.merchant, category: f.category, account: f.account, amount: f.amount });
    for (const [kind, count] of Object.entries(perMonth)) {
      // A partial month gets a proportional share.
      const n = Math.round((count * last) / daysIn(y, m));
      for (let i = 0; i < n; i++) {
        const p = variable[kind][Math.floor(rnd() * variable[kind].length)];
        out.push({
          date: iso(y, m, 1 + Math.floor(rnd() * last)),
          merchant: p.merchant,
          category: p.category,
          account: p.account,
          amount: -round2(p.min + rnd() * (p.max - p.min)),
        });
      }
    }
  }
  out.push(...extras);
  return out
    .sort((a, b) => (a.date === b.date ? a.merchant.localeCompare(b.merchant) : b.date.localeCompare(a.date)))
    .map((t, i) => ({ ...t, id: `t${String(out.length - i).padStart(4, "0")}`, reviewed: t.date < "2026-11-10" }));
}

export const transactions: Transaction[] = generateTransactions();

/* ------------------------------------------------------------------ budgets */

export type Budget = { category: CategoryId; limit: number; rollover: boolean };

export const budgets: Budget[] = [
  { category: "housing", limit: 2400, rollover: false },
  { category: "groceries", limit: 950, rollover: false },
  { category: "dining", limit: 450, rollover: false },
  { category: "transport", limit: 260, rollover: true },
  { category: "shopping", limit: 300, rollover: false },
  { category: "utilities", limit: 300, rollover: false },
  { category: "entertainment", limit: 120, rollover: true },
  { category: "subscriptions", limit: 40, rollover: false },
];

