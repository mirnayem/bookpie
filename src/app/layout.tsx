import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BookPie | Online Book Shop",
  description: "A reusable Next.js bookstore storefront inspired by modern Bangladeshi ecommerce.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bn">
      <body>{children}</body>
    </html>
  );
}
