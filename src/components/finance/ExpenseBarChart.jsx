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
      // Find current index in data array for month-over-month comparison
      const currentIndex = data.findIndex((d) => d.month === label);
      const prevMonth = currentIndex > 0 ? data[currentIndex - 1] : null;
      const prevLabel = prevMonth?.month || null;

      const formatComparison = (current, previous, prevName) => {
        if (!previous && previous !== 0) {
          // First month in chart with data — no previous to compare
          return null;
        }
        if (previous === 0) {
          // Previous was zero — all current value is "new"
          return { type: "new", prevName };
        }
        const diff = ((current - previous) / previous) * 100;
        const sign = diff >= 0 ? "+" : "";
        return {
          type: "percent",
          value: `${sign}${diff.toFixed(0)}% vs ${prevName}`,
          isPositive: diff >= 0,
        };
      };

      const getExpenseValue = () =>
        payload.find((p) => p.dataKey === "expenses")?.value ?? 0;
      const getIncomeValue = () =>
        payload.find((p) => p.dataKey === "income")?.value ?? 0;

      const expenseComp = prevMonth
        ? formatComparison(getExpenseValue(), prevMonth.expenses, prevLabel)
        : null;
      const incomeComp = prevMonth
        ? formatComparison(getIncomeValue(), prevMonth.income, prevLabel)
        : null;

      const comparisons = {
        expenses: expenseComp,
        income: incomeComp,
      };

      return (
        <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700">
          <p className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">
            {label}
          </p>
          {payload.map((item, index) => {
            const comp = comparisons[item.dataKey];
            return (
              <div key={index} className="flex flex-col gap-0.5 text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
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
                {comp && isVisible && (
                  <span className="ml-5 text-xs font-medium">
                    {comp.type === "new" ? (
                      <span className="text-amber-600 dark:text-amber-400">
                        (novas em {label})
                      </span>
                    ) : comp.isPositive ? (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        ({comp.value})
                      </span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400">
                        ({comp.value})
                      </span>
                    )}
                  </span>
                )}
              </div>
            );
          })}
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
