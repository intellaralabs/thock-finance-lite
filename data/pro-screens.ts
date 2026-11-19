import { CalendarClock, ChartColumn, ChartLine, CreditCard, Goal, Wallet, type LucideIcon } from "lucide-react";

/** Screens that are only in the full template. Screenshots live in public/pro/<slug>-{dark,light}.jpg. */
export type ProScreen = { slug: string; name: string; icon: LucideIcon; summary: string; points: string[] };

export const proScreens: ProScreen[] = [
  {
    slug: "accounts",
    name: "Accounts",
    icon: Wallet,
    summary: "Every account, its history and the money moving between them.",
    points: [
      "Net worth over 12 months",
      "Accounts grouped by cash, cards, investments and loans",
      "A detail page per account with its balance chart",
      "Move money between accounts",
    ],
  },
  {
    slug: "investments",
    name: "Investments",
    icon: ChartLine,
    summary: "Portfolio, allocation and every holding.",
    points: ["Performance over 1 month, 3 months or a year", "Allocation donut against your targets", "Sortable holdings with gains", "A risk gauge and rebalancing targets"],
  },
  {
    slug: "goals",
    name: "Goals",
    icon: Goal,
    summary: "Save for the things that matter, with a forecast for each.",
    points: ["Progress rings and on-track forecasts", "Three-step wizard to set a goal", "Add money from any account", "Edit or delete goals"],
  },
  {
    slug: "bills",
    name: "Bills",
    icon: CalendarClock,
    summary: "Never miss a bill or a forgotten subscription.",
    points: ["Calendar of due dates", "Bills and subscriptions with autopay", "Pay now and cancel subscriptions", "What's due this week and this month"],
  },
  {
    slug: "reports",
    name: "Reports",
    icon: ChartColumn,
    summary: "Any month against any other.",
    points: ["Income, spending and savings rate", "12-month cash flow you can click into", "Category and merchant comparisons", "Export to CSV"],
  },
  {
    slug: "cards",
    name: "Cards",
    icon: CreditCard,
    summary: "Freeze cards, set limits and make virtual cards.",
    points: ["Card faces for every card", "Freeze and unfreeze in one tap", "Monthly limits and online, contactless and ATM switches", "New virtual cards for online shopping"],
  },
];
