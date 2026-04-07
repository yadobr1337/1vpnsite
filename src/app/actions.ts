"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { requireAdmin, requireUser } from "@/lib/auth";
import {
  adjustBalanceByAdmin,
  claimTrialDay,
  runLifecycleSweep,
  setBanState,
  syncUserLifecycle,
  topUpBalance,
} from "@/lib/billing";
import { createSquad, deleteSquad, updateSquad } from "@/lib/squads";
import { resolveUserIdentifier } from "@/lib/user-identity";

function parseKopeks(value: FormDataEntryValue | null) {
  const amount = Number(String(value ?? "0").replace(",", "."));
  if (!Number.isFinite(amount)) {
    throw new Error("Invalid amount.");
  }
  return Math.round(amount * 100);
}

function parseOptionalInteger(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error("Invalid integer value.");
  }

  return parsed;
}

function parseRequiredPositiveInteger(value: FormDataEntryValue | null) {
  const parsed = Number(String(value ?? "").trim());
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error("Invalid integer value.");
  }
  return parsed;
}

function parseRequiredString(value: FormDataEntryValue | null) {
  const parsed = String(value ?? "").trim();
  if (!parsed) {
    throw new Error("Value is required.");
  }
  return parsed;
}

function parseOptionalString(value: FormDataEntryValue | null) {
  const parsed = String(value ?? "").trim();
  return parsed || null;
}

export async function topUpBalanceAction(formData: FormData) {
  const session = await requireUser();

  if (env.PAYMENTS_AUTO_APPROVE !== "true") {
    throw new Error("Automatic top-up is disabled until a payment provider is connected.");
  }

  await topUpBalance({
    userId: session.user.id,
    amountKopeks: parseKopeks(formData.get("amount")),
    description: "Instant checkout top-up",
  });

  revalidatePath("/dashboard");
  revalidatePath("/admin");
}

export async function claimTrialAction() {
  const session = await requireUser();
  await claimTrialDay(session.user.id);
  revalidatePath("/dashboard");
  revalidatePath("/admin");
}

export async function updateSettingsAction(formData: FormData) {
  await requireAdmin();

  await db.systemSettings.update({
    where: { id: "default" },
    data: {
      pricePerDayKopeks: parseKopeks(formData.get("pricePerDay")),
      trialDays: parseRequiredPositiveInteger(formData.get("trialDays")),
      deletionGraceHours: parseRequiredPositiveInteger(formData.get("deletionGraceHours")),
      defaultHwidDeviceLimit: parseRequiredPositiveInteger(formData.get("defaultHwidDeviceLimit")),
      captchaEnabled: String(formData.get("captchaEnabled")) === "on",
      supportTelegramUrl: String(formData.get("supportTelegramUrl") ?? "") || null,
      heroAnnouncement: String(formData.get("heroAnnouncement") ?? "") || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function createSquadAction(formData: FormData) {
  await requireAdmin();
  await createSquad({
    name: String(formData.get("name") ?? ""),
    memberLimit: parseRequiredPositiveInteger(formData.get("memberLimit")),
    remnawaveInternalSquadUuid: parseRequiredString(formData.get("remnawaveInternalSquadUuid")),
  });
  revalidatePath("/admin");
}

export async function updateSquadLimitAction(formData: FormData) {
  await requireAdmin();
  await updateSquad({
    squadId: String(formData.get("squadId")),
    name: String(formData.get("name") ?? ""),
    memberLimit: parseRequiredPositiveInteger(formData.get("memberLimit")),
    isActive: String(formData.get("isActive")) === "on",
    remnawaveInternalSquadUuid: parseRequiredString(formData.get("remnawaveInternalSquadUuid")),
  });
  revalidatePath("/admin");
}

export async function deleteSquadAction(formData: FormData) {
  await requireAdmin();
  await deleteSquad(String(formData.get("squadId")));
  revalidatePath("/admin");
}

export async function toggleBanAction(formData: FormData) {
  await requireAdmin();
  await setBanState(
    await resolveUserIdentifier(String(formData.get("userId") ?? "")),
    String(formData.get("ban")) === "true",
  );
  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function adjustUserBalanceAction(formData: FormData) {
  await requireAdmin();
  await adjustBalanceByAdmin({
    userId: await resolveUserIdentifier(String(formData.get("userId") ?? "")),
    amountKopeks: parseKopeks(formData.get("amount")),
    description: String(formData.get("description") ?? "Admin balance adjustment"),
  });
  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function updateUserHwidAction(formData: FormData) {
  await requireAdmin();
  const userId = await resolveUserIdentifier(String(formData.get("userId") ?? ""));

  await db.user.update({
    where: { id: userId },
    data: {
      hwidDeviceLimit: parseOptionalInteger(formData.get("hwidDeviceLimit")),
    },
  });

  await syncUserLifecycle(userId);
  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function updateOwnHwidAction(formData: FormData) {
  const session = await requireUser();

  await db.user.update({
    where: { id: session.user.id },
    data: {
      hwidDeviceLimit: parseRequiredPositiveInteger(formData.get("hwidDeviceLimit")),
    },
  });

  await syncUserLifecycle(session.user.id);
  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function updateOwnEmailAction(formData: FormData) {
  const session = await requireUser();
  const email = parseRequiredString(formData.get("email")).toLowerCase();

  const existing = await db.user.findFirst({
    where: {
      email,
      NOT: {
        id: session.user.id,
      },
    },
    select: { id: true },
  });

  if (existing) {
    throw new Error("Email is already in use.");
  }

  await db.user.update({
    where: { id: session.user.id },
    data: {
      email,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/account");
}

export async function updateOwnPasswordAction(formData: FormData) {
  const session = await requireUser();
  const currentPassword = parseOptionalString(formData.get("currentPassword"));
  const newPassword = parseRequiredString(formData.get("newPassword"));

  if (newPassword.length < 8 || newPassword.length > 64) {
    throw new Error("Password must contain 8-64 characters.");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  if (user.passwordHash) {
    if (!currentPassword) {
      throw new Error("Current password is required.");
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new Error("Current password is incorrect.");
    }
  }

  await db.user.update({
    where: { id: session.user.id },
    data: {
      passwordHash: await bcrypt.hash(newPassword, 12),
    },
  });

  revalidatePath("/dashboard/account");
}

export async function runSyncNowAction() {
  await requireAdmin();
  await runLifecycleSweep();
  revalidatePath("/admin");
  revalidatePath("/dashboard");
}
