import { render, screen } from "@testing-library/react";
import { ProductRail } from "@/components/home/product-rail";
import { productSections } from "@/data/storefront";

describe("ProductRail", () => {
  it("renders populated sections with carousel controls", () => {
    render(<ProductRail section={productSections[0]} />);

    expect(screen.getByRole("heading", { name: productSections[0].title })).toBeInTheDocument();
    expect(screen.getByLabelText(`${productSections[0].title} product carousel`)).toBeInTheDocument();
    expect(screen.getByLabelText(`${productSections[0].title} next`)).toBeInTheDocument();
  });

  it("renders nothing for empty product arrays", () => {
    const { container } = render(<ProductRail section={{ id: "empty", title: "Empty", href: "/empty", products: [] }} />);

    expect(container).toBeEmptyDOMElement();
  });
});
