import { render, screen } from "@testing-library/react";
import { ProductCard } from "@/components/home/product-card";
import { products } from "@/data/storefront";

describe("ProductCard", () => {
  it("renders discount, sale price, original price, and author", () => {
    render(<ProductCard product={products[0]} />);

    expect(screen.getByText(products[0].title)).toBeInTheDocument();
    expect(screen.getByText(products[0].author as string)).toBeInTheDocument();
    expect(screen.getByText(/OFF/)).toBeInTheDocument();
    expect(screen.getAllByText(/৳/).length).toBeGreaterThanOrEqual(2);
  });
});
