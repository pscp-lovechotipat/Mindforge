"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function inviteMembers({
    projectId,
    userIds,
}: {
    projectId: number;
    userIds: number[];
}) {
    await prisma.project.update({
        where: {
            id: projectId,
        },
        data: {
            users: {
                connect: userIds.map((id) => ({ id })),
            },
        },
    });
    revalidatePath("/");
}
