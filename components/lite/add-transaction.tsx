"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { categories, today, type CategoryId } from "@/data/finance";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useFinance } from "@/components/lite/finance-provider";

/** "Add transaction" dialog. Pass the button that opens it as children. */
export function AddTransactionDialog({ children, onAdded }: { children: ReactNode; onAdded?: (merchant: string) => void }) {
  const { accounts, addTransaction } = useFinance();
  const [open, setOpen] = useState(false);
  const [flow, setFlow] = useState<"out" | "in">("out");
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today);
  const [category, setCategory] = useState<CategoryId>("groceries");
  const [account, setAccount] = useState("checking");
  const [tried, setTried] = useState(false);

  const value = Number(amount);
  const errors = {
    merchant: merchant.trim() ? undefined : "Who was it paid to or from?",
    amount: value > 0 ? undefined : "Enter an amount above zero.",
    date: date ? undefined : "Pick a date.",
  };
  const usable = categories.filter((c) => (flow === "in" ? c.kind !== "expense" : c.kind !== "income"));
  const spendable = accounts.filter((a) => a.type !== "investment" && a.type !== "loan");

  function reset() {
    setFlow("out");
    setMerchant("");
    setAmount("");
    setDate(today);
    setCategory("groceries");
    setAccount("checking");
    setTried(false);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    setTried(true);
    if (errors.merchant || errors.amount || errors.date) return;
    addTransaction({
      date,
      merchant: merchant.trim(),
      category,
      account,
      amount: flow === "in" ? value : -value,
      reviewed: true,
    });
    onAdded?.(merchant.trim());
    setOpen(false);
    reset();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a transaction</DialogTitle>
          <DialogDescription>For cash, or anything your bank hasn&apos;t picked up yet.</DialogDescription>
        </DialogHeader>
        <form id="add-tx" onSubmit={submit} noValidate className="grid gap-4">
          <ToggleGroup
            type="single"
            value={flow}
            onValueChange={(v) => {
              if (!v) return;
              setFlow(v as "in" | "out");
              setCategory(v === "in" ? "income" : "groceries");
            }}
            aria-label="Money in or out"
            className="w-full [&>*]:flex-1"
          >
            <ToggleGroupItem value="out">Money out</ToggleGroupItem>
            <ToggleGroupItem value="in">Money in</ToggleGroupItem>
          </ToggleGroup>
          <FormField label="Merchant or payer" required error={tried ? errors.merchant : undefined}>
            <Input value={merchant} onChange={(e) => setMerchant(e.target.value)} placeholder={flow === "in" ? "e.g. Brightline Ltd" : "e.g. Corner Café"} autoFocus />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Amount" required error={tried ? errors.amount : undefined}>
              <Input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" type="number" min="0" step="0.01" placeholder="0.00" />
            </FormField>
            <FormField label="Date" required error={tried ? errors.date : undefined}>
              <Input value={date} onChange={(e) => setDate(e.target.value)} type="date" max={today} />
            </FormField>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Category">
              <Select value={category} onValueChange={(v) => setCategory(v as CategoryId)}>
                <SelectTrigger aria-label="Category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {usable.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Account">
              <Select value={account} onValueChange={setAccount}>
                <SelectTrigger aria-label="Account">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {spendable.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>
        </form>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" form="add-tx" variant="accent">
            Add transaction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
