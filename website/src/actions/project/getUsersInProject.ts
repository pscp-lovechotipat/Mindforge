"use server";

import prisma from "@/lib/prisma";

export default async function getUsersInProject(projectId: number) {
    return prisma.user.findMany({
        where: {
            projects: {
                some: {
                    id: projectId,
                },
            },
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            createdAt: true,
            updatedAt: true,
        },
    });
}
