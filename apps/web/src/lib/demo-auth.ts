import type { AuthResponse } from "@bookpie/shared";

const demoAccessToken = "demo-customer-access-token";
const demoRefreshToken = "demo-customer-refresh-token";

export function createDemoAuthResponse(identity: string): AuthResponse {
  const normalizedIdentity = identity.trim();
  const isEmail = normalizedIdentity.includes("@");

  return {
    user: {
      id: "11111111-1111-4111-8111-111111111111",
      name: isEmail ? normalizedIdentity.split("@")[0] : "BookPie Customer",
      email: isEmail ? normalizedIdentity : "customer@bookpie.local",
      role: "customer",
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    tokens: {
      accessToken: demoAccessToken,
      refreshToken: demoRefreshToken,
    },
  };
}
