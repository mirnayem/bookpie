"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Author, Book, Brand, Category, Publisher, UpsertBookRequest } from "@bookpie/shared";
import { upsertBookRequestSchema } from "@bookpie/shared";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type ProductFormProps = {
  authors: Author[];
  publishers: Publisher[];
  brands: Brand[];
  categories: Category[];
  book?: Book | null;
  busy?: boolean;
  onSubmit: (payload: UpsertBookRequest) => void;
};

export function ProductForm({ authors, publishers, brands, categories, book, busy, onSubmit }: ProductFormProps) {
  const form = useForm<UpsertBookRequest>({
    resolver: zodResolver(upsertBookRequestSchema),
    defaultValues: {
      title: book?.title ?? "",
      slug: book?.slug ?? "",
      description: book?.description ?? "",
      authorId: book?.author.id ?? authors[0]?.id ?? "",
      publisherId: book?.publisher.id ?? publishers[0]?.id ?? "",
      brandId: book?.brand?.id ?? brands[0]?.id ?? null,
      categoryIds: book?.categories.map((category) => category.id) ?? [],
      price: book?.price ?? 0,
      salePrice: book?.salePrice ?? 0,
      warehousePrice: book?.warehousePrice ?? null,
      stock: book?.stock ?? 0,
      coverImageUrl: book?.coverImageUrl ?? null,
      galleryImageUrls: book?.galleryImageUrls ?? [],
      tags: book?.tags ?? [],
      specifications: book?.specifications ?? {},
      attributes: book?.attributes ?? {},
      seoTitle: book?.seoTitle ?? null,
      seoDescription: book?.seoDescription ?? null,
      sku: book?.sku ?? null,
      barcode: book?.barcode ?? null,
      dynamicPricingEnabled: book?.dynamicPricingEnabled ?? false,
    },
  });

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
      <label className="block text-sm font-medium md:col-span-2">
        Title
        <Input className="mt-1" {...form.register("title")} />
      </label>
      <label className="block text-sm font-medium">
        Slug
        <Input className="mt-1" {...form.register("slug")} />
      </label>
      <label className="block text-sm font-medium">
        Cover image URL
        <Input className="mt-1" {...form.register("coverImageUrl")} />
      </label>
      <label className="block text-sm font-medium">
        Author
        <Select className="mt-1" options={authors.map((author) => ({ label: author.name, value: author.id }))} {...form.register("authorId")} />
      </label>
      <label className="block text-sm font-medium">
        Publisher
        <Select className="mt-1" options={publishers.map((publisher) => ({ label: publisher.name, value: publisher.id }))} {...form.register("publisherId")} />
      </label>
      <label className="block text-sm font-medium">
        Brand
        <Select className="mt-1" options={brands.map((brand) => ({ label: brand.name, value: brand.id }))} {...form.register("brandId")} />
      </label>
      <label className="block text-sm font-medium">
        Price
        <Input className="mt-1" type="number" min={0} {...form.register("price", { valueAsNumber: true })} />
      </label>
      <label className="block text-sm font-medium">
        Sale price
        <Input className="mt-1" type="number" min={0} {...form.register("salePrice", { valueAsNumber: true })} />
      </label>
      <label className="block text-sm font-medium">
        Warehouse price
        <Input className="mt-1" type="number" min={0} {...form.register("warehousePrice", { valueAsNumber: true })} />
      </label>
      <label className="block text-sm font-medium">
        Stock
        <Input className="mt-1" type="number" min={0} {...form.register("stock", { valueAsNumber: true })} />
      </label>
      <label className="block text-sm font-medium">
        SKU
        <Input className="mt-1" {...form.register("sku")} />
      </label>
      <label className="block text-sm font-medium">
        Barcode
        <Input className="mt-1" {...form.register("barcode")} />
      </label>
      <label className="block text-sm font-medium">
        SEO title
        <Input className="mt-1" {...form.register("seoTitle")} />
      </label>
      <label className="block text-sm font-medium">
        SEO description
        <Input className="mt-1" {...form.register("seoDescription")} />
      </label>
      <label className="flex items-center gap-2 text-sm font-medium md:col-span-2">
        <input type="checkbox" className="h-4 w-4 accent-primary" {...form.register("dynamicPricingEnabled")} />
        Dynamic pricing enabled
      </label>
      <div className="md:col-span-2">
        <p className="mb-2 text-sm font-medium">Categories</p>
        <div className="grid max-h-44 gap-2 overflow-y-auto rounded-md border p-3 sm:grid-cols-2">
          {categories.map((category) => (
            <label key={category.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" value={category.id} className="h-4 w-4 accent-primary" {...form.register("categoryIds")} />
              {category.name}
            </label>
          ))}
        </div>
      </div>
      <label className="block text-sm font-medium md:col-span-2">
        Description
        <textarea
          className="mt-1 min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          {...form.register("description")}
        />
      </label>
      {Object.values(form.formState.errors).length ? <p className="text-sm text-primary md:col-span-2">Please fix the highlighted product fields before saving.</p> : null}
      <div className="md:col-span-2">
        <Button type="submit" disabled={busy}>
          {busy ? "Saving..." : "Save product"}
        </Button>
      </div>
    </form>
  );
}
