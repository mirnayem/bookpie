import type { CustomerProfile } from "@bookpie/shared";

import { AdminBadge } from "@/components/admin/admin-badge";
import { CustomerAccountActions } from "@/components/admin/customer-account-actions";

type CustomerProfileDetailProps = {
  profile: CustomerProfile;
  onSaved: () => Promise<void> | void;
};

export function CustomerProfileDetail({ profile, onSaved }: CustomerProfileDetailProps) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 rounded-lg border p-4 text-sm md:grid-cols-2">
        <p><span className="text-muted-foreground">Name:</span> {profile.name}</p>
        <p><span className="text-muted-foreground">Email:</span> {profile.email}</p>
        <p><span className="text-muted-foreground">Role:</span> <AdminBadge>{profile.role.replaceAll("_", " ")}</AdminBadge></p>
        <p><span className="text-muted-foreground">Status:</span> <AdminBadge tone={profile.isActive ? "success" : "danger"}>{profile.isActive ? "Active" : "Blocked"}</AdminBadge></p>
        <p><span className="text-muted-foreground">Display:</span> {profile.displayName ?? "Not set"}</p>
        <p><span className="text-muted-foreground">Phone:</span> {profile.phone ?? "Not set"}</p>
      </div>
      <CustomerAccountActions profile={profile} onSaved={onSaved} />
      <div>
        <h3 className="mb-3 font-semibold">Addresses</h3>
        <div className="space-y-3">
          {profile.addresses.map((address) => (
            <article key={address.id} className="rounded-lg border p-4 text-sm">
              <p className="font-semibold">{address.label} {address.isDefault ? <span className="text-primary">(Default)</span> : null}</p>
              <p>{address.recipientName} · {address.phone}</p>
              <p className="text-muted-foreground">{address.addressLine1}, {address.city}</p>
            </article>
          ))}
          {!profile.addresses.length ? <p className="text-sm text-muted-foreground">No addresses saved.</p> : null}
        </div>
      </div>
    </div>
  );
}
