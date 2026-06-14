import {
  makeAvatar,
  makeBookCover,
  makeCircleImage,
  makeHeroBanner,
  makeLogo,
  makePhoneMockup,
} from "@/lib/svg-images";
import type {
  AppPromoContent,
  Category,
  Person,
  Product,
  ProductSection,
  PromoBanner,
  Publisher,
  RankedList,
  ShowcaseGroup,
} from "@/types/storefront";

const coverPalette = [
  ["Book", "#14532d", "#166534"],
  ["Read", "#7f1d1d", "#dc2626"],
  ["Learn", "#1e3a8a", "#0284c7"],
  ["Faith", "#854d0e", "#f59e0b"],
  ["Life", "#312e81", "#7c3aed"],
  ["Story", "#164e63", "#0891b2"],
  ["Guide", "#4c1d95", "#a855f7"],
  ["Text", "#365314", "#84cc16"],
  ["Think", "#881337", "#f43f5e"],
  ["History", "#334155", "#94a3b8"],
  ["Family", "#7c2d12", "#fb923c"],
  ["Kids", "#0f766e", "#2dd4bf"],
] as const;

const titles = [
  ["বিজয় আল্লাহর দান", "শায়খ আলী"],
  ["গোয়েন্দা হুক্কাশির সন্ধান", "মনোজ বসু"],
  ["ছোটদের ঈমান আবু হানিফা", "মাওলানা মুহাম্মদ"],
  ["পালিয়ে যাওয়ার টুকরো গল্প", "জামান সাইফ"],
  ["বইয়ের ভেতর বিশ্ব", "মাহমুদ রহমান"],
  ["সত্যের অধিকার", "ইমদাদুল হক"],
  ["আলোয় আলোকিত", "হুমায়রা হোসেন"],
  ["মুরগি পালন ও খামার ব্যবস্থা", "কৃষিবিদ মো. আনোয়ার"],
  ["কুরআন থেকে নেওয়া জীবনের পাঠ", "আরিফুল ইসলাম"],
  ["রাহে বেলায়াত", "ড. মোহাম্মদ"],
  ["আর রাহিকুল মাখতুম", "আল্লামা সফিউর"],
  ["এক নজরে কুরআন", "মিজানুর রহমান"],
  ["এখন যৌবন যার", "মাওলানা মুহিব"],
  ["প্রোডাক্টিভ মুসলিম", "মোহাম্মদ ফারিস"],
  ["ইতিহাসের আয়নায় বর্তমান বিশ্বব্যবস্থা", "মেরাজুল হক"],
  ["গাইডেড", "আয়েশা হক"],
  ["তাকফিসির সূরা তাওবা ১ম খণ্ড", "ড. শহীদ"],
  ["মুসলিম কিশোরদের গল্প", "আবদুল্লাহ তামিম"],
  ["সীরাতে রাসূলুল্লাহ", "ইবনে হিশাম"],
  ["মহানবী", "সৈয়দ আলী"],
  ["The Love Bound of a Stepmother", "Abida Borna"],
  ["সুখী পরিবার গঠনের রূপরেখা", "হাফিজা খাতুন"],
  ["নিরাপদ পরিবার", "কারি মোশাররফ"],
  ["পৃথিবীর সেরা গল্প", "মুহাম্মদ হাসান"],
] as const;

export const products: Product[] = titles.map(([title, author], index) => {
  const [coverText, color, accent] = coverPalette[index % coverPalette.length];
  const originalPrice = 260 + index * 35;
  const discountPercent = [30, 25, 50, 20, 15, 40, 10, 18][index % 8];

  return {
    id: `product-${index + 1}`,
    slug: title.toLowerCase().replace(/\s+/g, "-"),
    title,
    author: index === 6 ? undefined : author,
    image: makeBookCover(coverText, `No. ${index + 1}`, color, accent),
    price: Math.round(originalPrice * (1 - discountPercent / 100)),
    originalPrice,
    discountPercent,
    categoryIds: [`cat-${(index % 6) + 1}`],
  };
});

export const heroBanners: PromoBanner[] = [
  {
    id: "hero-academic",
    title: "SSC থেকে University",
    image: makeHeroBanner("SSC থেকে UNIVERSITY", "এক প্ল্যাটফর্মে সম্পূর্ণ একাডেমিক সমাধান", "#b91c1c"),
    href: "/campaigns/academic",
  },
  {
    id: "hero-islamic",
    title: "ইসলামি বই উৎসব",
    image: makeHeroBanner("ইসলামি বই উৎসব", "নির্বাচিত বইয়ে বিশেষ ছাড়", "#7f1d1d"),
    href: "/campaigns/islamic-book-fair",
  },
  {
    id: "hero-new",
    title: "নতুন প্রকাশিত বই",
    image: makeHeroBanner("নতুন প্রকাশিত বই", "নতুন বই ঘরে পৌঁছে যাবে", "#0f766e"),
    href: "/books/new",
  },
];

