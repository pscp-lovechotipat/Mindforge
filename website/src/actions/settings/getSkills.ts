"use server";

import prisma from "@/lib/prisma";

export default async function getSkills(ctx?: { idNotIn?: number[] }) {
    return prisma.skill.findMany({
        where: {
            ...(ctx?.idNotIn
                ? {
                      id: {
                          notIn: ctx.idNotIn,
                      },
                  }
                : {}),
        },
    });
}
