import type { ReactNode } from "react";

type CheckoutFieldProps = {
  label: string;
  error?: string;
  className?: string;
  children: ReactNode;
};

export function CheckoutField({ label, error, className, children }: CheckoutFieldProps) {
  return (
    <label className={className ? `block ${className}` : "block"}>
      <span className="text-sm font-medium">{label}</span>
      <span className="mt-2 block">{children}</span>
      {error ? <span className="mt-1 block text-xs font-medium text-destructive">{error}</span> : null}
    </label>
  );
}
