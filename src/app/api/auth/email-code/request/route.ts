import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  buildLoginCodeIdentifier,
  issueEmailCode,
} from "@/lib/email-codes";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  const payload = schema.parse(await request.json());
  const email = payload.email.toLowerCase();

  const user = await db.user.findUnique({
    where: { email },
    select: {
      id: true,
      passwordHash: true,
      passwordlessEnabled: true,
      isEmailPlaceholder: true,
      emailVerified: true,
    },
  });

  if (!user || user.isEmailPlaceholder) {
    return NextResponse.json({ error: "Аккаунт с таким email не найден." }, { status: 404 });
  }

  if (!user.emailVerified) {
    return NextResponse.json(
      { error: "Сначала подтвердите email в настройках аккаунта." },
      { status: 400 },
    );
  }

  if (!user.passwordlessEnabled && user.passwordHash) {
    return NextResponse.json(
      { error: "Вход по коду выключен для этого аккаунта." },
      { status: 400 },
    );
  }

  await issueEmailCode({
    identifier: buildLoginCodeIdentifier(email),
    email,
    subject: "1VPN: код для входа",
    title: "Код для входа",
    description: "Введите код на странице входа, чтобы авторизоваться без пароля.",
  });

  return NextResponse.json({ ok: true });
}
