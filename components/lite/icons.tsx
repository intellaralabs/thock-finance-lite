import {
  ArrowLeftRight,
  Banknote,
  ChartLine,
  CreditCard,
  Film,
  HeartPulse,
  House,
  Landmark,
  PiggyBank,
  Plane,
  Plug,
  Repeat,
  ShoppingBag,
  ShoppingCart,
  TrainFront,
  Utensils,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { categoryById, type AccountType, type CategoryId } from "@/data/finance";
import { cn } from "@/lib/utils";

export const categoryIcons: Record<CategoryId, LucideIcon> = {
  income: Banknote,
  housing: House,
  groceries: ShoppingCart,
  dining: Utensils,
  transport: TrainFront,
  shopping: ShoppingBag,
  utilities: Plug,
  entertainment: Film,
  health: HeartPulse,
  travel: Plane,
  subscriptions: Repeat,
  transfer: ArrowLeftRight,
};

export const accountIcons: Record<AccountType, LucideIcon> = {
  checking: Wallet,
  savings: PiggyBank,
  credit: CreditCard,
  investment: ChartLine,
  loan: Landmark,
};

/** A small raised key with the category's icon and a coloured LED. */
export function CategoryIcon({ category, className }: { category: CategoryId; className?: string }) {
  const Icon = categoryIcons[category];
  const color = categoryById[category].color;
  return (
    <span className={cn("tactile-key pointer-events-none relative grid size-9 flex-none place-items-center rounded-xl text-subtle [&_svg]:size-4", className)}>
      <Icon aria-hidden />
      <span aria-hidden className="absolute -right-0.5 -top-0.5 size-2 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
    </span>
  );
}

/** A colour dot for legends. */
export function Swatch({ color, className }: { color: string; className?: string }) {
  return <span aria-hidden className={cn("inline-block size-2.5 flex-none rounded-[3px]", className)} style={{ background: color }} />;
}
