"use server";

import prisma from "@/lib/prisma";
import getUser from "../auth/getUser";

export default async function getMyProjects() {
    const user = await getUser();
    if (!user) return [];
    return prisma.project.findMany({
        where: {
            users: {
                some: {
                    id: user.id,
                },
            },
        },
    });
}
