"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type RailControlsProps = {
  onPrevious: () => void;
  onNext: () => void;
  label: string;
};

export function RailControls({ onPrevious, onNext, label }: RailControlsProps) {
  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="absolute left-1 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-background shadow-soft md:inline-flex"
        aria-label={`${label} previous`}
        onClick={onPrevious}
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="absolute right-1 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-background shadow-soft md:inline-flex"
        aria-label={`${label} next`}
        onClick={onNext}
      >
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </Button>
    </>
  );
}
