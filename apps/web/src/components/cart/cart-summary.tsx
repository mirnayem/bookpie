import { SummaryLine } from "@/components/cart/summary-line";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatTaka } from "@/lib/format";

type CartSummaryProps = {
  subtotal: number;
  discount: number;
  delivery: number;
};

export function CartSummary({ subtotal, discount, delivery }: CartSummaryProps) {
  const total = subtotal - discount + delivery;

  return (
    <aside className="rounded-lg border bg-card p-7">
      <div className="space-y-5 text-sm">
        <SummaryLine label="দাম" value={formatTaka(subtotal)} />
        <SummaryLine label="ছাড়" value={`-${formatTaka(discount)}`} />
        <SummaryLine label="মোট দাম" value={formatTaka(subtotal - discount)} />
        <SummaryLine label="ডেলিভারি ফি" value={formatTaka(delivery)} />
        <SummaryLine label="সর্বমোট" value={formatTaka(total)} strong />
      </div>
      <form className="mt-7 flex gap-2">
        <Input placeholder="Enter your coupon code" aria-label="Coupon code" />
        <Button type="submit">Apply</Button>
      </form>
    </aside>
  );
}
