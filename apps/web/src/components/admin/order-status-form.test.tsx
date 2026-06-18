import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { OrderStatusForm } from "@/components/admin/order-status-form";

describe("OrderStatusForm", () => {
  it("submits updated order status", async () => {
    const onSubmit = vi.fn();
    render(<OrderStatusForm status="pending" onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText("Order status"), { target: { value: "confirmed" } });
    fireEvent.click(screen.getByRole("button", { name: "Update order" }));

    expect(await screen.findByRole("button", { name: "Update order" })).toBeInTheDocument();
    expect(onSubmit).toHaveBeenCalledWith({ status: "confirmed", note: "" }, expect.anything());
  });
});
