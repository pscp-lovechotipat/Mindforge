"use server";

import prisma from "@/lib/prisma";
import getUser from "../auth/getUser";

export async function getMySkills() {
    const user = await getUser();
    if (!user) return [];
    const _user = await prisma.user.findUnique({
        where: {
            id: user.id,
        },
        select: {
            skils: true,
        },
    });
    return _user?.skils ?? [];
}
