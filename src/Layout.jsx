import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Receipt,
  Users,
  Settings,
  Menu,
  Moon,
  Sun,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "Dashboard", icon: LayoutDashboard },
  { name: "Transações", href: "Transactions", icon: Receipt },
  { name: "Casal", href: "Couple", icon: Users },
  { name: "Configurações", href: "Settings", icon: Settings },
];

export default function Layout({ children, currentPageName }) {
  const [theme, setTheme] = useState("light");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme") || "light";
    setTheme(stored);
    document.documentElement.classList.toggle("dark", stored === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const NavItems = ({ onNavigate }) => (
    <nav className="space-y-1">
      {navigation.map((item) => {
        const isActive = currentPageName === item.href;
        return (
          <Link
            key={item.name}
            to={createPageUrl(item.href)}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100",
            )}
          >
            <item.icon className={cn("w-5 h-5", isActive && "text-blue-500")} />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Family Finance
              </h1>
              <p className="text-xs text-zinc-500">Controle Financeiro</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-3 py-4">
            <NavItems />
          </div>

          {/* Theme Toggle */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
            <Button
              variant="ghost"
              onClick={toggleTheme}
              className="w-full justify-start gap-3"
            >
              {theme === "light" ? (
                <>
                  <Moon className="w-5 h-5" />
                  Modo Escuro
                </>
              ) : (
                <>
                  <Sun className="w-5 h-5" />
                  Modo Claro
                </>
              )}
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <div className="flex items-center gap-3 px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      Family Finance
                    </h1>
                    <p className="text-xs text-zinc-500">Controle Financeiro</p>
                  </div>
                </div>
                <div className="px-3 py-4">
                  <NavItems onNavigate={() => setMobileOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {navigation.find((n) => n.href === currentPageName)?.name ||
                "Family Finance"}
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "light" ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:pl-64">
        <div className="min-h-screen pt-16 lg:pt-0">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}
