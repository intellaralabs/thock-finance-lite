"use client";

import Link from "next/link";
import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { categoryById, expenseCategories, type Budget, type CategoryId } from "@/data/finance";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useFinance } from "@/components/lite/finance-provider";
import { CategoryIcon } from "@/components/lite/icons";
import { PageHeader } from "@/components/lite/page-header";
import { budgetProgress, daysLeft, inMonth, monthLabel, spendingByCategory, statusTone, thisMonth } from "@/lib/finance";
import { cn } from "@/lib/utils";

const statusLabel = { ok: "On track", risk: "At risk", over: "Over" } as const;
const statusLed = { ok: "success", risk: "warning", over: "error" } as const;

export function Budgets() {
  const { budgets, transactions, money } = useFinance();
  const [editing, setEditing] = useState<{ budget: Budget; isNew: boolean } | null>(null);
  const progress = budgetProgress(budgets, transactions);
  const budgeted = progress.reduce((s, b) => s + b.limit, 0);
  const spent = progress.reduce((s, b) => s + b.spent, 0);
  const left = budgeted - spent;
  const used = budgeted ? (spent / budgeted) * 100 : 0;
  const flagged = progress.filter((b) => b.status !== "ok").length;

  const month = spendingByCategory(inMonth(transactions, thisMonth));
  const unbudgeted = expenseCategories.filter((c) => !budgets.some((b) => b.category === c.id));
  const loose = unbudgeted.filter((c) => (month[c.id] ?? 0) > 0);

  function create(category?: CategoryId) {
    const id = category ?? unbudgeted[0]?.id;
    if (!id) return;
    setEditing({ budget: { category: id, limit: Math.max(50, Math.ceil(((month[id] ?? 0) * 1.2) / 10) * 10), rollover: false }, isNew: true });
  }

  return (
    <>
      <PageHeader title="Budgets" description={`${monthLabel(thisMonth, "monthYear")} · ${daysLeft} days left`}>
        <Button variant="accent" disabled={!unbudgeted.length} onClick={() => create()}>
          <Plus /> New budget
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Summary label="Budgeted" value={money(budgeted, { whole: true, always: true })} hint={`${budgets.length} categories`} />
        <Summary label="Spent" value={money(spent, { whole: true })} hint={`${Math.round(used)}% of the total`}>
          <Progress value={Math.min(100, used)} aria-label="Total budget used" className={used > 100 ? statusTone.over : statusTone.ok} />
        </Summary>
        <Summary label="Left" value={money(left, { whole: true })} hint={left > 0 ? `${money(left / daysLeft, { always: true })} a day until the month ends` : "Over budget this month"} />
        <Summary label="Over or at risk" value={String(flagged)} hint={flagged ? "On pace to go over by month end" : "Everything is on track"} />
      </div>

      <section aria-labelledby="by-category" className="grid gap-3">
        <h2 id="by-category" className="text-sm font-semibold text-fg">
          By category
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {progress.map((b) => {
            const name = categoryById[b.category].name;
            return (
              <li key={b.category} className="tactile-tray grid gap-4 rounded-3xl p-5">
                <div className="flex items-center gap-3">
                  <CategoryIcon category={b.category} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-fg">{name}</span>
                    <span className="block text-xs text-subtle">
                      {money(b.limit, { whole: true, always: true })} a month{b.rollover ? " · rolls over" : ""}
                    </span>
                  </span>
                  <Button size="icon-sm" aria-label={`Edit ${name} budget`} onClick={() => setEditing({ budget: b, isNew: false })}>
                    <Pencil />
                  </Button>
                </div>
                <div className="flex items-end justify-between gap-3">
                  <span className="font-mono text-2xl font-semibold tabular-nums text-fg">{money(b.spent, { whole: true })}</span>
                  <Badge variant="well" status={statusLed[b.status]}>
                    {b.status === "over" ? `${money(-b.left, { whole: true })} over` : statusLabel[b.status]}
                  </Badge>
                </div>
                <Progress value={Math.min(100, b.pct)} segments={12} aria-label={`${name}: ${Math.round(b.pct)}% used`} className={statusTone[b.status]} />
                <div className="flex justify-between gap-3 text-xs text-subtle">
                  <span>{Math.round(b.pct)}% used</span>
                  <span>Heading for {money(b.projected, { whole: true })}</span>
                </div>
                <Link href={`/transactions?category=${b.category}`} className="text-xs text-subtle underline-offset-4 hover:text-fg hover:underline">
                  See transactions
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {loose.length > 0 && (
        <section aria-labelledby="loose" className="tactile-tray grid gap-3 rounded-3xl p-5">
          <h2 id="loose" className="text-sm font-semibold text-fg">
            Spending without a budget
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {loose.map((c) => (
              <li key={c.id} className="tactile-well flex items-center gap-3 rounded-2xl p-3">
                <CategoryIcon category={c.id} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-fg">{c.name}</span>
                  <span className="block font-mono text-xs text-subtle">{money(month[c.id])} this month</span>
                </span>
                <Button size="sm" onClick={() => create(c.id)}>
                  Add budget
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          {editing && (
            <BudgetForm key={`${editing.budget.category}-${editing.isNew}`} initial={editing.budget} isNew={editing.isNew} options={unbudgeted.map((c) => c.id)} onClose={() => setEditing(null)} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function Summary({ label, value, hint, children }: { label: string; value: string; hint: string; children?: React.ReactNode }) {
  return (
    <div className="tactile-tray grid content-start gap-2 rounded-3xl p-5">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-subtle">{label}</span>
      <span className="font-mono text-3xl font-semibold tabular-nums text-fg">{value}</span>
      {children}
      <span className="text-xs text-subtle">{hint}</span>
    </div>
  );
}

function BudgetForm({ initial, isNew, options, onClose }: { initial: Budget; isNew: boolean; options: CategoryId[]; onClose: () => void }) {
  const { setBudget, removeBudget, money } = useFinance();
  const [category, setCategory] = useState(initial.category);
  const [limit, setLimit] = useState(initial.limit);
  const [rollover, setRollover] = useState(initial.rollover);
  const max = Math.max(3000, limit);
  const name = categoryById[category].name;

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isNew ? "New budget" : `${name} budget`}</DialogTitle>
        <DialogDescription>A monthly limit. You&apos;ll see a warning when you&apos;re on pace to go over.</DialogDescription>
      </DialogHeader>
      <form
        id="budget"
        className="grid gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (limit > 0) {
            setBudget({ category, limit, rollover });
            onClose();
          }
        }}
      >
        {isNew && (
          <FormField label="Category">
            <Select value={category} onValueChange={(v) => setCategory(v as CategoryId)}>
              <SelectTrigger aria-label="Category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map((id) => (
                  <SelectItem key={id} value={id}>
                    {categoryById[id].name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        )}
        <FormField label="Monthly limit" error={limit > 0 ? undefined : "Enter an amount above zero."}>
          <Input type="number" inputMode="decimal" min="0" step="10" value={String(limit)} onChange={(e) => setLimit(Math.max(0, Number(e.target.value)))} />
        </FormField>
        <Slider value={[limit]} min={0} max={max} step={10} onValueChange={([v]) => setLimit(v)} aria-label="Monthly limit" />
        <p className="-mt-2 text-xs text-subtle">
          {money(limit * 12, { whole: true, always: true })} a year · {money(limit / 30, { always: true })} a day
        </p>
        <div className="flex items-center justify-between gap-3">
          <span className="grid">
            <Label htmlFor="rollover">Roll over what&apos;s left</Label>
            <span className="text-xs text-subtle">Unspent money adds to next month</span>
          </span>
          <Switch id="rollover" checked={rollover} onCheckedChange={setRollover} />
        </div>
      </form>
      <DialogFooter className={cn(!isNew && "sm:justify-between")}>
        {!isNew && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              removeBudget(category);
              onClose();
            }}
          >
            Remove budget
          </Button>
        )}
        <span className="flex gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="budget" variant="accent">
            Save
          </Button>
        </span>
      </DialogFooter>
    </>
  );
}
