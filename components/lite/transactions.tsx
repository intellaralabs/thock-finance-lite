"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, FilterX, Plus } from "lucide-react";
import { categories, categoryById, type CategoryId, type Transaction } from "@/data/finance";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Label } from "@/components/ui/label";
import { SearchInput } from "@/components/ui/search-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AddTransactionDialog } from "@/components/lite/add-transaction";
import { useFinance } from "@/components/lite/finance-provider";
import { CategoryIcon } from "@/components/lite/icons";
import { PageHeader } from "@/components/lite/page-header";
import { formatDate, totals } from "@/lib/finance";
import { cn } from "@/lib/utils";

const PAGE = 25;

function CategorySelect({ value, onValueChange, label, placeholder }: { value?: string; onValueChange: (v: string) => void; label: string; placeholder?: string }) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger aria-label={label} className="min-w-0">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {categories.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function Transactions() {
  const params = useSearchParams();
  const { transactions, accounts, money, account, updateTransactions } = useFinance();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [flow, setFlow] = useState("all");
  const [acct, setAcct] = useState("all");
  const [cat, setCat] = useState(params.get("category") ?? "all");
  const [review, setReview] = useState(params.has("review"));
  const [shown, setShown] = useState(PAGE);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions.filter(
      (t) =>
        (!q || t.merchant.toLowerCase().includes(q) || t.note?.toLowerCase().includes(q)) &&
        (flow === "all" || (flow === "in" ? t.amount > 0 : t.amount < 0)) &&
        (acct === "all" || t.account === acct) &&
        (cat === "all" || t.category === cat || t.splits?.some((s) => s.category === cat)) &&
        (!review || !t.reviewed),
    );
  }, [transactions, query, flow, acct, cat, review]);

  const sum = totals(list);
  const toReview = transactions.filter((t) => !t.reviewed).length;
  const page = list.slice(0, shown);
  const filtering = query || flow !== "all" || acct !== "all" || cat !== "all" || review;
  const allOnPage = page.length > 0 && page.every((t) => selected.has(t.id));
  const current = open ? transactions.find((t) => t.id === open) : undefined;

  // Any filter change goes back to the first page and clears the selection.
  const filter =
    <T,>(set: (v: T) => void) =>
    (v: T) => {
      set(v);
      setShown(PAGE);
      setSelected(new Set());
    };

  function reset() {
    setQuery("");
    setFlow("all");
    setAcct("all");
    setCat("all");
    setReview(false);
    setShown(PAGE);
    setSelected(new Set());
  }

  function toggle(id: string, on: boolean) {
    setSelected((s) => {
      const next = new Set(s);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function bulk(patch: { category?: CategoryId; reviewed?: boolean }, message: string) {
    updateTransactions([...selected], patch);
    setNotice(`${selected.size} ${selected.size === 1 ? "transaction" : "transactions"} ${message}.`);
    setSelected(new Set());
  }

  return (
    <>
      <PageHeader title="Transactions" description={`${transactions.length} transactions · ${toReview} to review`}>
        <AddTransactionDialog onAdded={(m) => setNotice(`Added ${m}.`)}>
          <Button variant="accent">
            <Plus /> Add transaction
          </Button>
        </AddTransactionDialog>
      </PageHeader>

      <section aria-label="Filters" className="tactile-tray grid gap-3 rounded-3xl p-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
          <SearchInput value={query} onValueChange={filter(setQuery)} placeholder="Search merchants and notes" aria-label="Search transactions" />
          <ToggleGroup type="single" value={flow} onValueChange={(v) => v && filter(setFlow)(v)} aria-label="Money in or out" className="gap-1 rounded-xl p-1 [&>*]:flex-1">
            <ToggleGroupItem value="all" className="h-9 rounded-lg text-sm">All</ToggleGroupItem>
            <ToggleGroupItem value="in" className="h-9 rounded-lg text-sm">In</ToggleGroupItem>
            <ToggleGroupItem value="out" className="h-9 rounded-lg text-sm">Out</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="grid grid-cols-2 items-center gap-3 md:grid-cols-[1fr_1fr_auto]">
          <Select value={acct} onValueChange={filter(setAcct)}>
            <SelectTrigger aria-label="Account" className="min-w-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All accounts</SelectItem>
              {accounts
                .filter((a) => a.type !== "investment" && a.type !== "loan")
                .map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Select value={cat} onValueChange={filter(setCat)}>
            <SelectTrigger aria-label="Category" className="min-w-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="col-span-2 flex items-center gap-3 md:col-span-1">
            <Switch id="to-review" size="sm" checked={review} onCheckedChange={filter(setReview)} />
            <Label htmlFor="to-review" className="whitespace-nowrap">
              To review
            </Label>
            {filtering && (
              <Button size="sm" variant="ghost" className="ml-auto" onClick={reset}>
                <FilterX /> Clear
              </Button>
            )}
          </div>
        </div>
      </section>

      {notice && (
        <Alert variant="success">
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm" aria-live="polite">
        <span className="text-subtle">
          <span className="font-mono text-fg">{list.length}</span> transactions
        </span>
        <span className="text-subtle">
          In <span className="font-mono text-success">{money(sum.income)}</span>
        </span>
        <span className="text-subtle">
          Out <span className="font-mono text-fg">{money(sum.spending)}</span>
        </span>
      </div>

      {selected.size > 0 && (
        <div className="tactile-surface sticky top-20 z-20 flex flex-wrap items-center gap-3 rounded-2xl p-3 lg:top-20" role="region" aria-label="Selected transactions">
          <span className="text-sm font-medium text-fg">{selected.size} selected</span>
          <div className="w-48">
            <CategorySelect label="Set category for selected" placeholder="Set category" onValueChange={(v) => bulk({ category: v as CategoryId }, `moved to ${categoryById[v as CategoryId].name}`)} />
          </div>
          <Button size="sm" onClick={() => bulk({ reviewed: true }, "marked as reviewed")}>
            <Check /> Mark reviewed
          </Button>
          <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setSelected(new Set())}>
            Clear selection
          </Button>
        </div>
      )}

      <section aria-label="Transactions" className="tactile-tray overflow-hidden rounded-3xl">
        <div className="flex items-center gap-4 border-b border-line px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-subtle sm:px-5">
          <Checkbox
            checked={allOnPage}
            onCheckedChange={(v) => page.forEach((t) => toggle(t.id, v === true))}
            aria-label="Select all shown"
          />
          <span className="hidden w-16 sm:block">Date</span>
          <span className="flex-1">Description</span>
          <span className="hidden w-36 md:block">Category</span>
          <span className="hidden w-36 lg:block">Account</span>
          <span className="w-24 text-right">Amount</span>
        </div>
        {page.length === 0 ? (
          <div className="grid place-items-center gap-3 py-14 text-center">
            <p className="text-sm text-subtle">No transactions match those filters.</p>
            <Button size="sm" onClick={reset}>
              Clear filters
            </Button>
          </div>
        ) : (
          <ul className="grid grid-cols-1">
            {page.map((t) => (
              <Row key={t.id} tx={t} checked={selected.has(t.id)} onCheck={(v) => toggle(t.id, v)} onOpen={() => setOpen(t.id)} accountName={account(t.account)?.name ?? ""} />
            ))}
          </ul>
        )}
      </section>

      {list.length > shown && (
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-subtle">
          Showing {shown} of {list.length}
          <Button size="sm" onClick={() => setShown((n) => n + PAGE)}>
            Show more
          </Button>
        </div>
      )}

      <EditDialog tx={current} onClose={() => setOpen(null)} />
    </>
  );
}

function Row({ tx: t, checked, onCheck, onOpen, accountName }: { tx: Transaction; checked: boolean; onCheck: (v: boolean) => void; onOpen: () => void; accountName: string }) {
  const { money } = useFinance();
  const category = t.splits?.length ? "Split" : categoryById[t.category].name;
  return (
    <li className={cn("flex items-center gap-4 border-b border-line px-4 py-2.5 last:border-b-0 sm:px-5", checked && "bg-well/60")}>
      <Checkbox checked={checked} onCheckedChange={(v) => onCheck(v === true)} aria-label={`Select ${t.merchant} on ${formatDate(t.date)}`} />
      <span className="hidden w-16 text-sm text-subtle sm:block">{formatDate(t.date)}</span>
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-(--tactile-focus)">
        <CategoryIcon category={t.splits?.length ? t.splits[0].category : t.category} />
        <span className="min-w-0">
          <span className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-fg">{t.merchant}</span>
            {t.pending && (
              <Badge variant="well" className="hidden h-5 text-[10px] sm:inline-flex">
                Pending
              </Badge>
            )}
            {!t.reviewed && <span className="tactile-led size-1.5 flex-none" data-on aria-label="Not reviewed" />}
          </span>
          <span className="block truncate text-xs text-subtle">
            <span className="sm:hidden">
              {formatDate(t.date)} · {t.pending ? "Pending · " : ""}
            </span>
            <span className="md:hidden">{category}</span>
            {t.note && <span className="hidden md:inline">{t.note}</span>}
          </span>
        </span>
      </button>
      <span className="hidden w-36 items-center gap-2 truncate text-sm text-subtle md:flex">
        <span aria-hidden className="size-2 flex-none rounded-full" style={{ background: categoryById[t.category].color }} />
        {category}
      </span>
      <span className="hidden w-36 truncate text-sm text-subtle lg:block">{accountName}</span>
      <span className={cn("w-24 text-right font-mono text-sm tabular-nums", t.amount > 0 ? "text-success" : "text-fg")}>{money(t.amount, { sign: true })}</span>
    </li>
  );
}

function EditDialog({ tx, onClose }: { tx?: Transaction; onClose: () => void }) {
  return (
    <Dialog open={!!tx} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>{tx && <EditForm key={tx.id} tx={tx} onClose={onClose} />}</DialogContent>
    </Dialog>
  );
}

function EditForm({ tx, onClose }: { tx: Transaction; onClose: () => void }) {
  const { money, account, updateTransactions } = useFinance();
  const [category, setCategory] = useState<CategoryId>(tx.category);
  const [note, setNote] = useState(tx.note ?? "");
  const [reviewed, setReviewed] = useState(!!tx.reviewed);

  return (
    <>
      <DialogHeader>
        <DialogTitle>{tx.merchant}</DialogTitle>
        <DialogDescription>
          {money(tx.amount, { sign: true })} · {formatDate(tx.date, "long")} · {account(tx.account)?.name}
          {tx.pending ? " · Pending" : ""}
        </DialogDescription>
      </DialogHeader>
      <form
        id="edit-tx"
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          updateTransactions([tx.id], { ...(category !== tx.category || tx.splits ? { category } : {}), note: note.trim() || undefined, reviewed });
          onClose();
        }}
      >
        <FormField label="Category" description={tx.splits?.length ? "This one is split. Picking a category replaces the split." : undefined}>
          <CategorySelect value={category} onValueChange={(v) => setCategory(v as CategoryId)} label="Category" />
        </FormField>
        <FormField label="Note">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note to find it later" rows={3} />
        </FormField>
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="reviewed">Reviewed</Label>
          <Switch id="reviewed" checked={reviewed} onCheckedChange={setReviewed} />
        </div>
      </form>
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" form="edit-tx" variant="accent">
          Save
        </Button>
      </DialogFooter>
    </>
  );
}
