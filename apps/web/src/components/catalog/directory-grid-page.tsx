import { DirectoryCard } from "@/components/catalog/directory-card";
import { SearchBar } from "@/components/layout/search-bar";
import type { DirectoryEntry } from "@/types/storefront";

type DirectoryGridPageProps = {
  title: string;
  entries: DirectoryEntry[];
};

export function DirectoryGridPage({ title, entries }: DirectoryGridPageProps) {
  return (
    <main className="container-page py-8">
      <div className="mx-auto max-w-[980px]">
        <h1 className="text-xl font-semibold">{title}</h1>
        <SearchBar className="mt-5 max-w-sm" />
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {entries.map((entry) => (
            <DirectoryCard key={entry.id} entry={entry} />
          ))}
        </div>
      </div>
    </main>
  );
}
