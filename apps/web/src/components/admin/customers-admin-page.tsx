"use client";

import type { AdminCustomerSummary } from "@bookpie/shared";
import { useQuery } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { useMemo, useState } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminState } from "@/components/admin/admin-state";
import { AdminTable } from "@/components/admin/admin-table";
import { AdminBadge } from "@/components/admin/admin-badge";
import { CustomerProfileDetail } from "@/components/admin/customer-profile-detail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { adminApi } from "@/lib/admin/api";
import { useDebounce } from "@/lib/use-debounce";
import { useAuthStore } from "@/stores/auth-store";

export function CustomersAdminPage() {
  const token = useAuthStore((state) => state.tokens?.accessToken ?? null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomerSummary | null>(null);
  const debouncedSearch = useDebounce(search);
  const serverSearch = debouncedSearch.trim().length >= 3 ? debouncedSearch.trim() : undefined;
  const limit = 20;
  const customersQuery = useQuery({
    queryKey: ["admin", "customers", serverSearch, page],
    queryFn: () => adminApi.customers(token, { limit, offset: (page - 1) * limit, search: serverSearch }),
    enabled: Boolean(token) && debouncedSearch.trim().length !== 1 && debouncedSearch.trim().length !== 2,
  });
  const customerDetailQuery = useQuery({
    queryKey: ["admin", "customers", selectedCustomer?.id],
    queryFn: () => adminApi.customer(token, selectedCustomer?.id ?? ""),
    enabled: Boolean(token && selectedCustomer),
  });
  const rows = useMemo(() => {
    return customersQuery.data?.items ?? [];
  }, [customersQuery.data?.items]);

  if (customersQuery.isError) {
    return <AdminState variant="error" title="Customers failed to load" description={customersQuery.error.message} actionLabel="Retry" onAction={() => customersQuery.refetch()} />;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Customers" description="View customer profile, contact, address, and order follow-up context." />
      <Input
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
          setPage(1);
        }}
        placeholder="Search customers by name, email, or phone"
        aria-label="Search customers"
      />
      {rows.length ? (
        <AdminTable
          rows={rows}
          getRowKey={(customer) => customer.id}
          columns={[
            { key: "name", header: "Name", render: (customer) => <span className="font-semibold">{customer.name}</span> },
            { key: "email", header: "Email", render: (customer) => customer.email },
            { key: "role", header: "Role", render: (customer) => <AdminBadge>{customer.role.replaceAll("_", " ")}</AdminBadge> },
            { key: "status", header: "Status", render: (customer) => <AdminBadge tone={customer.isActive ? "success" : "danger"}>{customer.isActive ? "Active" : "Blocked"}</AdminBadge> },
            { key: "phone", header: "Phone", render: (customer) => customer.phone ?? <span className="text-muted-foreground">Not set</span> },
            { key: "addresses", header: "Addresses", render: (customer) => customer.addressCount },
            {
              key: "actions",
              header: "Actions",
              className: "text-right",
              render: (customer) => (
                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedCustomer(customer)}>
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  View
                </Button>
              ),
            },
          ]}
        />
      ) : (
        <AdminState title="No customers found" description="Customer accounts will appear after registration." />
      )}
      <AdminPagination pagination={customersQuery.data?.pagination} isFetching={customersQuery.isFetching} onPageChange={setPage} />
      <Modal open={Boolean(selectedCustomer)} title={selectedCustomer?.name ?? "Customer"} onOpenChange={(open) => !open && setSelectedCustomer(null)} className="max-w-3xl">
        {customerDetailQuery.data ? (
          <CustomerProfileDetail
            profile={customerDetailQuery.data}
            onSaved={async () => {
              await customersQuery.refetch();
              await customerDetailQuery.refetch();
            }}
          />
        ) : (
          <p className="text-sm text-muted-foreground">Loading customer profile...</p>
        )}
      </Modal>
    </div>
  );
}
