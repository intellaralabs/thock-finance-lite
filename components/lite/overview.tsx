"use client";

import Link from "next/link";
import { useState } from "react";
import { ChartPie, CreditCard, Landmark, Plus, TrendingDown, Wallet } from "lucide-react";
import { accountTypeLabel, profile, today } from "@/data/finance";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AddTransactionDialog } from "@/components/lite/add-transaction";
import { useFinance } from "@/components/lite/finance-provider";
import { accountIcons, CategoryIcon, Swatch } from "@/components/lite/icons";
import { PageHeader } from "@/components/lite/page-header";
import { ProBadge } from "@/components/lite/pro-badge";
import { ProShot } from "@/components/lite/pro-shot";
import { proScreens } from "@/data/pro-screens";
import { categoryById } from "@/data/finance";
import {
  addMonths,
  budgetProgress,
  daysLeft,
  formatDate,
  inMonth,
  isCash,
  isLiability,
  lastMonths,
  monthLabel,
  netWorth,
  netWorthSeries,
  pctChange,
  statusTone,
  thisMonth,
  totals,
} from "@/lib/finance";
import { proUrl, showProPreviews } from "@/lib/links";
import { cn } from "@/lib/utils";

function Stat({ label, value, hint, icon, children }: { label: string; value: string; hint: React.ReactNode; icon: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="tactile-tray grid content-start gap-2 rounded-3xl p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-subtle">{label}</span>
        <span className="tactile-key pointer-events-none grid size-8 place-items-center rounded-lg [&_svg]:size-4">{icon}</span>
      </div>
      <span className="font-mono text-3xl font-semibold tabular-nums text-fg">{value}</span>
      {children}
      <span className="text-xs text-subtle">{hint}</span>
    </div>
  );
}

/** Up / down change, green when it's good news. */
function Change({ value, invert, label }: { value: number; invert?: boolean; label: string }) {
  const good = invert ? value <= 0 : value >= 0;
  return (
    <span className="flex items-center gap-2 text-xs text-subtle">
      <Badge variant="well" status={good ? "success" : "error"} className="font-mono">
        {value >= 0 ? "▲" : "▼"} {Math.abs(value).toFixed(1)}%
      </Badge>
      {label}
    </span>
  );
}

