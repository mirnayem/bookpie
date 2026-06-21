type PriceRangeFilterProps = {
  min: number;
  max: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
};

export function PriceRangeFilter({ min, max, onMinChange, onMaxChange }: PriceRangeFilterProps) {
  return (
    <section className="rounded-md border bg-card">
      <h2 className="bg-muted px-4 py-3 text-sm font-semibold">Price Range</h2>
      <div className="space-y-4 p-4">
        <div className="h-1 rounded-full bg-primary" />
        <div className="grid grid-cols-2 gap-3">
          <input
            className="h-10 rounded-md border text-center text-sm"
            value={min}
            inputMode="numeric"
            aria-label="Minimum price"
            onChange={(event) => onMinChange(Number(event.target.value) || 0)}
          />
          <input
            className="h-10 rounded-md border text-center text-sm"
            value={max}
            inputMode="numeric"
            aria-label="Maximum price"
            onChange={(event) => onMaxChange(Number(event.target.value) || 0)}
          />
        </div>
      </div>
    </section>
  );
}
