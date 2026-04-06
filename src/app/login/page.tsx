import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAuthSession } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getAuthSession();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="dashboard-shell flex min-h-screen items-center justify-center px-6 py-10">
      <Card className="mx-auto w-full max-w-xl">
        <div className="flex items-center justify-between gap-4">
          <Badge>Login</Badge>
          <Link href="/">
            <Button variant="ghost" type="button">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад
            </Button>
          </Link>
        </div>

        <h1 className="mt-6 text-3xl font-bold uppercase tracking-[0.08em] text-white">
          Войти
        </h1>

        <div className="mt-8">
          <LoginForm />
        </div>
      </Card>
    </main>
  );
}
