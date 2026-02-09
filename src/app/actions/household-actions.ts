"use server";

import { HouseholdService } from "@/services/household-service";
import { revalidatePath } from "next/cache";

export async function getHouseholdConfig() {
  const config = await HouseholdService.getConfig();

  if (!config) return null;

  // Serialize Decimal objects to numbers for Client Components
  return {
    ...config,
    partner1Share: Number(config.partner1Share),
  };
}

export async function updateHouseholdConfig(formData: FormData) {
  const partner1Id = formData.get("partner1Id") as string;
  const partner2Id = formData.get("partner2Id") as string;
  const partner1Share = parseFloat(formData.get("partner1Share") as string);

  if (!partner1Id || !partner2Id || isNaN(partner1Share)) {
    throw new Error("Invalid form data");
  }

  await HouseholdService.updateConfig({
    partner1Id,
    partner2Id,
    partner1Share,
  });

  revalidatePath("/settings");
}
