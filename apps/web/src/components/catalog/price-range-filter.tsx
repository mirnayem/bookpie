export function PriceRangeFilter() {
  return (
    <section className="rounded-md border bg-card">
      <h2 className="bg-muted px-4 py-3 text-sm font-semibold">Price Range</h2>
      <div className="space-y-4 p-4">
        <div className="h-1 rounded-full bg-primary" />
        <div className="grid grid-cols-2 gap-3">
          <input className="h-10 rounded-md border text-center text-sm" value="0" readOnly aria-label="Minimum price" />
          <input className="h-10 rounded-md border text-center text-sm" value="30000" readOnly aria-label="Maximum price" />
        </div>
      </div>
    </section>
  );
}
