"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function MonthSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentMonth = searchParams.get("month")
    ? parseInt(searchParams.get("month")!)
    : new Date().getMonth() + 1;
  const currentYear = searchParams.get("year")
    ? parseInt(searchParams.get("year")!)
    : new Date().getFullYear();

  // Create options: current month + past 11 months
  const options = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      value: `${date.getMonth() + 1}-${date.getFullYear()}`,
      label: format(date, "MMMM yyyy", { locale: ptBR }),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    };
  });

  const handleValueChange = (value: string) => {
    const [month, year] = value.split("-");
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", month);
    params.set("year", year);
    router.push(`?${params.toString()}`);
  };

  const selectedValue = `${currentMonth}-${currentYear}`;

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedValue} onValueChange={handleValueChange}>
        <SelectTrigger className="w-[180px] bg-white dark:bg-zinc-900 capitalize">
          <SelectValue placeholder="Selecione o mês" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="capitalize"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
