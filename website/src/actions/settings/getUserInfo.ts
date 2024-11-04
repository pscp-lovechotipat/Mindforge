"use server";

import prisma from "@/lib/prisma";
import getUser from "../auth/getUser";

export async function getUserInfo() {
    const user = await getUser();
    if (!user) return null;
    const _user = await prisma.user.findUnique({
        where: {
            id: user.id,
        },
        select: {
            experience: true
        },
    });
    return _user;
}
