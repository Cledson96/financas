import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ExpenseBarChart({
  data,
  title = "Evolução de Gastos",
  isVisible = true,
}) {
  const hasData = data && data.some((d) => d.expenses > 0 || d.income > 0);

  if (!hasData) {
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
              <BarChart className="w-6 h-6 text-zinc-400" />
            </div>
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Sem dados neste período
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
              A evolução mensal aparecerá conforme você registrar transações.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700">
          <p className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">
            {label}
          </p>
          {payload.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-zinc-600 dark:text-zinc-400">
                {item.name}:
              </span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {isVisible ? (
                  <>
                    R${" "}
                    {item.value.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </>
                ) : (
                  "••••••"
                )}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

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
            <BarChart data={data} barGap={4}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-zinc-200 dark:stroke-zinc-700"
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                className="text-zinc-500"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) =>
                  isVisible ? `R$ ${(value / 1000).toFixed(0)}k` : "•••"
                }
                className="text-zinc-500"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                height={36}
                formatter={(value) => (
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">
                    {value}
                  </span>
                )}
              />
              <Bar
                dataKey="expenses"
                name="Despesas"
                fill="#f43f5e"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="income"
                name="Receitas"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
