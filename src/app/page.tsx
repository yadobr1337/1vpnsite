import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogoutButton } from "@/components/logout-button";
import { getAuthSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { siteConfig } from "@/lib/site";
import { formatCurrency } from "@/lib/utils";

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

        <section className="relative grid flex-1 items-center gap-12 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge className="stagger-in">Dark neon / tech panel</Badge>
              <h1
                className="stagger-in max-w-4xl text-5xl font-black uppercase leading-none tracking-[0.08em] text-white sm:text-7xl"
                data-delay="1"
              >
                1VPN
              </h1>
              <p className="stagger-in max-w-xl text-lg leading-8 text-zinc-300" data-delay="2">
                Приватный VPN-сервис с удобным личным кабинетом и гибким управлением доступом.
              </p>
            </div>

            <div className="stagger-in flex flex-wrap gap-3" data-delay="3">
              {session?.user ? (
                <Link href="/dashboard">
                  <Button size="lg">Открыть кабинет</Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="lg">
                      Войти
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="lg">Создать аккаунт</Button>
                  </Link>
                </>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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
      </div>
    </main>
  );
}
