import { LayoutDashboard, Receipt, Users, Settings } from "lucide-react";

export const dashboardNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transações", href: "/transactions", icon: Receipt },
  { name: "Casal", href: "/couple", icon: Users },
  { name: "Configurações", href: "/settings", icon: Settings },
];
