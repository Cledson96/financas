import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
              <PieChart className="w-6 h-6 text-zinc-400" />
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

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700">
          <p className="font-medium text-zinc-900 dark:text-zinc-100">
            {payload[0].name}
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
                {(
                  (payload[0].value / data.reduce((a, b) => a + b.value, 0)) *
                  100
                ).toFixed(1)}
                %
              </>
            ) : (
              "••%"
            )}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
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
              <Tooltip content={<CustomTooltip />} />
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
