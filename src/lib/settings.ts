import { db } from "@/lib/db";

export async function getSettings() {
  return db.systemSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
    },
  });
}
