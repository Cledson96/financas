import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

enum Error {
  Configuration = "Configuration",
  AccessDenied = "AccessDenied",
  Verification = "Verification",
  Default = "Default",
}

const errorMap = {
  [Error.Configuration]: {
    title: "Erro de Configuração",
    message:
      "Houve um problema com a configuração do servidor. Por favor, contate o administrador.",
  },
  [Error.AccessDenied]: {
    title: "Acesso Negado",
    message: "Você não tem permissão para acessar este recurso.",
  },
  [Error.Verification]: {
    title: "Erro de Verificação",
    message: "O link de verificação expirou ou já foi utilizado.",
  },
  [Error.Default]: {
    title: "Erro de Autenticação",
    message: "Ocorreu um erro inesperado durante a autenticação.",
  },
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = (params.error as Error) || Error.Default;
  const { title, message } = errorMap[error] || errorMap[Error.Default];

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold text-destructive">
            {title}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Button asChild variant="default" className="w-full">
            <Link href="/login">Voltar para Login</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
