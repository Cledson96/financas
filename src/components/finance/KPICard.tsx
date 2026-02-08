import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  LucideIcon,
} from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: "up" | "down";
  trendValue?: string;
  variant?: "default" | "success" | "danger" | "warning";
  pulse?: boolean;
}

export default function KPICard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  variant = "default",
  pulse = false,
}: KPICardProps) {
  const variants = {
    default: "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800",
    success:
      "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-900",
    danger:
      "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200/50 dark:border-rose-900",
    warning:
      "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-900",
  };

  const iconVariants = {
    default: "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400",
    success:
      "bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400",
    danger:
      "bg-rose-100/80 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400",
    warning:
      "bg-amber-100/80 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400",
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 rounded-2xl",
        variants[variant],
        pulse && "animate-pulse ring-2 ring-rose-500/20",
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {title}
            </p>
            <p className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 tabular-nums">
              {value}
            </p>
            {trend && (
              <div className="flex items-center gap-1.5 text-xs font-medium">
                <span
                  className={cn(
                    "flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-opacity-20",
                    trend === "up"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                      : "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
                  )}
                >
                  {trend === "up" ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {trendValue}
                </span>
                <span className="text-zinc-400">vs mês anterior</span>
              </div>
            )}
          </div>
          <div
            className={cn("p-3 rounded-xl shadow-sm", iconVariants[variant])}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>
        {variant === "danger" && pulse && (
          <div className="absolute top-2 right-2">
            <AlertTriangle className="w-4 h-4 text-rose-500 animate-bounce opacity-50" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
