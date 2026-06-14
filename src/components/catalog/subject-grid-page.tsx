import { SubjectCard } from "@/components/catalog/subject-card";
import { SearchBar } from "@/components/layout/search-bar";
import type { Category } from "@/types/storefront";

type SubjectGridPageProps = {
  categories: Category[];
};

export function SubjectGridPage({ categories }: SubjectGridPageProps) {
  return (
    <main className="container-page py-8">
      <div className="mx-auto max-w-[1260px]">
        <h1 className="text-xl font-semibold">বিষয় সমূহ</h1>
        <SearchBar className="mt-5 max-w-sm" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {categories.map((category) => (
            <SubjectCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </main>
  );
}
