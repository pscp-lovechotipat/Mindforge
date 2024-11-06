"use server";

import prisma from "@/lib/prisma";

export default async function loadUsersAutocomplete({
    query,
    idNotIn,
    notInProjectId,
}: {
    query: string;
    idNotIn?: number[];
    notInProjectId?: number;
}) {
    return prisma.user.findMany({
        where: {
            ...(idNotIn
                ? {
                      id: {
                          notIn: idNotIn,
                      },
                  }
                : {}),
            ...(notInProjectId
                ? {
                      NOT: {
                          projects: {
                              some: {
                                  id: notInProjectId,
                              },
                          },
                      },
                  }
                : {}),
            email: {
                contains: query,
            },
        },
        select: {
            id: true,
            email: true,
            profileUrl: true,
        },
        take: 5,
    });
}
