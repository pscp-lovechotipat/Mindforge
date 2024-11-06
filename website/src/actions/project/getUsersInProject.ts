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
            experience: true,
            role: {
                select: {
                    name: true
                }
            },
            skils: {
                select: {
                    name: true
                }
            },
            createdAt: true,
            updatedAt: true,
        },
    });
}

export type GetUsersInProjectResult = Awaited<
    ReturnType<typeof getUsersInProject>
>;
