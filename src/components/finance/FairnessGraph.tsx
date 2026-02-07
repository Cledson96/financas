"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Scale } from "lucide-react";
import { FairnessData } from "@/types/finance";

interface FairnessGraphProps {
  data: FairnessData;
}

export default function FairnessGraph({ data }: FairnessGraphProps) {
  const chartData = [
    {
      name: data.userA.name,
      paid: data.userA.paid,
      ideal: data.userA.shouldHavePaid,
    },
    {
      name: data.userB.name,
      paid: data.userB.paid,
      ideal: data.userB.shouldHavePaid,
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700">
          <p className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">
            {label}
          </p>
          {payload.map((item: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-zinc-600 dark:text-zinc-400">
                {item.name === "paid" ? "Pagou Realmente" : "Deveria Pagar"}:
              </span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                R${" "}
                {item.value.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Scale className="w-5 h-5 text-indigo-500" />
            Justiça Financeira
          </CardTitle>
        </div>
        <CardDescription>
          Comparativo entre o valor pago e o valor ideal (proporcional).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-zinc-200 dark:stroke-zinc-700"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="text-zinc-500"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `R$${value}`}
                tickLine={false}
                axisLine={false}
                className="text-zinc-500"
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "transparent" }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                formatter={(value) => (
                  <span className="text-sm text-zinc-600 dark:text-zinc-400 capitalize">
                    {value === "paid" ? "Pago Realmente" : "Valor Ideal"}
                  </span>
                )}
              />
              <Bar
                dataKey="paid"
                name="paid"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                barSize={40}
              />
              <Bar
                dataKey="ideal"
                name="ideal"
                fill="#cbd5e1"
                radius={[4, 4, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
