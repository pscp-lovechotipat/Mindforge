"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function createTodo({
    projectId,
    name,
    role,
    userId,
    status,
    priority
}: {
    projectId: number;
    name: string;
    role: string;
    userId: number;
    status: number;
    priority: number;
}) {
    await prisma.todo.create({
        data: {
            projectId,
            name,
            role,
            userId,
            status,
            priority
        }
    });
    revalidatePath("/");
}