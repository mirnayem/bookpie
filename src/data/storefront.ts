import {
  makeAvatar,
  makeAuthIllustration,
  makeBookCover,
  makeCategoryTile,
  makeCircleImage,
  makeHeroBanner,
  makeLogo,
  makePlaceholderIcon,
  makePhoneMockup,
  makeSquarePromo,
  makeWidePromo,
} from "@/lib/svg-images";
import type {
  AppPromoContent,
  CampaignPage,
  Category,
  DirectoryEntry,
  ListingPage,
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

const authorDirectoryNames = [
  "EL Publications পরিবার",
  "আবুল আলী",
  "ইং. জে. ভাসিন",
  "ইমরান শেখ",
  "করলেন (রহ.) কাতিব",
  "ড. ভের হার্ট",
  "ড. নাসির সাফারি",
  "দিভা রানী ঘোষ",
  "পরেশ চন্দ্র মণ্ডল",
  "হাসনাত ইশতিয়াক",
  "মোবারক আহমদ",
  "রাজশেখর বসু",
  "শিমুল ফরিদ",
  "সৈয়দা সোনাইয়া",
  "AAOIFI",
  "Anwar Dil",
  "Charles Dickens",
  "Dai Jianbing",
  "Dr. Abul Hossain",
  "Dr. Himel Borkot",
  "Dr. Md. Golzare Nabi",
  "Dr. Muhammad Moniuzzaman",
  "Ernest Hemingway",
  "Jules Verne",
  "Jonathan Swift",
  "K. A. Islam",
  "H. G. Wells",
  "John Sanday",
  "Julifikar Newton",
  "Georgian Folk-Take",
  "Fadlur R Kalim Kashmiri",
  "H.M.M. Jubair Ahmed",
];

const publisherDirectoryNames = [
  "Rahman",
  "ABC Toys",
  "Absar",
  "Acron",
  "Afdal",
  "Akhorbritto",
  "Amazfit",
  "An Nazat",
  "Anasup Publication",
  "Anker",
  "Anwer",
  "Apple",
  "Asol Food",
  "BCS Plus Publications",
  "BEARDBROS",
  "BMW",
  "Baseus",
  "Believer's Sign",
  "Best Time",
  "Binirman Academy",
  "Bonobhumi",
  "Boya",
  "Career Publications",
  "Clear Concept Publication",
  "Deen Land",
  "Deli",
  "Destination Publications",
  "Dom's",
  "Duckey",
  "DyuBOOKISH",
  "Ekota Stationary",
  "El Publication",
  "Endeavor Publications",
  "FONENG",
  "Falaq Food",
  "Fevicol",
];

export const directoryEntries = {
  authors: authorDirectoryNames.map<DirectoryEntry>((name, index) => ({
    id: `directory-author-${index + 1}`,
    name,
    href: `/authors/${index + 1}`,
    image: makePlaceholderIcon("author"),
  })),
  publishers: publisherDirectoryNames.map<DirectoryEntry>((name, index) => ({
    id: `directory-publisher-${index + 1}`,
    name,
    href: `/publishers/${index + 1}`,
    image: makePlaceholderIcon("publisher"),
  })),
};

export const subjectCategories: Category[] = [
  "আইন ও বিচার",
  "আত্ম-উন্নয়ন, মোটিভেশনাল ও মেডিটেশন",
  "আরবী ভাষা শিক্ষা",
  "ইতিহাস ও ঐতিহ্য",
  "ইসলামী বই",
  "উপন্যাস",
  "একাডেমিক",
  "কমিকস, নকশা ও ছবির গল্প",
  "কম্পিউটার, ইন্টারনেট, ফ্রিল্যান্সিং ও আউটসোর্সিং",
  "কৃষি ও কৃষক",
  "খেলাধুলা",
  "গণমাধ্যম ও সাংবাদিকতা",
  "গণিত, বিজ্ঞান ও প্রযুক্তি",
  "গল্প",
  "ছড়া, কবিতা ও আবৃত্তি",
  "জীবনী, স্মৃতিচারণ ও সাক্ষাৎকার",
  "ট্রাভেল, পেইন্টিং, ডিজাইন ও ফটোগ্রাফি",
  "দর্শন বিষয়ক বই",
  "নাটক",
  "নারী ও শিশু",
  "পরিবার ও প্যারেন্টিং",
  "পরিবেশ ও প্রকৃতি",
  "প্রফেশনাল, জার্নাল ও রেফারেন্স",
  "প্রবন্ধ",
  "প্রাণী ও উদ্ভিদতত্ত্ব",
  "ভ্রমণ ও প্রবাস",
  "বিজ্ঞান সমগ্র",
  "ব্যবসা ও ব্যবস্থাপনা",
  "ব্যবসা, বিনিয়োগ ও অর্থনীতি",
  "শিশু-কিশোর বই",
  "সংগীত, চলচ্চিত্র ও বিনোদন",
  "সমাজ, সভ্যতা ও সংস্কৃতি",
  "সায়েন্স ফিকশন",
  "স্বাস্থ্য, পরিচর্যা ও রোগ নিরাময়",
].map((title, index) => ({
  id: `subject-${index + 1}`,
  title,
  href: `/categories/subject-${index + 1}`,
}));

export const campaignPages: Record<string, CampaignPage> = {
  bookFair: {
    id: "bookFair",
    title: "আজকের অফার",
    href: "/online-book-fair",
    activeNav: "/online-book-fair",
    hero: { id: "book-fair-hero", title: "বইমেলা ২০২৬", href: "/online-book-fair", image: makeWidePromo("বইমেলা ২০২৬", "প্রতি প্রকাশনে সেরা ছাড়", "#e5e7eb", "#f8fafc") },
    squarePromos: [
      { id: "sq-1", title: "Watch", href: "/online-book-fair", image: makeSquarePromo("PREMIUM WATCHES", "ZERO DELIVERY", "#d1d5db", "#f8fafc") },
      { id: "sq-2", title: "Umrah", href: "/online-book-fair", image: makeSquarePromo("উমরাহ কর্নার", "৪০% ছাড়", "#f8fafc", "#dbeafe") },
      { id: "sq-3", title: "Food", href: "/online-book-fair", image: makeSquarePromo("প্রান্ত প্রকাশন", "৫০% ছাড়", "#fef3c7", "#ffffff") },
      { id: "sq-4", title: "Agro", href: "/online-book-fair", image: makeSquarePromo("Vesoji Agro", "ফ্রি ডেলিভারি", "#22c55e", "#38bdf8") },
      { id: "sq-5", title: "Rain", href: "/online-book-fair", image: makeSquarePromo("বৃষ্টি হোক", "প্রস্তুতি থাকুক", "#475569", "#94a3b8") },
      { id: "sq-6", title: "Islamic", href: "/online-book-fair", image: makeSquarePromo("ইসলামি বই", "৭৮% ডিসকাউন্ট", "#f8fafc", "#fee2e2") },
    ],
    sections: [
      { id: "fair-books", title: "বইমেলা ২০২৬", href: "/books/fair", products: products.slice(0, 10) },
      { id: "fair-publishers", title: "জনপ্রিয় প্রকাশক", href: "/publishers", products: products.slice(6, 14) },
    ],
  },
  preorder: {
    id: "preorder",
    title: "প্রি-অর্ডার",
    href: "/preorder",
    activeNav: "/preorder",
    hero: { id: "preorder-hero", title: "নতুন বই", href: "/preorder", image: makeWidePromo("বুক করুন নতুন বই", "বাজারে আসার আগেই", "#111827", "#1f2937") },
    sections: [{ id: "preorder-products", title: "প্রি-অর্ডার", href: "/preorder", products: [...products.slice(8), ...products.slice(0, 8)] }],
  },
  food: {
    id: "food",
    title: "ফুড",
    href: "/food-products",
    activeNav: "/food-products",
    hero: { id: "food-hero", title: "সেফ ফুড", href: "/food-products", image: makeWidePromo("দেশ সেরা ব্র্যান্ডের", "সেফ ফুড", "#111827", "#14532d") },
    categoryRail: circularCategories,
    categoryTiles: [
      { id: "food-tile-1", title: "Khaas Food", href: "/food-products", image: makeCategoryTile("Khaas food", "#166534") },
      { id: "food-tile-2", title: "মধুময় উদ্যোগ", href: "/food-products", image: makeCategoryTile("Safe Food", "#15803d") },
      { id: "food-tile-3", title: "আসল ফুড", href: "/food-products", image: makeCategoryTile("Pure Food", "#365314") },
    ],
    sections: [
      { id: "honey", title: "মধু", href: "/food-products/honey", products: products.slice(0, 9) },
      { id: "oil", title: "তেল ও ঘি", href: "/food-products/oil", products: products.slice(7, 16) },
    ],
  },
  lifestyle: {
    id: "lifestyle",
    title: "লাইফস্টাইল",
    href: "/lifestyle-products",
    activeNav: "/lifestyle-products",
    hero: { id: "lifestyle-hero", title: "হজের প্রয়োজনীয়", href: "/lifestyle-products", image: makeWidePromo("হজের প্রয়োজনীয়", "সকল সরঞ্জাম", "#d6c3a1", "#f8fafc") },
    categoryTiles: ["PANJABI", "THOBE", "RUMAL", "TUPI", "HIJAB", "CAP", "ATTAR", "PRAYER MAT"].map((title, index) => ({
      id: `lifestyle-tile-${index + 1}`,
      title,
      href: "/lifestyle-products",
      image: makeCategoryTile(title, ["#111827", "#6b7280", "#78350f", "#0f172a"][index % 4]),
    })),
    sections: [
      { id: "thobe", title: "জুব্বা / THOBE", href: "/lifestyle-products/thobe", products: products.slice(3, 12) },
      { id: "attar", title: "আতর", href: "/lifestyle-products/attar", products: products.slice(9, 18) },
    ],
  },
  gadgets: {
    id: "gadgets",
    title: "গ্যাজেট",
    href: "/gadgets",
    activeNav: "/gadgets",
    hero: { id: "gadget-hero", title: "স্মার্ট রিচার্জেবল ফ্যান", href: "/gadgets", image: makeWidePromo("স্মার্ট রিচার্জেবল ফ্যান", "জীবন হোক সহজ", "#f3f4f6", "#ffffff") },
    categoryTiles: ["EARPHONE", "SMART WATCH", "LIGHT", "POWER BANK", "CABLES", "PLUGS", "TRIMMER", "PORTABLE FAN"].map((title, index) => ({
      id: `gadget-tile-${index + 1}`,
      title,
      href: "/gadgets",
      image: makeCategoryTile(title, ["#0f172a", "#374151", "#9ca3af", "#111827"][index % 4]),
    })),
    sections: [
      { id: "earphone", title: "Earphone & Headphones", href: "/gadgets/earphone", products: products.slice(0, 9) },
      { id: "watch", title: "Smart Watch", href: "/gadgets/watch", products: products.slice(10, 19) },
    ],
  },
  generalBooks: {
    id: "generalBooks",
    title: "বই",
    href: "/general-books",
    activeNav: "/general-books",
    hero: { id: "general-hero", title: "ইতিহাস ও রাজনীতি", href: "/general-books", image: makeWidePromo("ইতিহাস ও রাজনীতির", "সকল বই এখন BookPie-এ", "#e5e7eb", "#f8fafc") },
    sections: [
      { id: "history-books", title: "ইতিহাস ও ঐতিহ্য", href: "/categories/history", products: products.slice(0, 10) },
      { id: "self-help-books", title: "আত্ম উন্নয়ন ও মোটিভেশন", href: "/categories/self-development", products: products.slice(8, 18) },
      { id: "marketing-books", title: "মার্কেটিং ও সেলিং", href: "/categories/marketing", products: products.slice(12, 22) },
    ],
  },
};

export const listingPages: Record<string, ListingPage> = {
  stationary: {
    id: "stationary",
    title: "স্টেশনারী",
    activeNav: "/cat/products/stationary-item",
    tags: ["খাতা, কলম", "Adhesive, Gum & Glue Stick", "Artist Inks & Paints", "Board Pin, Safety Pin & Gems Clip", "Book Plates & Markers", "Canvas", "Compass And Geometry Box", "Desk Organizers", "Diary And Notebook", "Eraser & Sharpener"],
    filters: [
      { title: "প্রকাশক", options: ["পাঞ্জেরী পাবলিকেশন লিমিটেড (16)", "চেতনা প্রকাশন (4)", "প্রিমিয়ার পাবলিকেশন (3)", "ইমরুল পাবলিকেশন (1)"] },
      { title: "বিষয় সমূহ", options: ["কি ক্র্যাফট/ক্রিয়েটিভ (9)", "ইংরেজী ও বাংলা (2)"] },
      { title: "লেখক", options: ["পাঞ্জেরী পাবলিকেশন লিমিটেড (2)", "আবুল কুদ্দুস (1)"] },
      { title: "ব্র্যান্ড", options: ["Sevendays Notes (424)", "Iconic Sourcing (100)", "Non Brand (64)", "অফিসমিক্স (42)"] },
    ],
    products: [...products, ...products.slice(0, 12)],
  },
};

export const authIllustration = makeAuthIllustration();
