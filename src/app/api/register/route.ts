import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyTurnstileToken } from "@/lib/captcha";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { ensureUserSquad } from "@/lib/squads";
import { ensureUserPublicId } from "@/lib/user-identity";

const registerSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8).max(64),
    captchaToken: z.string().optional(),
  })
  .strict();

export async function POST(request: Request) {
  const payload = registerSchema.parse(await request.json());
  const settings = await getSettings();

  if (settings.captchaEnabled) {
    const captchaOk = await verifyTurnstileToken(payload.captchaToken);
    if (!captchaOk) {
      return NextResponse.json({ error: "CAPTCHA verification failed." }, { status: 400 });
    }
  }

  const existing = await db.user.findUnique({
    where: { email: payload.email.toLowerCase() },
  });

  if (existing) {
    return NextResponse.json({ error: "Email is already registered." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(payload.password, 12);

  const user = await db.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        email: payload.email.toLowerCase(),
        passwordHash,
        role: Role.USER,
      },
    });

    await ensureUserSquad(created.id, tx);
    return created;
  });

  const publicId = await ensureUserPublicId(user.id);

  return NextResponse.json({ ok: true, userId: user.id, publicId });
}
