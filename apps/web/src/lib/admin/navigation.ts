import {
  BarChart3,
  Boxes,
  ClipboardList,
  LayoutDashboard,
  PackageOpen,
  Settings,
  Truck,
  UserRound,
  UsersRound,
  Tags,
  PenLine,
  Building2,
} from "lucide-react";

export const adminNavItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: PackageOpen },
  { label: "Authors", href: "/admin/authors", icon: PenLine },
  { label: "Publishers", href: "/admin/publishers", icon: Building2 },
  { label: "Categories", href: "/admin/categories", icon: Tags },
  { label: "Orders", href: "/admin/orders", icon: ClipboardList },
  { label: "Customers", href: "/admin/customers", icon: UsersRound },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes },
  { label: "Delivery", href: "/admin/delivery", icon: Truck },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
  { label: "Profile", href: "/admin/settings#profile", icon: UserRound },
] as const;
