"use server";

import prisma from "@/lib/prisma";

export default async function getRoles() {
    return prisma.role.findMany();
}