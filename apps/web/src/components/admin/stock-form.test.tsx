import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { StockForm } from "@/components/admin/stock-form";

describe("StockForm", () => {
  it("submits stock adjustment values", async () => {
    const onSubmit = vi.fn();
    render(<StockForm stock={3} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText("New stock"), { target: { value: "9" } });
    fireEvent.change(screen.getByLabelText("Admin note"), { target: { value: "Restocked" } });
    fireEvent.click(screen.getByRole("button", { name: "Update stock" }));

    expect(await screen.findByRole("button", { name: "Update stock" })).toBeInTheDocument();
    expect(onSubmit).toHaveBeenCalledWith({ stock: 9, note: "Restocked" }, expect.anything());
  });
});
