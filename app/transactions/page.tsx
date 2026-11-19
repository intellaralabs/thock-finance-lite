import { Suspense } from "react";
import { Transactions } from "@/components/lite/transactions";

export const metadata = { title: "Transactions" };

export default function TransactionsPage() {
  // useSearchParams (for ?category= and ?q=) needs a Suspense boundary on a static page.
  return (
    <Suspense>
      <Transactions />
    </Suspense>
  );
}
