"use server";

import prisma from "@/lib/prisma";
import getUser from "../auth/getUser";

export default async function getMyProject(id: number) {
    const user = await getUser();
    if (!user) return null;
    return prisma.project.findFirst({
        where: {
            users: {
                some: {
                    id: user.id,
                },
            },
            id,
        },
    });
}
