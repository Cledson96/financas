import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const EMOJI_OPTIONS = [
  "🛒",
  "🍔",
  "🚗",
  "🏠",
  "💡",
  "📱",
  "🎬",
  "🏥",
  "📚",
  "✈️",
  "💰",
  "💳",
  "🎁",
  "👕",
  "💊",
  "🐕",
  "🏋️",
  "💇",
  "🍷",
  "☕",
  "🎮",
  "🎵",
  "📦",
  "🔧",
];

export default function CategoryModal({
  open,
  onOpenChange,
  onSubmit,
  editData = null,
  isLoading = false,
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState("EXPENSE");
  const [icon, setIcon] = useState("📁");

  useEffect(() => {
    if (editData) {
      setName(editData.name || "");
      setType(editData.type || "EXPENSE");
      setIcon(editData.icon || "📁");
    } else {
      setName("");
      setType("EXPENSE");
      setIcon("📁");
    }
  }, [editData, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, type, icon });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {editData ? "Editar Categoria" : "Nova Categoria"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Categoria</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Alimentação, Transporte..."
              className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EXPENSE">Despesa</SelectItem>
                <SelectItem value="INCOME">Receita</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Ícone</Label>
            <div className="grid grid-cols-8 gap-2 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`p-2 rounded-lg text-xl transition-all ${
                    icon === emoji
                      ? "bg-blue-100 dark:bg-blue-900/50 ring-2 ring-blue-500"
                      : "hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editData ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
