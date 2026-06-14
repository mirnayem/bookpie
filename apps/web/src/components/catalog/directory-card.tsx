import Image from "next/image";
import Link from "next/link";
import type { DirectoryEntry } from "@/types/storefront";

type DirectoryCardProps = {
  entry: DirectoryEntry;
};

export function DirectoryCard({ entry }: DirectoryCardProps) {
  return (
    <Link href={entry.href} className="rounded-lg border bg-card text-center transition-colors hover:border-primary/50">
      <div className="relative mx-auto mt-4 h-20 w-24">
        <Image src={entry.image} alt={entry.name} fill sizes="96px" className="object-contain" unoptimized />
      </div>
      <div className="mt-3 border-t px-3 py-3 text-clamp-1 text-sm font-semibold text-foreground/80">{entry.name}</div>
    </Link>
  );
}
