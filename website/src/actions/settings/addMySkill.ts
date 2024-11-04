"use server";

import prisma from "@/lib/prisma";
import getUser from "../auth/getUser";
import { revalidatePath } from "next/cache";

export async function addMySkill(skillId: number) {
    const user = await getUser();
    if (!user) return;
    await prisma.user.update({
        where: {
            id: user.id
        },
        data: {
            skils: {
                connect: [{ id: skillId }]
            }
        }
    });
    revalidatePath("/");
}
