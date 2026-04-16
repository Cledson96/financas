import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart as PieChartIcon, List } from "lucide-react";

const COLORS = [
  "#10b981",
  "#f43f5e",
  "#3b82f6",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

function CustomTooltip({ active, payload, isVisible, total }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700">
        <p className="font-medium text-zinc-900 dark:text-zinc-100">
          {payload[0].name || payload[0].payload?.name}
        </p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {isVisible ? (
            <>
              R${" "}
              {payload[0].value.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </>
          ) : (
            "••••••"
          )}
        </p>
        <p className="text-xs text-zinc-400">
          {isVisible ? (
            <>
              {((payload[0].value / total) * 100).toFixed(1)}%
            </>
          ) : (
            "••%"
          )}
        </p>
      </div>
    );
  }
  return null;
}

function CategoryList({ data, isVisible }) {
  const total = data.reduce((a, b) => a + b.value, 0);

  return (
    <div className="space-y-3 pt-2">
      {data.map((entry, index) => {
        const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0;
        return (
          <div key={entry.name} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {entry.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {isVisible
                    ? `R$ ${entry.value.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}`
                    : "••••••"}
                </span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500 w-12 text-right tabular-nums">
                  {isVisible ? `${pct}%` : "••%"}
                </span>
              </div>
            </div>
            <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  backgroundColor: COLORS[index % COLORS.length],
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function CategoryPieChart({
  data,
  title = "Gastos por Categoria",
  isVisible = true,
}) {
  if (!data || data.length === 0) {
    return (
      <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[280px] text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
              <PieChartIcon className="w-6 h-6 text-zinc-400" />
            </div>
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Sem despesas neste período
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
              As categorias aparecerão conforme você registrar gastos.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const total = data.reduce((a, b) => a + b.value, 0);

  // For 1-2 categories, show a horizontal list with progress bars
  // The donut chart looks broken/incomplete with too few slices
  if (data.length <= 2) {
    return (
      <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            <List className="w-5 h-5 text-zinc-400" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[280px]">
            <div className="w-full max-w-sm space-y-5">
              <CategoryList data={data} isVisible={isVisible} />

              {total > 0 && (
                <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    Total
                  </span>
                  <span className="text-base font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                    {isVisible
                      ? `R$ ${total.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}`
                      : "••••••"}
                  </span>
                </div>
              )}

              <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center">
                {data.length === 1
                  ? "Apenas uma categoria registrada neste mês."
                  : "Adicione mais categorias para ver a distribuição completa."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 3+ categories: show the donut chart
  return (
    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    className="transition-all duration-300 hover:opacity-80"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip isVisible={isVisible} total={total} />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
