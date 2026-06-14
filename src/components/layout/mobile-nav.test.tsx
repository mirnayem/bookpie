import { fireEvent, render, screen } from "@testing-library/react";
import { MobileNav } from "@/components/layout/mobile-nav";

describe("MobileNav", () => {
  it("opens and closes the mobile menu", () => {
    render(<MobileNav />);

    fireEvent.click(screen.getByLabelText("Open menu"));
    expect(screen.getByLabelText("Mobile navigation")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Close menu"));
    expect(screen.queryByLabelText("Mobile navigation")).not.toBeInTheDocument();
  });
});
