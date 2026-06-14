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

export type DirectoryEntry = {
  id: string;
  name: string;
  image: string;
  href: string;
};

export type CampaignPage = {
  id: string;
  title: string;
  href: string;
  activeNav: string;
  hero: PromoBanner;
  squarePromos?: PromoBanner[];
  categoryTiles?: PromoBanner[];
  categoryRail?: Category[];
  sections: ProductSection[];
};

export type ListingFilter = {
  title: string;
  options: string[];
};

export type ListingPage = {
  id: string;
  title: string;
  activeNav: string;
  tags: string[];
  filters: ListingFilter[];
  products: Product[];
};