export function Overview() {
  const { accounts, transactions, budgets, money } = useFinance();
  const [range, setRange] = useState("6");
  const [added, setAdded] = useState<string | null>(null);

  const nw = netWorth(accounts);
  const series = netWorthSeries(accounts);
  const cash = accounts.filter(isCash).reduce((s, a) => s + a.balance, 0);
  const day = today.slice(8);
  const spent = totals(inMonth(transactions, thisMonth)).spending;
  const lastYm = addMonths(today, -1).slice(0, 7);
  const spentBefore = totals(inMonth(transactions, lastYm).filter((t) => t.date.slice(8) <= day)).spending;
  const progress = budgetProgress(budgets, transactions);
  const budgeted = progress.reduce((s, b) => s + b.limit, 0);
  const left = progress.reduce((s, b) => s + Math.max(0, b.left), 0);

  const months = lastMonths(Number(range));
  const flow = months.map((m) => ({ m, ...totals(inMonth(transactions, m)) }));
  const max = Math.max(...flow.flatMap((f) => [f.income, f.spending]));
  const sum = flow.reduce((s, f) => ({ income: s.income + f.income, spending: s.spending + f.spending }), { income: 0, spending: 0 });

  const watch = [...progress].sort((a, b) => b.pct - a.pct).slice(0, 5);
  const recent = transactions.slice(0, 7);

  return (
    <>
      <PageHeader title={`Welcome back, ${profile.name.split(" ")[0]}`} description={`${formatDate(today, "weekday")} · ${daysLeft} days left in ${monthLabel(thisMonth, "monthYear")}`}>
        <AddTransactionDialog onAdded={(m) => setAdded(m)}>
          <Button variant="accent">
            <Plus /> Add transaction
          </Button>
        </AddTransactionDialog>
      </PageHeader>

      {added && (
        <Alert variant="success">
          <AlertDescription>
            Added {added}. <Link href="/transactions" className="underline underline-offset-4">See it in transactions</Link>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Net worth" value={money(nw.net, { whole: true })} hint={<Change value={pctChange(series[11], series[10])} label="vs last month" />} icon={<Landmark />} />
        <Stat label="Cash" value={money(cash, { whole: true })} hint={`Across ${accounts.filter(isCash).length} checking and savings accounts`} icon={<Wallet />} />
        <Stat label="Spent this month" value={money(spent, { whole: true })} hint={<Change value={pctChange(spent, spentBefore)} invert label="vs same day last month" />} icon={<TrendingDown />} />
        <Stat label="Left in budgets" value={money(left, { whole: true })} hint={`of ${money(budgeted, { whole: true, always: true })} budgeted`} icon={<ChartPie />}>
          <Progress value={Math.min(100, ((budgeted - left) / budgeted) * 100)} aria-label="Budget used" className={statusTone.ok} />
        </Stat>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
            <div className="grid gap-1.5">
              <CardTitle>Cash flow</CardTitle>
              <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="flex items-center gap-1.5">
                  <Swatch color="var(--chart-income)" /> In <span className="font-mono text-fg">{money(sum.income, { whole: true })}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Swatch color="var(--chart-spend)" /> Out <span className="font-mono text-fg">{money(sum.spending, { whole: true })}</span>
                </span>
              </CardDescription>
            </div>
            <ToggleGroup type="single" value={range} onValueChange={(v) => v && setRange(v)} aria-label="Range" className="gap-1 rounded-xl p-1">
              <ToggleGroupItem value="6" className="h-8 min-w-10 rounded-lg px-2.5 text-sm">6M</ToggleGroupItem>
              <ToggleGroupItem value="12" className="h-8 min-w-10 rounded-lg px-2.5 text-sm">12M</ToggleGroupItem>
            </ToggleGroup>
          </CardHeader>
          <CardContent>
            <ul className="flex h-56 items-end gap-1.5 sm:gap-3" aria-label="Money in and out per month">
              {flow.map((f) => (
                <li
                  key={f.m}
                  className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                  aria-label={`${monthLabel(f.m, "monthYear")}: in ${money(f.income, { whole: true })}, out ${money(f.spending, { whole: true })}`}
                >
                  <span className="flex h-full w-full items-end justify-center gap-0.5 sm:gap-1">
                    <span className="w-full max-w-4 rounded-t-md bg-(--chart-income)" style={{ height: `${(f.income / max) * 100}%` }} />
                    <span className="w-full max-w-4 rounded-t-md bg-(--chart-spend)" style={{ height: `${(f.spending / max) * 100}%` }} />
                  </span>
                  <span className={cn("text-[11px] text-subtle", f.m === thisMonth && "font-semibold text-fg")}>{monthLabel(f.m)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Budgets</CardTitle>
            <Link href="/budgets" className="text-sm text-subtle hover:text-fg">
              Manage
            </Link>
          </CardHeader>
          <CardContent className="grid gap-4">
            {watch.map((b) => (
              <div key={b.category} className="grid gap-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-medium text-fg">{categoryById[b.category].name}</span>
                  <span className={cn("font-mono text-xs tabular-nums", b.status === "over" ? "text-brand" : "text-subtle")}>
                    {b.status === "over" ? `${money(-b.left, { whole: true })} over` : `${money(b.left, { whole: true })} left`}
                  </span>
                </div>
                <Progress value={Math.min(100, b.pct)} aria-label={`${categoryById[b.category].name} budget used`} className={statusTone[b.status]} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent transactions</CardTitle>
            <Link href="/transactions" className="text-sm text-subtle hover:text-fg">
              See all
            </Link>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 gap-1">
              {recent.map((t) => (
                <li key={t.id} className="flex items-center gap-3 rounded-xl py-2">
                  <CategoryIcon category={t.category} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-fg">{t.merchant}</span>
                      {t.pending && (
                        <Badge variant="well" className="h-5 text-[10px]">
                          Pending
                        </Badge>
                      )}
                    </span>
                    <span className="block truncate text-xs text-subtle">
                      {formatDate(t.date)} · {categoryById[t.category].name}
                    </span>
                  </span>
                  <span className={cn("font-mono text-sm tabular-nums", t.amount > 0 ? "text-success" : "text-fg")}>{money(t.amount, { sign: true })}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Accounts</CardTitle>
            <span className="font-mono text-sm tabular-nums text-subtle">{money(nw.net, { whole: true })}</span>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 gap-1">
              {accounts.map((a) => {
                const Icon = accountIcons[a.type];
                return (
                  <li key={a.id} className="flex items-center gap-3 py-2">
                    <span className="tactile-key pointer-events-none grid size-9 flex-none place-items-center rounded-xl text-subtle [&_svg]:size-4">
                      <Icon aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-fg">{a.name}</span>
                      <span className="block truncate text-xs text-subtle">
                        {accountTypeLabel[a.type]} ··{a.mask}
                      </span>
                    </span>
                    <span className="grid justify-items-end">
                      <span className={cn("font-mono text-sm tabular-nums", isLiability(a) ? "text-subtle" : "text-fg")}>{money(a.balance)}</span>
                      {a.type === "credit" && a.limit && (
                        <span className="flex items-center gap-1 font-mono text-[11px] text-subtle">
                          <CreditCard className="size-3" aria-hidden /> {Math.round((-a.balance / a.limit) * 100)}% used
                        </span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>

      {showProPreviews && (
        <section aria-labelledby="pro" className="grid gap-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 id="pro" className="flex items-center gap-2 text-sm font-semibold text-fg">
                In the full template <ProBadge />
              </h2>
              <p className="mt-1 text-sm text-subtle">Accounts, investments, goals, bills and more, built from the same components.</p>
            </div>
            <a href={proUrl} className="text-sm text-subtle underline-offset-4 hover:text-fg hover:underline">
              See the full template
            </a>
          </div>
          <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
            {proScreens.map(({ slug, name, icon: Icon }) => (
              <Link
                key={slug}
                href={`/pro/${slug}`}
                className="tactile-tray group grid w-56 flex-none snap-start gap-2 rounded-2xl p-2 outline-none focus-visible:ring-2 focus-visible:ring-(--tactile-focus) sm:w-auto"
              >
                <span className="overflow-hidden rounded-xl">
                  <ProShot slug={slug} alt="" sizes="(min-width: 640px) 33vw, 224px" className="transition-transform duration-300 group-hover:scale-105" />
                </span>
                <span className="flex items-center gap-2 px-1.5 pb-1 text-sm font-medium text-fg [&_svg]:size-4">
                  <Icon aria-hidden /> {name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
