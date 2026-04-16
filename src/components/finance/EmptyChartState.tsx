import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, BarChart3, PieChart, Users } from "lucide-react";

interface EmptyChartStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
}

export function EmptyChartState({
  title,
  description,
  icon: Icon = BarChart3,
}: EmptyChartStateProps) {
  return (
    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-2xl h-full">
      <CardContent className="flex flex-col items-center justify-center h-[280px] text-center p-6">
        <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-zinc-400 dark:text-zinc-500" />
        </div>
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          {title}
        </p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

export function EmptyPieState({ description }: { description: string }) {
  return <EmptyChartState title="Sem dados" description={description} icon={PieChart} />;
}

export function EmptyFairnessState() {
  return (
    <EmptyChartState
      title="Sem despesas compartilhadas"
      description="Os dados de justiça financeira aparecem quando há despesas do casal neste mês."
      icon={Users}
    />
  );
}
