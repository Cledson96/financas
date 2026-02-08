"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  getHouseholdConfig,
  updateHouseholdConfig,
} from "@/app/actions/household-actions";

interface Member {
  id: string;
  name: string;
}

interface HouseholdSettingsProps {
  members: Member[];
}

export default function HouseholdSettings({ members }: HouseholdSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<{
    partner1Id: string;
    partner2Id: string;
    partner1Share: number;
  } | null>(null);

  useEffect(() => {
    getHouseholdConfig()
      .then((data) => {
        if (data) {
          setConfig({
            partner1Id: data.partner1Id,
            partner2Id: data.partner2Id,
            partner1Share: Number(data.partner1Share),
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    setSaving(true);
    const formData = new FormData();
    formData.append("partner1Id", config.partner1Id);
    formData.append("partner2Id", config.partner2Id);
    formData.append("partner1Share", config.partner1Share.toString());

    try {
      await updateHouseholdConfig(formData);
      toast.success("Configurações da casa salvas!");
    } catch (error) {
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Carregando configurações...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração da Casa</CardTitle>
        <CardDescription>
          Defina quem são os parceiros e a regra de divisão proporcional.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Parceiro 1 (Principal)</Label>
              <Select
                value={config?.partner1Id}
                onValueChange={(value) =>
                  setConfig((prev) =>
                    prev ? { ...prev, partner1Id: value } : null,
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Parceiro 2</Label>
              <Select
                value={config?.partner2Id}
                onValueChange={(value) =>
                  setConfig((prev) =>
                    prev ? { ...prev, partner2Id: value } : null,
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <Label>Divisão Proporcional Padrão</Label>
              <span className="text-sm text-muted-foreground">
                Quanto o Parceiro 1 paga?
              </span>
            </div>

            <div className="flex items-center gap-4">
              <Input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={config?.partner1Share || 0.5}
                onChange={(e) =>
                  setConfig((prev) =>
                    prev
                      ? { ...prev, partner1Share: parseFloat(e.target.value) }
                      : null,
                  )
                }
                className="w-24"
              />
              <span className="text-sm">
                = {((config?.partner1Share || 0) * 100).toFixed(0)}% (Parceiro
                1) / {((1 - (config?.partner1Share || 0)) * 100).toFixed(0)}%
                (Parceiro 2)
              </span>
            </div>
            <p className="text-sm text-zinc-500">
              Isso define o valor padrão para despesas "Shared Proportional".
            </p>
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
