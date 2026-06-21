"use client";

import { Star } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Product } from "@/types/storefront";

type Review = {
  id: string;
  name: string;
  rating: number;
  comment: string;
};

type ProductReviewsProps = {
  product: Product;
};

const initialReviews: Review[] = [
  { id: "review-1", name: "রিয়াদ হাসান", rating: 5, comment: "বইয়ের প্রিন্ট ও প্যাকেজিং ভালো ছিল।" },
  { id: "review-2", name: "Ayesha Karim", rating: 4, comment: "Fast delivery and useful content." },
];

export function ProductReviews({ product }: ProductReviewsProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submitReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (name.trim().length < 2 || comment.trim().length < 8) {
      setError("নাম এবং অন্তত ৮ অক্ষরের রিভিউ লিখুন।");
      return;
    }

    setReviews((current) => [
      { id: `review-${Date.now()}`, name: name.trim(), rating, comment: comment.trim() },
      ...current,
    ]);
    setName("");
    setRating(5);
    setComment("");
    setError(null);
  };

  return (
    <section className="border-t py-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <h2 className="text-xl font-semibold">Product reviews</h2>
          <p className="mt-1 text-sm text-muted-foreground">{product.title} নিয়ে পাঠকের মতামত</p>
          <div className="mt-5 space-y-4">
            {reviews.map((review) => (
              <article key={review.id} className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold">{review.name}</h3>
                  <span className="flex text-primary" aria-label={`${review.rating} star rating`}>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className={index < review.rating ? "h-4 w-4 fill-current" : "h-4 w-4"} aria-hidden="true" />
                    ))}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{review.comment}</p>
              </article>
            ))}
          </div>
        </div>
        <form className="h-fit rounded-lg border bg-card p-5" onSubmit={submitReview}>
          <h3 className="font-semibold">Write a review</h3>
          <div className="mt-4 space-y-4">
            <Input value={name} placeholder="Your name" aria-label="Review name" onChange={(event) => setName(event.target.value)} />
            <label className="grid gap-2 text-sm font-medium">
              Rating
              <select className="h-11 rounded-md border bg-background px-3 text-sm" value={rating} onChange={(event) => setRating(Number(event.target.value))}>
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value} star
                  </option>
                ))}
              </select>
            </label>
            <textarea
              value={comment}
              className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Share your thoughts"
              aria-label="Review comment"
              onChange={(event) => setComment(event.target.value)}
            />
            {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
            <Button type="submit" className="w-full">
              Submit review
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
