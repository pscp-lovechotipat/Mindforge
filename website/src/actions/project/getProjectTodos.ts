"use server";

import prisma from "@/lib/prisma";

export default async function getProjectTodos(projectId: number) {
    return prisma.todo.findMany({
        where: {
            projectId
        },
        include: {
            user: {
                select: {
                    email: true
                }
            }
        }
    })
}