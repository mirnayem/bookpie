import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2 text-primary" aria-label="BookPie home">
      <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary text-lg font-bold">B</span>
      <span className="text-2xl font-bold tracking-normal">BookPie</span>
    </Link>
  );
}
