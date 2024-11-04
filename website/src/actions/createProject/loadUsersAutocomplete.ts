"use server";

import prisma from "@/lib/prisma";

export default async function loadUsersAutocomplete({ query, idNotIn }: { query: string, idNotIn: number[] }) {
    return prisma.user.findMany({
        where: {
            id: {
                notIn: idNotIn
            },
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
