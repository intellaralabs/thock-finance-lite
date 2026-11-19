# Harbor Lite: free personal finance dashboard

A free, MIT-licensed personal finance dashboard built with **[Thock UI](https://thock-ui.vercel.app)**, the tactile React
component library by Intellara Labs. It has four screens, light and dark themes, works on phones, and runs on a year
of realistic demo transactions.

**Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Radix UI, lucide-react, next-themes. No chart library:
the cash flow chart is plain HTML and CSS.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

## Screens

| Route | What it shows |
| --- | --- |
| `/` | Net worth, cash, spending this month, budget left, cash flow (6 or 12 months), budgets to watch, recent transactions, accounts |
| `/transactions` | Search, filter by flow, account and category, "to review" filter, bulk categorise and mark reviewed, edit category and notes, add a transaction. `?category=dining` and `?q=coffee` open it pre-filtered |
| `/budgets` | Monthly budgets with a projected month-end, on track / at risk / over, rollover, and spending that has no budget yet |
| `/settings` | Profile, currency, hide balances, light/dark/system theme and notification switches |

The eye button in the header hides every balance.

## Project structure

```
app/                  layout.tsx (theme + state + shell) and one page per screen
components/ui/        Thock UI components (free, MIT; yours to edit)
components/lite/      app parts: shell, state provider, dialogs, screens
data/finance.ts       demo data and the types the UI expects
lib/finance.ts        money and date formatting, totals, budget progress
lib/links.ts          Pro links and previews; set showProPreviews = false to remove them all
styles/tactile.css    design tokens: colours, raised and recessed surfaces, LEDs
```

## Connecting real data

All state lives in `components/lite/finance-provider.tsx`. Screens only call `useFinance()` (`addTransaction`,
`updateTransactions`, `setBudget`, `removeBudget`, `setCurrency`, `setHidden`). Load your accounts and transactions
from your API or an aggregator (Plaid, TrueLayer, GoCardless) instead of `data/finance.ts`, and send each action to
your backend as well as to the reducer. Totals and budget progress are computed from transactions in `lib/finance.ts`.

## Building your own product on this?

The "More screens" menu, the `/pro/*` preview pages, the overview teaser, the "Get Pro" button, the settings card and
the footer are all switched off by one line in `lib/links.ts`:

```ts
export const showProPreviews = false;
```

You can then also delete `app/pro`, `data/pro-screens.ts`, `components/lite/pro-*.tsx` and `public/pro`.

## Want more?

The **full Finance template** has 13 screens:

- accounts with a net worth chart, a detail page per account and transfers between accounts
- investments: performance, allocation against targets, sortable holdings and a risk gauge
- savings goals with forecasts and a step-by-step wizard
- bills and subscriptions on a calendar, with autopay and pay now
- reports comparing any two months, with CSV export
- cards: freeze, limits and virtual cards
- split transactions, date filters, connected banks, a ⌘K command menu and sign-in screens

It's built with the Pro components (gauges, sparklines, stat cards, sheets, steps, date pickers, toasts and more):
[thock-ui.vercel.app/templates/finance](https://thock-ui.vercel.app/templates/finance).

## Licence

MIT. See [LICENSE](LICENSE).
