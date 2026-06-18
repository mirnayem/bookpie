import { render, screen } from "@testing-library/react";

import { AdminTable } from "@/components/admin/admin-table";

describe("AdminTable", () => {
  it("renders configured columns and rows", () => {
    render(
      <AdminTable
        rows={[{ id: "1", name: "মুসলিমনগর" }]}
        getRowKey={(row) => row.id}
        columns={[{ key: "name", header: "Name", render: (row) => row.name }]}
      />,
    );

    expect(screen.getByRole("columnheader", { name: "Name" })).toBeInTheDocument();
    expect(screen.getByText("মুসলিমনগর")).toBeInTheDocument();
  });
});
