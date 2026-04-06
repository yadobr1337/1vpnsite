import Image from "next/image";
import Link from "next/link";
import { Shield, Sparkles, Wallet, Users, Bot, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogoutButton } from "@/components/logout-button";
import { getAuthSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { siteConfig } from "@/lib/site";
import { formatCurrency } from "@/lib/utils";

const features = [
  {
    icon: Wallet,
    title: "Баланс вместо тарифа",
    text: "Пополняете счет, сервис сам считает оплаченные дни по цене из админки.",
  },
  {
    icon: Zap,
    title: "Автоподписка",
    text: "После оплаты система поднимает VPN-пользователя и выдает уникальную ссылку доступа.",
  },
  {
    icon: Users,
    title: "Сквады с лимитами",
    text: "Новые пользователи автоматически распределяются по группам без переполнения.",
  },
  {
    icon: Bot,
    title: "Telegram-уведомления",
    text: "Пополнение, окончание срока, предупреждение за сутки и удаление ссылки после grace-period.",
  },
];

export default async function HomePage() {
  const [session, settings] = await Promise.all([getAuthSession(), getSettings()]);

  return (
    <main className="grid-overlay overflow-hidden">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-10">
        <header className="stagger-in flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-3">
            <span className="glitch text-xl font-black tracking-[0.3em]" data-text="1VPN">
              1VPN
            </span>
            <span className="hidden text-xs uppercase tracking-[0.35em] text-zinc-500 sm:block">
              {siteConfig.tagline}
            </span>
          </Link>
          <div className="flex items-center gap-3">
            {session?.user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost">Личный кабинет</Button>
                </Link>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Войти</Button>
                </Link>
                <Link href="/register">
                  <Button>Создать аккаунт</Button>
                </Link>
              </>
            )}
          </div>
        </header>

        <section className="relative grid flex-1 items-center gap-12 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge className="stagger-in">Dark neon / tech panel</Badge>
              <h1
                className="stagger-in max-w-4xl text-5xl font-black uppercase leading-none tracking-[0.08em] text-white sm:text-7xl"
                data-delay="1"
              >
                Гибкая подписка VPN без фиксированных тарифов
              </h1>
              <p className="stagger-in max-w-2xl text-lg leading-8 text-zinc-300" data-delay="2">
                Баланс пополняется один раз, дни считаются автоматически, доступная ссылка
                активируется мгновенно и управляется из единой админ-панели.
              </p>
            </div>

            <div className="stagger-in flex flex-wrap gap-3" data-delay="3">
              <Link href={session?.user ? "/dashboard" : "/register"}>
                <Button size="lg">{session?.user ? "Открыть кабинет" : "Подключиться к 1VPN"}</Button>
              </Link>
              <Link href="#features">
                <Button variant="ghost" size="lg">
                  Смотреть возможности
                </Button>
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="hero-glow">
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Цена за день</p>
                <p className="mt-3 text-3xl font-bold text-white">
                  {formatCurrency(settings.pricePerDayKopeks)}
                </p>
              </Card>
              <Card>
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Пробный период</p>
                <p className="mt-3 text-3xl font-bold text-white">{settings.trialDays} день</p>
              </Card>
              <Card>
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Удаление ссылки</p>
                <p className="mt-3 text-3xl font-bold text-white">{settings.deletionGraceHours} ч</p>
              </Card>
            </div>
          </div>

          <div className="relative">
            <div className="hero-glow mx-auto max-w-[560px]">
              <Card className="overflow-hidden p-0">
                <div className="border-b border-white/10 bg-[linear-gradient(90deg,rgba(93,214,255,0.1),transparent)] px-6 py-4">
                  <p className="font-mono text-xs uppercase tracking-[0.28em] text-zinc-400">
                    live preview / protected tunnel
                  </p>
                </div>
                <div className="relative p-6">
                  <Image
                    src="/logo-main.png"
                    alt="1VPN logo"
                    width={1280}
                    height={720}
                    className="rounded-[24px] opacity-90"
                    priority
                  />
                  <div className="pointer-events-none absolute inset-6 rounded-[24px] border border-white/10" />
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section id="features" className="space-y-8 py-10">
          <div className="space-y-3">
            <Badge>Возможности сервиса</Badge>
            <h2 className="text-3xl font-bold uppercase tracking-[0.08em] text-white sm:text-4xl">
              От регистрации до удаления ссылки после истечения баланса
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="transition duration-300 hover:-translate-y-1">
                <feature.icon className="h-8 w-8 text-cyan-300" />
                <h3 className="mt-5 text-xl font-bold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-zinc-400">{feature.text}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-4 py-10 lg:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <Badge>Как это работает</Badge>
            <ol className="mt-6 space-y-5 text-sm leading-7 text-zinc-300">
              <li>1. Пользователь регистрируется по email или через Telegram.</li>
              <li>2. Пополняет баланс и сразу получает оплаченные дни по текущей ставке.</li>
              <li>3. Бекенд создает VPN-пользователя в Remnawave и выдает ссылку подписки.</li>
              <li>4. При окончании баланса доступ отключается, а через 20 часов ссылка удаляется.</li>
            </ol>
          </Card>
          <Card className="relative overflow-hidden">
            <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(93,214,255,0.18),transparent_70%)]" />
            <div className="relative space-y-4">
              <Badge>Security</Badge>
              <h3 className="text-2xl font-bold uppercase tracking-[0.08em] text-white">
                Авторизация, CAPTCHA, биллинг, сквады, Telegram и Remnawave в одном контуре
              </h3>
              <p className="max-w-2xl text-sm leading-7 text-zinc-300">
                Проект собран как единый full-stack сервис: Next.js фронтенд, Prisma ORM,
                NextAuth, админ-панель, cron-процессы и сервисы для внешних интеграций.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <Shield className="h-6 w-6 text-cyan-300" />
                  <p className="mt-3 text-sm font-semibold text-white">CAPTCHA + auth</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <Sparkles className="h-6 w-6 text-cyan-300" />
                  <p className="mt-3 text-sm font-semibold text-white">Glitch branding</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <Bot className="h-6 w-6 text-cyan-300" />
                  <p className="mt-3 text-sm font-semibold text-white">Telegram alerts</p>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}
