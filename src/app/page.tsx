import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogoutButton } from "@/components/logout-button";
import { getAuthSession } from "@/lib/auth";
import { env } from "@/lib/env";
import { getSettings } from "@/lib/settings";
import { siteConfig } from "@/lib/site";
import { formatCurrency } from "@/lib/utils";

const features = [
  {
    title: "Молниеносная скорость",
    text: "Смотри, играй и загружай без лагов — оптимизированные сервера держат максимальную скорость.",
    className: "feature-card feature-speed",
    visual: (
      <div className="feature-speed-visual" aria-hidden>
        <span />
        <span />
        <span />
      </div>
    ),
  },
  {
    title: "Безопасный доступ",
    text: "Подключился — и всё уже защищено. Надёжное шифрование без лишних настроек.",
    className: "feature-card feature-lock",
    visual: (
      <div className="feature-lock-visual" aria-hidden>
        <div className="feature-lock-shackle" />
        <div className="feature-lock-body" />
      </div>
    ),
  },
  {
    title: "Интернет без границ",
    text: "Любые сайты и сервисы — как будто ты в нужной стране.",
    className: "feature-card feature-globe",
    visual: (
      <div className="feature-globe-visual" aria-hidden>
        <div className="feature-globe-core" />
        <div className="feature-globe-ring feature-globe-ring-one" />
        <div className="feature-globe-ring feature-globe-ring-two" />
      </div>
    ),
  },
  {
    title: "Умное подключение",
    text: "VPN сам выбирает лучший сервер для стабильного соединения.",
    className: "feature-card feature-smart",
    visual: (
      <div className="feature-smart-visual" aria-hidden>
        <span className="feature-smart-dot" />
        <span className="feature-smart-dot" />
        <span className="feature-smart-dot" />
      </div>
    ),
  },
  {
    title: "Полная приватность",
    text: "Никаких логов. Никакого отслеживания. Только ты и интернет.",
    className: "feature-card feature-privacy",
    visual: (
      <div className="feature-privacy-visual" aria-hidden>
        <span />
      </div>
    ),
  },
];

export default async function HomePage() {
  const [session, settings] = await Promise.all([getAuthSession(), getSettings()]);
  const supportTelegramUrl = env.NEXT_PUBLIC_SUPPORT_TELEGRAM_URL ?? settings.supportTelegramUrl ?? null;
  const monthlyPriceKopeks = settings.pricePerDayKopeks * 30;

  return (
    <main className="grid-overlay overflow-hidden">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-4 sm:px-8 lg:px-10">
        <header className="stagger-in flex flex-wrap items-center justify-between gap-4 rounded-full border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl">
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
                  <Button variant="ghost">Кабинет</Button>
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

        <section className="relative grid flex-1 items-center gap-12 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge className="stagger-in">Dark neon / tech panel</Badge>
              <h1
                className="stagger-in max-w-4xl text-5xl font-black uppercase leading-none tracking-[0.08em] text-white sm:text-7xl"
                data-delay="1"
              >
                Безопасный доступ в пару тапов
              </h1>
              <p className="stagger-in max-w-2xl text-lg leading-8 text-zinc-300" data-delay="2">
                Подключение за минуту, гибкий баланс вместо тарифов, управление устройствами и доступом из одного кабинета.
              </p>
            </div>

            <div className="stagger-in flex flex-wrap gap-3" data-delay="3">
              {session?.user ? (
                <Link href="/dashboard">
                  <Button size="lg">Открыть кабинет</Button>
                </Link>
              ) : (
                <>
                  <Link href="/register">
                    <Button size="lg">Регистрация</Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="ghost" size="lg">
                      Войти
                    </Button>
                  </Link>
                </>
              )}
              {supportTelegramUrl ? (
                <Link href={supportTelegramUrl} target="_blank" rel="noreferrer">
                  <Button variant="ghost" size="lg">
                    Поддержка
                  </Button>
                </Link>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="hero-glow">
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Цена за месяц</p>
                <p className="mt-3 text-3xl font-bold text-white">
                  {formatCurrency(monthlyPriceKopeks)}
                </p>
              </Card>
              <Card>
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Пробный период</p>
                <p className="mt-3 text-3xl font-bold text-white">{settings.trialDays} день</p>
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

        <section className="pb-8">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <Badge>Преимущества</Badge>
              <h2 className="mt-3 text-3xl font-bold uppercase tracking-[0.08em] text-white">
                Почему это удобно
              </h2>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className={`${feature.className} stagger-in card-lift`}
                data-delay={String((index % 3) + 1)}
              >
                <div className="feature-visual">{feature.visual}</div>
                <h3 className="mt-6 text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-zinc-400">{feature.text}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="pb-10">
          <Card className="space-y-5">
            <Badge>Документы и поддержка</Badge>
            <h2 className="text-2xl font-bold uppercase tracking-[0.08em] text-white">
              Все нужные ссылки под рукой
            </h2>
            <div className="flex flex-wrap gap-3">
              {env.NEXT_PUBLIC_OFFER_URL ? (
                <Link href={env.NEXT_PUBLIC_OFFER_URL} target="_blank" rel="noreferrer">
                  <Button variant="ghost">Оферта</Button>
                </Link>
              ) : null}
              {env.NEXT_PUBLIC_PRIVACY_URL ? (
                <Link href={env.NEXT_PUBLIC_PRIVACY_URL} target="_blank" rel="noreferrer">
                  <Button variant="ghost">Политика конфиденциальности</Button>
                </Link>
              ) : null}
              {supportTelegramUrl ? (
                <Link href={supportTelegramUrl} target="_blank" rel="noreferrer">
                  <Button variant="ghost">Telegram</Button>
                </Link>
              ) : null}
              {env.SUPPORT_EMAIL ? (
                <Link href={`mailto:${env.SUPPORT_EMAIL}`}>
                  <Button variant="ghost">{env.SUPPORT_EMAIL}</Button>
                </Link>
              ) : null}
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}
