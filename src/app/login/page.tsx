import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getAuthSession } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getAuthSession();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="dashboard-shell flex min-h-screen items-center justify-center px-6 py-10">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="hidden justify-between lg:flex lg:flex-col">
          <div>
            <Badge>1VPN Access</Badge>
            <h1 className="mt-6 text-5xl font-black uppercase tracking-[0.08em] text-white">
              Вход в сервис
            </h1>
            <p className="mt-4 max-w-md text-base leading-8 text-zinc-300">
              Авторизация по email или через Telegram Login Widget. После входа доступны баланс,
              статус VPN, ссылка подписки и действия администратора по роли.
            </p>
          </div>
          <div className="space-y-3 text-sm text-zinc-400">
            <p>Система поддерживает паузу списаний при бане и удаление ссылки через 20 часов.</p>
            <Link href="/" className="text-cyan-300 transition hover:text-cyan-200">
              Вернуться на главную
            </Link>
          </div>
        </Card>

        <Card className="mx-auto w-full max-w-xl">
          <Badge>Login</Badge>
          <h2 className="mt-6 text-3xl font-bold uppercase tracking-[0.08em] text-white">
            Добро пожаловать в 1VPN
          </h2>
          <p className="mt-4 text-sm leading-7 text-zinc-400">
            Введите email и пароль или используйте Telegram для мгновенного входа.
          </p>
          <div className="mt-8">
            <LoginForm />
          </div>
        </Card>
      </div>
    </main>
  );
}
