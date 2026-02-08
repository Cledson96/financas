"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Wallet, Users, Home, CalendarClock } from "lucide-react";
import { toast } from "sonner";
import AccountCard from "@/components/finance/AccountCard";
import AccountModal from "@/components/finance/AccountModal";
import CategoryList from "@/components/finance/CategoryList";
import CategoryModal from "@/components/finance/CategoryModal";
import HouseholdSettings from "@/components/finance/HouseholdSettings";
import FixedExpensesList from "@/components/finance/FixedExpensesList";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

async function fetchData(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

async function postData(url: string, data: any) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create");
  return res.json();
}

async function putData(url: string, data: any) {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update");
  return res.json();
}

async function deleteData(url: string) {
  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete");
  return res.json();
}

export default function SettingsPage() {
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<any>(null);
  const [editCategory, setEditCategory] = useState<any>(null);
  const [editMember, setEditMember] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Queries
  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => fetchData("/api/accounts"),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchData("/api/categories"),
  });

  const { data: members = [] } = useQuery({
    queryKey: ["members"],
    queryFn: () => fetchData("/api/family-members"),
  });

  // Account Mutations
  const createAccount = useMutation({
    mutationFn: (data: any) => postData("/api/accounts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      setAccountModalOpen(false);
      toast.success("Conta criada!");
    },
  });

  const updateAccount = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      putData(`/api/accounts/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      setAccountModalOpen(false);
      setEditAccount(null);
      toast.success("Conta atualizada!");
    },
  });

  const deleteAccount = useMutation({
    mutationFn: (id: string) => deleteData(`/api/accounts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      setDeleteId(null);
      setDeleteType(null);
      toast.success("Conta excluída!");
    },
  });

  // Category Mutations
  const createCategory = useMutation({
    mutationFn: (data: any) => postData("/api/categories", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setCategoryModalOpen(false);
      toast.success("Categoria criada!");
    },
  });

  const updateCategory = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      putData(`/api/categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setCategoryModalOpen(false);
      setEditCategory(null);
      toast.success("Categoria atualizada!");
    },
  });

  const deleteCategory = useMutation({
    mutationFn: (id: string) => deleteData(`/api/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setDeleteId(null);
      setDeleteType(null);
      toast.success("Categoria excluída!");
    },
  });

  // Member Mutations
  const createMember = useMutation({
    mutationFn: (data: any) => postData("/api/family-members", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      setMemberModalOpen(false);
      toast.success("Membro adicionado!");
    },
  });

  const updateMember = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      putData(`/api/family-members/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      setMemberModalOpen(false);
      setEditMember(null);
      toast.success("Membro atualizado!");
    },
  });

  const deleteMember = useMutation({
    mutationFn: (id: string) => deleteData(`/api/family-members/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      setDeleteId(null);
      setDeleteType(null);
      toast.success("Membro removido!");
    },
  });

  const handleDelete = () => {
    if (!deleteId) return;
    if (deleteType === "account") deleteAccount.mutate(deleteId);
    else if (deleteType === "category") deleteCategory.mutate(deleteId);
    else if (deleteType === "member") deleteMember.mutate(deleteId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Configurações
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Gerencie contas, categorias e membros da família
        </p>
      </div>

      <Tabs defaultValue="household" className="space-y-6">
        <TabsList className="bg-zinc-100 dark:bg-zinc-800 flex overflow-x-auto">
          <TabsTrigger value="household" className="gap-2">
            <Home className="w-4 h-4" /> A Casa
          </TabsTrigger>
          <TabsTrigger value="fixed-expenses" className="gap-2">
            <CalendarClock className="w-4 h-4" /> Despesas Fixas
          </TabsTrigger>
          <TabsTrigger value="accounts" className="gap-2">
            <Wallet className="w-4 h-4" /> Contas
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            Categorias
          </TabsTrigger>
          <TabsTrigger value="members" className="gap-2">
            <Users className="w-4 h-4" /> Membros
          </TabsTrigger>
        </TabsList>

        <TabsContent value="household">
          <HouseholdSettings members={members} />
        </TabsContent>

        <TabsContent value="fixed-expenses">
          <FixedExpensesList categories={categories} members={members} />
        </TabsContent>

        {/* Accounts Tab */}
        <TabsContent value="accounts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-500" />
              Minhas Contas
            </h2>
            <Button
              onClick={() => {
                setEditAccount(null);
                setAccountModalOpen(true);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova Conta
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account: any) => (
              <AccountCard
                key={account.id}
                account={account}
                onEdit={(a: any) => {
                  setEditAccount(a);
                  setAccountModalOpen(true);
                }}
                onDelete={(a: any) => {
                  setDeleteId(a.id);
                  setDeleteType("account");
                }}
              />
            ))}
            {accounts.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="py-12 text-center">
                  <Wallet className="w-12 h-12 mx-auto mb-3 text-zinc-300" />
                  <p className="text-zinc-500">Nenhuma conta cadastrada</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setAccountModalOpen(true)}
                  >
                    Adicionar primeira conta
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <CategoryList
            categories={categories}
            onAdd={() => {
              setEditCategory(null);
              setCategoryModalOpen(true);
            }}
            onEdit={(c: any) => {
              setEditCategory(c);
              setCategoryModalOpen(true);
            }}
            onDelete={(c: any) => {
              setDeleteId(c.id);
              setDeleteType("category");
            }}
          />
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Membros da Família
            </h2>
            <Button
              onClick={() => {
                setEditMember(null);
                setMemberModalOpen(true);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Novo Membro
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member: any) => (
              <Card
                key={member.id}
                className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarFallback
                        style={{ backgroundColor: member.color || "#3b82f6" }}
                      >
                        {member.name?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {member.name}
                      </h3>
                      {member.email && (
                        <p className="text-sm text-zinc-500">{member.email}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditMember(member);
                          setMemberModalOpen(true);
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-500"
                        onClick={() => {
                          setDeleteId(member.id);
                          setDeleteType("member");
                        }}
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {members.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="py-12 text-center">
                  <Users className="w-12 h-12 mx-auto mb-3 text-zinc-300" />
                  <p className="text-zinc-500">Nenhum membro cadastrado</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setMemberModalOpen(true)}
                  >
                    Adicionar primeiro membro
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Account Modal */}
      <AccountModal
        open={accountModalOpen}
        onOpenChange={(open: boolean) => {
          setAccountModalOpen(open);
          if (!open) setEditAccount(null);
        }}
        onSubmit={(data: any) => {
          if (editAccount) {
            updateAccount.mutate({ id: editAccount.id, data });
          } else {
            createAccount.mutate(data);
          }
        }}
        editData={editAccount}
        isLoading={createAccount.isPending || updateAccount.isPending}
      />

      {/* Category Modal */}
      <CategoryModal
        open={categoryModalOpen}
        onOpenChange={(open: boolean) => {
          setCategoryModalOpen(open);
          if (!open) setEditCategory(null);
        }}
        onSubmit={(data: any) => {
          if (editCategory) {
            updateCategory.mutate({ id: editCategory.id, data });
          } else {
            createCategory.mutate(data);
          }
        }}
        editData={editCategory}
        isLoading={createCategory.isPending || updateCategory.isPending}
      />

      {/* Member Modal */}
      <MemberModal
        open={memberModalOpen}
        onOpenChange={(open: boolean) => {
          setMemberModalOpen(open);
          if (!open) setEditMember(null);
        }}
        onSubmit={(data: any) => {
          if (editMember) {
            updateMember.mutate({ id: editMember.id, data });
          } else {
            createMember.mutate(data);
          }
        }}
        editData={editMember}
        isLoading={createMember.isPending || updateMember.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={() => {
          setDeleteId(null);
          setDeleteType(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-rose-500 hover:bg-rose-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Member Modal Component
function MemberModal({
  open,
  onOpenChange,
  onSubmit,
  editData,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  editData: any;
  isLoading: boolean;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [color, setColor] = useState("#3b82f6");

  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f43f5e",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
  ];

  // Reset form when modal opens
  useState(() => {
    if (editData) {
      setName(editData.name || "");
      setEmail(editData.email || "");
      setColor(editData.color || "#3b82f6");
    } else {
      setName("");
      setEmail("");
      setColor("#3b82f6");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, email: email || null, color });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-white dark:bg-zinc-900">
        <DialogHeader>
          <DialogTitle>
            {editData ? "Editar Membro" : "Novo Membro"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do membro"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Email (opcional)</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
            />
          </div>
          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    color === c ? "ring-2 ring-offset-2 ring-zinc-900" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
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
              {editData ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