export const showcaseGroups: ShowcaseGroup[] = [
  { id: "academic", title: "একাডেমিক", href: "/categories/academic", items: products.slice(0, 4) },
  { id: "children", title: "শিশু-কিশোর বই", href: "/categories/children", items: products.slice(4, 8) },
  { id: "alim", title: "আলিম মাদ্রাসা", href: "/categories/alim", items: products.slice(8, 12) },
  { id: "qawmi", title: "কওমি মাদ্রাসা", href: "/categories/qawmi", items: products.slice(12, 16) },
  { id: "politics", title: "রাজনীতি: বাংলাদেশ", href: "/categories/politics", items: products.slice(1, 5) },
  { id: "development", title: "আত্ম উন্নয়ন ও মোটিভেশন", href: "/categories/self-development", items: products.slice(6, 10) },
  { id: "marketing", title: "মার্কেটিং ও সেলিং", href: "/categories/marketing", items: products.slice(11, 15) },
  { id: "programming", title: "কম্পিউটার প্রোগ্রামিং", href: "/categories/programming", items: products.slice(16, 20) },
];

export const circularCategories: Category[] = [
  { id: "dates", title: "Dates (Khejur)", href: "/categories/dates", image: makeCircleImage("Dates", "#92400e") },
  { id: "grain", title: "Grain Food", href: "/categories/grain-food", image: makeCircleImage("Grain", "#a16207") },
  { id: "honey", title: "Honey", href: "/categories/honey", image: makeCircleImage("Honey", "#f59e0b") },
  { id: "nuts", title: "Nuts", href: "/categories/nuts", image: makeCircleImage("Nuts", "#854d0e") },
  { id: "oil", title: "Oil", href: "/categories/oil", image: makeCircleImage("Oil", "#eab308") },
  { id: "herbal", title: "Organic And Herbal", href: "/categories/herbal", image: makeCircleImage("Herbal", "#16a34a") },
  { id: "sauce", title: "Sauces & Pickles", href: "/categories/sauce", image: makeCircleImage("Sauce", "#ef4444") },
  { id: "spice", title: "Spice & Powder", href: "/categories/spice", image: makeCircleImage("Spice", "#b45309") },
];

export const productSections: ProductSection[] = [
  { id: "new", title: "নতুন প্রকাশিত বই", href: "/books/new", products: products.slice(0, 10) },
  { id: "safe-food", title: "সেফ ফুড", href: "/categories/safe-food", products: products.slice(2, 11) },
  { id: "trending", title: "ট্রেন্ডিং বই", href: "/books/trending", products: products.slice(5, 15) },
  { id: "pre-order", title: "প্রি-অর্ডার", href: "/books/pre-order", products: products.slice(8, 18) },
  { id: "islamic", title: "কুরআনের তরজমা ও তাফসীর", href: "/categories/tafsir", products: products.slice(9, 19) },
  { id: "seerah", title: "সীরাতে রাসূলুল্লাহ", href: "/categories/seerah", products: products.slice(10, 21) },
  { id: "history", title: "ইতিহাস ও ঐতিহ্য", href: "/categories/history", products: [...products.slice(14), ...products.slice(0, 3)] },
  { id: "family", title: "Families", href: "/categories/family", products: products.slice(18, 24) },
];

export const authors: Person[] = [
  "ড. মোশাররফ আব্দুল্লাহ",
  "ড. আলী মুহাম্মদ",
  "ড. মোহাম্মদ মানজুর",
  "ড. রাগিব সারজানী",
  "মুফতি আল মাহফুজ",
  "আরিফ আজাদ",
  "আব্দুল্লাহ ইলিয়াস",
  "ড. শমসুদ্দীন আরেফীন",
].map((name, index) => ({
  id: `author-${index + 1}`,
  name,
  href: `/authors/${index + 1}`,
  image: makeAvatar(name, ["#334155", "#7f1d1d", "#14532d", "#4338ca"][index % 4]),
}));

export const publishers: Publisher[] = [
  "মাকতাবাতুল আযহার",
  "সিয়ান পাবলিকেশন",
  "গার্ডিয়ান পাবলিকেশন",
  "ওয়াফি পাবলিকেশন",
  "সমকালীন প্রকাশন",
  "রুহামা পাবলিকেশন",
  "পথিক প্রকাশন",
  "মুহাম্মদ পাবলিকেশন",
].map((name, index) => ({
  id: `publisher-${index + 1}`,
  name,
  href: `/publishers/${index + 1}`,
  logo: makeLogo(`P${index + 1}`, ["#16a34a", "#2563eb", "#dc2626", "#334155"][index % 4]),
}));

export const rankedLists: RankedList[] = [
  { id: "rank-islamic", title: "ইসলামি আদর্শ ও মতবাদ", href: "/bestsellers/islamic", products: products.slice(0, 4) },
  { id: "rank-history", title: "ইতিহাস ও ঐতিহ্য", href: "/bestsellers/history", products: products.slice(4, 8) },
  { id: "rank-kids", title: "শিশু কিশোরদের বই", href: "/bestsellers/kids", products: products.slice(8, 12) },
  { id: "rank-literature", title: "ইসলামি সাহিত্য", href: "/bestsellers/literature", products: products.slice(12, 16) },
];

export const appPromo: AppPromoContent = {
  title: "Make your online shop easier with our mobile app",
  description: "BookPie makes shopping easy. Order authentic books, gifts, and lifestyle products delivered straight to your doorstep.",
  ctaImage: makeLogo("Google Play", "#111827"),
  phoneImage: makePhoneMockup(),
};
