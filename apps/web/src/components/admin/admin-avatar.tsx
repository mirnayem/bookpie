import { cn } from "@/lib/utils";

type AdminAvatarProps = {
  title: string;
  imageUrl?: string | null;
  className?: string;
};

export function AdminAvatar({ title, imageUrl, className }: AdminAvatarProps) {
  const fallback = fallbackText(title);

  return (
    <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted text-xs font-semibold text-muted-foreground", className)}>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
      ) : (
        <span>{fallback}</span>
      )}
    </div>
  );
}

function fallbackText(title: string) {
  const chars = Array.from(title.trim()).filter((char) => char !== " ");
  return chars.slice(0, 2).join("").toUpperCase() || "BP";
}
