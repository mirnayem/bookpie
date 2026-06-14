import { formatDiscount } from "@/lib/format";

type DiscountBadgeProps = {
  percent: number;
};

export function DiscountBadge({ percent }: DiscountBadgeProps) {
  return (
    <span className="absolute left-2 top-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-center text-[10px] font-bold leading-3 text-primary-foreground">
      {formatDiscount(percent)}
    </span>
  );
}
