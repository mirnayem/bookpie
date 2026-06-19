import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";

import { AdminLoginGate } from "@/components/admin/admin-login-gate";
import { useAuthStore } from "@/stores/auth-store";

function renderWithQuery(ui: React.ReactNode) {
  const queryClient = new QueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("AdminLoginGate", () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, tokens: null });
  });

  it("shows login form when no admin user exists", () => {
    renderWithQuery(<AdminLoginGate>Secret admin</AdminLoginGate>);

    expect(screen.getByRole("heading", { name: "Admin Login" })).toBeInTheDocument();
    expect(screen.queryByText("Secret admin")).not.toBeInTheDocument();
  });

  it("renders children for admin users", () => {
    useAuthStore.setState({
      user: { id: "11111111-1111-1111-1111-111111111111", name: "Admin", email: "admin@example.com", role: "admin", createdAt: new Date().toISOString() },
      tokens: { accessToken: "access", refreshToken: "refresh" },
    });

    renderWithQuery(<AdminLoginGate>Secret admin</AdminLoginGate>);

    expect(screen.getByText("Secret admin")).toBeInTheDocument();
  });
});
