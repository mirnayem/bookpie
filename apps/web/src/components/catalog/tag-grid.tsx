import { ChevronDown } from "lucide-react";

type TagGridProps = {
  tags: string[];
};

export function TagGrid({ tags }: TagGridProps) {
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {tags.map((tag) => (
          <button key={tag} type="button" className="min-h-14 rounded-lg border bg-card px-4 text-sm font-semibold hover:border-primary/50">
            {tag}
          </button>
        ))}
      </div>
      <button type="button" className="mx-auto mt-4 flex items-center gap-1 text-sm font-semibold text-primary">
        আরো দেখুন
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
