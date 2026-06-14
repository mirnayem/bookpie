import Link from "next/link";

type FooterLinkGroupProps = {
  title: string;
  links: string[];
};

export function FooterLinkGroup({ title, links }: FooterLinkGroupProps) {
  return (
    <div>
      <h2 className="text-sm font-semibold">{title}</h2>
      <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
        {links.map((link) => (
          <li key={link}>
            <Link href="/" className="hover:text-primary">
              {link}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
