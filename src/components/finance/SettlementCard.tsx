import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Scale, ArrowRight, CheckCircle2 } from "lucide-react";
import { SettlementData } from "@/types/finance";

interface SettlementCardProps {
  settlement: SettlementData;
  onSettle: () => void;
  isVisible?: boolean;
}

export default function SettlementCard({
  settlement,
  onSettle,
  isVisible = true,
}: SettlementCardProps) {
  if (!settlement.total || settlement.total <= 0) {
    return (
      <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
        <CardContent className="pt-6 flex flex-col items-center justify-center text-center p-6">
          <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-4" />
          <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
            Tudo acertado!
          </h3>
          <p className="text-emerald-600 dark:text-emerald-500">
            Ninguém deve nada neste mês.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { breakdown } = settlement;

  return (
    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          <Scale className="w-5 h-5 text-blue-500" />
          Acerto de Contas
        </CardTitle>
        <CardDescription>Resumo parcial do mês</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {settlement.debtorName} deve pagar
              </span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {isVisible ? (
                    <>
                      R${" "}
                      {settlement.total.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </>
                  ) : (
                    "••••••"
                  )}
                </span>
                <ArrowRight className="h-4 w-4 text-zinc-400" />
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {settlement.creditorName}
                </span>
              </div>
            </div>
            <Button
              size="sm"
              onClick={onSettle}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Quitar
            </Button>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="details" className="border-none">
              <AccordionTrigger className="py-2 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300">
                Ver Detalhes
              </AccordionTrigger>
              <AccordionContent className="space-y-2 pt-2 text-sm">
                <div className="flex justify-between">
                  <span>Divisão 50/50 (Shared)</span>
                  <span className="font-medium">
                    {isVisible ? (
                      <>
                        R${" "}
                        {breakdown.sharedFiftyFifty.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </>
                    ) : (
                      "••••••"
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Divisão Proporcional</span>
                  <span className="font-medium">
                    {isVisible ? (
                      <>
                        R${" "}
                        {breakdown.sharedProportional.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </>
                    ) : (
                      "••••••"
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Individual (Pago pelo outro)</span>
                  <span className="font-medium">
                    {isVisible ? (
                      <>
                        R${" "}
                        {breakdown.individualPaidByOther.toLocaleString(
                          "pt-BR",
                          {
                            minimumFractionDigits: 2,
                          },
                        )}
                      </>
                    ) : (
                      "••••••"
                    )}
                  </span>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
}
