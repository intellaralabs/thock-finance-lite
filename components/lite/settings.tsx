"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useState, useSyncExternalStore, type FormEvent } from "react";
import { profile } from "@/data/finance";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useFinance } from "@/components/lite/finance-provider";
import { ProBadge } from "@/components/lite/pro-badge";
import { PageHeader } from "@/components/lite/page-header";
import { currencies, formatMoney, type Currency } from "@/lib/finance";
import { showProPreviews } from "@/lib/links";

const notifications = [
  { id: "n-large", label: "Large purchases", hint: "Anything over $250", on: true },
  { id: "n-budget", label: "Budget warnings", hint: "When a budget is on pace to go over", on: true },
  { id: "n-income", label: "Money in", hint: "When your pay or a refund arrives", on: true },
  { id: "n-weekly", label: "Weekly summary", hint: "Mondays at 9:00", on: false },
];

const noop = () => () => {};

export function SettingsScreen() {
  const { theme, setTheme } = useTheme();
  const { currency, setCurrency, hidden, setHidden } = useFinance();
  // The theme is only known in the browser; render the radio group unselected on the server.
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(profile.name);

  function save(e: FormEvent) {
    e.preventDefault();
    setSaved(true);
  }

  return (
    <>
      <PageHeader title="Settings" description="Your profile and how the app shows your money." />
      <div className="grid max-w-2xl gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="flex items-center gap-4">
              <Avatar size="lg">
                <AvatarFallback>
                  {name
                    .split(/\s+/)
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <span className="grid">
                <span className="font-medium text-fg">{name || "Your name"}</span>
                <span className="text-sm text-subtle">{profile.email}</span>
              </span>
            </div>
            <form onSubmit={save} onChange={() => setSaved(false)} className="grid gap-4">
              <div className="grid items-start gap-4 sm:grid-cols-2">
                <FormField label="Name">
                  <Input name="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                </FormField>
                <FormField label="Email">
                  <Input name="email" type="email" defaultValue={profile.email} autoComplete="email" />
                </FormField>
              </div>
              {saved && (
                <Alert variant="success">
                  <AlertDescription>Saved.</AlertDescription>
                </Alert>
              )}
              <Button type="submit" variant="accent" className="w-fit">
                Save changes
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5">
            <FormField label="Currency" description={`Amounts show as ${formatMoney(1234.5, currency)}.`}>
              <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                <SelectTrigger aria-label="Currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <div className="flex items-center gap-4">
              <label htmlFor="hide" className="min-w-0 flex-1 cursor-pointer">
                <span className="block text-sm font-medium text-fg">Hide balances</span>
                <span className="block text-xs text-subtle">Show •••• instead of amounts. The eye in the header does the same.</span>
              </label>
              <Switch id="hide" size="sm" checked={hidden} onCheckedChange={setHidden} />
            </div>
            <Separator />
            <div className="grid gap-3">
              <span className="text-sm font-medium text-fg">Theme</span>
              <RadioGroup value={mounted ? theme : undefined} onValueChange={setTheme} aria-label="Theme" className="grid gap-3 sm:grid-cols-3">
                {[
                  { value: "light", label: "Light" },
                  { value: "dark", label: "Dark" },
                  { value: "system", label: "Match system" },
                ].map((o) => (
                  <div key={o.value} className="flex items-center gap-3">
                    <RadioGroupItem id={`theme-${o.value}`} value={o.value} />
                    <Label htmlFor={`theme-${o.value}`}>{o.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="gap-0">
            {notifications.map((n, i) => (
              <div key={n.id}>
                {i > 0 && <Separator className="my-1" />}
                <div className="flex items-center gap-4 py-3">
                  <label htmlFor={n.id} className="min-w-0 flex-1 cursor-pointer">
                    <span className="block text-sm font-medium text-fg">{n.label}</span>
                    <span className="block text-xs text-subtle">{n.hint}</span>
                  </label>
                  <Switch id={n.id} size="sm" defaultChecked={n.on} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {showProPreviews && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Connected banks <ProBadge />
              </CardTitle>
              <CardDescription>Connecting, syncing and disconnecting banks is in the full template.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-fit">
                <Link href="/pro/accounts">See accounts in the full template</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
