import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean; unoptimized?: boolean }) => {
    const { alt, src, fill, priority, unoptimized, ...imageProps } = props;
    void fill;
    void priority;
    void unoptimized;

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img alt={alt} src={typeof src === "string" ? src : ""} {...imageProps} />
    );
  },
}));
