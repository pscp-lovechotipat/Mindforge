"use server";

import prisma from "@/lib/prisma";
import getUser from "../auth/getUser";

export default async function editUserInfo({
    experience,
}: {
    experience: string;
}) {
    const user = await getUser();
    if (!user) return;
    await prisma.user.update({
        where: {
            id: user.id,
        },
        data: {
            experience,
        },
    });
}
