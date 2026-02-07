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
      "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900",
    danger:
      "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900",
    warning:
      "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900",
  };

  const iconVariants = {
    default: "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400",
    success:
      "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400",
    danger: "bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400",
    warning:
      "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400",
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-lg",
        variants[variant],
        pulse && "animate-pulse",
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {title}
            </p>
            <p className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {value}
            </p>
            {trend && (
              <div className="flex items-center gap-1 text-xs">
                {trend === "up" ? (
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-rose-500" />
                )}
                <span
                  className={cn(
                    "font-medium",
                    trend === "up" ? "text-emerald-600" : "text-rose-600",
                  )}
                >
                  {trendValue}
                </span>
                <span className="text-zinc-400">vs mês anterior</span>
              </div>
            )}
          </div>
          <div className={cn("p-3 rounded-xl", iconVariants[variant])}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        {variant === "danger" && pulse && (
          <div className="absolute top-2 right-2">
            <AlertTriangle className="w-4 h-4 text-rose-500 animate-bounce" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
