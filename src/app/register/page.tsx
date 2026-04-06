import Link from "next/link";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getAuthSession } from "@/lib/auth";

export default async function RegisterPage() {
  const session = await getAuthSession();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="dashboard-shell flex min-h-screen items-center justify-center px-6 py-10">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1fr_0.9fr]">
        <Card className="mx-auto w-full max-w-xl">
          <Badge>Register</Badge>
          <h1 className="mt-6 text-3xl font-bold uppercase tracking-[0.08em] text-white">
            Создать аккаунт
          </h1>
          <p className="mt-4 text-sm leading-7 text-zinc-400">
            После регистрации пользователь автоматически попадет в свободный сквад и сможет
            получить пробный день.
          </p>
          <div className="mt-8">
            <RegisterForm />
          </div>
        </Card>

        <Card className="hidden lg:block">
          <Badge>Flow</Badge>
          <div className="mt-6 space-y-5 text-sm leading-7 text-zinc-300">
            <p>1. Email + пароль с защитой от ботов через CAPTCHA.</p>
            <p>2. Автораспределение в сквад с учетом лимита пользователей.</p>
            <p>3. Доступ к пробному дню только один раз на аккаунт.</p>
            <p>4. Telegram-бот сможет использовать тот же аккаунт для автоавторизации позже.</p>
          </div>
          <div className="mt-8">
            <Link href="/" className="text-cyan-300 transition hover:text-cyan-200">
              На главную
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}
