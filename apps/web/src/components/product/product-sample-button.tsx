"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import type { Product } from "@/types/storefront";

type ProductSampleButtonProps = {
  product: Product;
};

export function ProductSampleButton({ product }: ProductSampleButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        একটু পড়ে দেখুন
      </Button>
      <Modal open={open} title={`${product.title} - নমুনা`} onOpenChange={setOpen}>
        <div className="space-y-4 text-sm leading-7 text-muted-foreground">
          <p>
            {product.title} বইয়ের এই ডেমো নমুনায় পাঠকের জন্য সূচিপত্র, লেখক পরিচিতি এবং প্রথম অধ্যায়ের সংক্ষিপ্ত অংশ দেখানো হচ্ছে।
          </p>
          <p>
            বাস্তব API সংযুক্ত হলে এখানে বইয়ের অনুমোদিত preview pages বা sample PDF দেখানো যাবে।
          </p>
          <Button type="button" onClick={() => setOpen(false)}>
            বন্ধ করুন
          </Button>
        </div>
      </Modal>
    </>
  );
}
