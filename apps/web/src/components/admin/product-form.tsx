"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Author, Book, Brand, Category, Publisher, UpsertBookRequest } from "@bookpie/shared";
import { upsertBookRequestSchema } from "@bookpie/shared";
import { ImagePlus, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { adminApi } from "@/lib/admin/api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

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
  const token = useAuthStore((state) => state.tokens?.accessToken ?? null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const initialImages = book?.galleryImageUrls?.length ? book.galleryImageUrls : book?.coverImageUrl ? [book.coverImageUrl] : [];
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
      coverImageUrl: book?.coverImageUrl ?? initialImages[0] ?? null,
      galleryImageUrls: initialImages,
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
  const images = form.watch("galleryImageUrls") ?? [];
  const coverImageUrl = form.watch("coverImageUrl");

  const setImages = (nextImages: string[], nextCover = coverImageUrl) => {
    const cleanImages = Array.from(new Set(nextImages.filter(Boolean)));
    const cover = cleanImages.includes(nextCover ?? "") ? nextCover : cleanImages[0] ?? null;
    form.setValue("galleryImageUrls", cleanImages, { shouldDirty: true, shouldValidate: true });
    form.setValue("coverImageUrl", cover, { shouldDirty: true, shouldValidate: true });
  };

  const handleImageUpload = async (files: FileList | null) => {
    const selectedFiles = Array.from(files ?? []);
    if (!selectedFiles.length) return;

    setUploading(true);
    setUploadError(null);

    try {
      const uploadedUrls = await adminApi.uploadProductImages(token, selectedFiles);
      setImages([...images, ...uploadedUrls], coverImageUrl ?? uploadedUrls[0] ?? null);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

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
      <div className="space-y-3 md:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Product images</p>
            <p className="text-xs text-muted-foreground">Upload up to 8 JPG, PNG, WebP, or GIF images. The starred image is used as the cover.</p>
          </div>
          <label className={cn("inline-flex h-10 cursor-pointer items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground", uploading && "pointer-events-none opacity-60")}>
            <ImagePlus className="h-4 w-4" aria-hidden="true" />
            {uploading ? "Uploading..." : "Upload images"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="sr-only"
              disabled={uploading}
              onChange={(event) => {
                void handleImageUpload(event.target.files);
                event.currentTarget.value = "";
              }}
            />
          </label>
        </div>
        {images.length ? (
          <div className="grid gap-3 rounded-md border p-3 sm:grid-cols-2 lg:grid-cols-4">
            {images.map((imageUrl) => (
              <div key={imageUrl} className="overflow-hidden rounded-md border bg-muted/30">
                <div className="aspect-[3/4] bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt="Product upload preview" className="h-full w-full object-cover" />
                </div>
                <div className="flex items-center justify-between gap-2 p-2">
                  <Button type="button" variant={coverImageUrl === imageUrl ? "default" : "outline"} size="sm" onClick={() => form.setValue("coverImageUrl", imageUrl, { shouldDirty: true, shouldValidate: true })}>
                    <Star className="h-4 w-4" aria-hidden="true" />
                    Cover
                  </Button>
                  <Button type="button" variant="outline" size="sm" aria-label="Remove product image" onClick={() => setImages(images.filter((url) => url !== imageUrl))}>
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">No product images uploaded yet.</div>
        )}
        {uploadError ? <p className="text-sm text-primary">{uploadError}</p> : null}
      </div>
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
        <Input className="mt-1" type="number" min={0} {...form.register("warehousePrice", { setValueAs: (value) => (value === "" ? null : Number(value)) })} />
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
        <Button type="submit" disabled={busy || uploading}>
          {busy ? "Saving..." : "Save product"}
        </Button>
      </div>
    </form>
  );
}
