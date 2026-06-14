import { Star } from "lucide-react";

const rows = [
  { stars: 5, count: 39, width: "88%" },
  { stars: 4, count: 0, width: "0%" },
  { stars: 3, count: 1, width: "12%" },
  { stars: 2, count: 1, width: "10%" },
  { stars: 1, count: 3, width: "18%" },
];

export function RatingBars() {
  return (
    <section className="border-t py-8">
      <h2 className="mb-6 text-xl font-semibold">রিভিউ এবং রেটিং</h2>
      <div className="grid gap-8 md:grid-cols-[180px_1fr]">
        <div>
          <p className="text-4xl font-bold">4.61</p>
          <div className="mt-2 flex text-primary">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} className="h-5 w-5 fill-current" aria-hidden="true" />
            ))}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">44 Ratings</p>
        </div>
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.stars} className="grid grid-cols-[72px_1fr_28px] items-center gap-3 text-sm">
              <span className="flex text-primary">
                {Array.from({ length: row.stars }).map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-current" aria-hidden="true" />
                ))}
              </span>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary" style={{ width: row.width }} />
              </div>
              <span>{row.count}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
