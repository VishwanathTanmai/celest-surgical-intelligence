"use server";

import { prisma } from "@/lib/db";

export async function getHistoricalCases() {
  return await prisma.case.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });
}
