import { prisma } from "@/lib/prisma";
import { HouseholdConfig } from "@prisma/client";

export class HouseholdService {
  static async getConfig(): Promise<HouseholdConfig | null> {
    return prisma.householdConfig.findFirst();
  }

  static async updateConfig(data: {
    partner1Id: string;
    partner2Id: string;
    partner1Share: number;
  }): Promise<HouseholdConfig> {
    // Upsert logic: if exists, update; if not, create
    // We assume there's only ONE household config for now

    // First, check if config exists
    const existing = await prisma.householdConfig.findFirst();

    if (existing) {
      return prisma.householdConfig.update({
        where: { id: existing.id },
        data: {
          partner1Id: data.partner1Id,
          partner2Id: data.partner2Id,
          partner1Share: data.partner1Share,
          updatedAt: new Date(),
        },
      });
    } else {
      return prisma.householdConfig.create({
        data: {
          id: crypto.randomUUID(),
          partner1Id: data.partner1Id,
          partner2Id: data.partner2Id,
          partner1Share: data.partner1Share,
          updatedAt: new Date(),
        },
      });
    }
  }
}
