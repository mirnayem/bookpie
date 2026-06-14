export type Product = {
  id: string;
  slug: string;
  title: string;
  author?: string;
  image: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  categoryIds: string[];
};

export type Category = {
  id: string;
  title: string;
  image?: string;
  href: string;
};

export type PromoBanner = {
  id: string;
  title: string;
  image: string;
  href: string;
};

export type ProductSection = {
  id: string;
  title: string;
  href: string;
  products: Product[];
};

export type ShowcaseGroup = {
  id: string;
  title: string;
  href: string;
  items: Product[];
};

export type Person = {
  id: string;
  name: string;
  image: string;
  href: string;
};

export type Publisher = {
  id: string;
  name: string;
  logo: string;
  href: string;
};

export type RankedList = {
  id: string;
  title: string;
  href: string;
  products: Product[];
};

export type AppPromoContent = {
  title: string;
  description: string;
  ctaImage: string;
  phoneImage: string;
};
