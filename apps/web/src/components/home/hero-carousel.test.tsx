import { fireEvent, render, screen } from "@testing-library/react";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { heroBanners } from "@/data/storefront";

describe("HeroCarousel", () => {
  it("renders controls and changes active banner", () => {
    render(<HeroCarousel banners={heroBanners} />);

    expect(screen.getByAltText(heroBanners[0].title)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Next banner"));
    expect(screen.getByAltText(heroBanners[1].title)).toBeInTheDocument();
  });
});
