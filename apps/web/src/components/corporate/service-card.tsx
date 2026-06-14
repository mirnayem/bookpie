type ServiceCardProps = {
  icon: string;
  title: string;
};

export function ServiceCard({ icon, title }: ServiceCardProps) {
  return (
    <article className="rounded-lg border bg-card p-6 text-center">
      <div className="text-2xl" aria-hidden="true">
        {icon}
      </div>
      <h3 className="mt-3 text-sm font-semibold">{title}</h3>
    </article>
  );
}
