import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Tags } from "lucide-react";

export default function CategoryList({
  categories = [],
  onAdd,
  onEdit,
  onDelete,
}) {
  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");
  const incomeCategories = categories.filter((c) => c.type === "INCOME");

  const CategoryItem = ({ category }) => (
    <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
      <div className="flex items-center gap-3">
        <span className="text-xl">{category.icon || "📁"}</span>
        <div>
          <p className="font-medium text-zinc-900 dark:text-zinc-100">
            {category.name}
          </p>
          <Badge
            variant="outline"
            className={
              category.type === "EXPENSE"
                ? "text-rose-600 border-rose-300"
                : "text-emerald-600 border-emerald-300"
            }
          >
            {category.type === "EXPENSE" ? "Despesa" : "Receita"}
          </Badge>
        </div>
      </div>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onEdit?.(category)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-rose-500 hover:text-rose-600"
          onClick={() => onDelete?.(category)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          <Tags className="w-5 h-5 text-blue-500" />
          Categorias
        </CardTitle>
        <Button onClick={onAdd} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Nova
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {expenseCategories.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-rose-600 dark:text-rose-400 flex items-center gap-2">
              Despesas ({expenseCategories.length})
            </h4>
            <div className="space-y-2">
              {expenseCategories.map((cat) => (
                <CategoryItem key={cat.id} category={cat} />
              ))}
            </div>
          </div>
        )}

        {incomeCategories.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              Receitas ({incomeCategories.length})
            </h4>
            <div className="space-y-2">
              {incomeCategories.map((cat) => (
                <CategoryItem key={cat.id} category={cat} />
              ))}
            </div>
          </div>
        )}

        {categories.length === 0 && (
          <div className="text-center py-8 text-zinc-500">
            <Tags className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Nenhuma categoria cadastrada</p>
            <p className="text-sm">Clique em "Nova" para adicionar</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
