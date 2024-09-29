"use server";

import prisma from "@/lib/prisma";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";

export default async function getUser() {
    try {
        const token = cookies().get("token")?.value;

        if (!token) {
            return null;
        }

        const decoded = verify(
            token,
            process.env.JWT_SECRET ?? "chotipatpscp2024"
        ) as any as { sub: number };

        const user = await prisma.user.findUnique({
            where: { id: decoded.sub },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            return null;
        }

        return user;
    } catch (e) {
        console.error("Error getting user info:", e);
        return null;
    }
}
