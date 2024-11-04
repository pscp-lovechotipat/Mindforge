"use server";

import prisma from "@/lib/prisma";
import getUser from "../auth/getUser";

export async function getMyRole() {
    const user = await getUser();
    if (!user) return;
    const _user = await prisma.user.findUnique({
        where: {
            id: user.id,
        },
        select: {
            role: true,
        },
    });
    return _user?.role;
}
