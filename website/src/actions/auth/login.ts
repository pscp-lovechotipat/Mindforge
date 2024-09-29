"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";
import { cookies } from "next/headers";

export default async function login({
    email,
    password,
}: {
    email: string;
    password: string;
}) {
    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });
    if (!user) {
        return {
            success: false,
            message: "Not found this user",
        };
    }
    if (!bcrypt.compareSync(password, user.password)) {
        return {
            success: false,
            message: "Wrong password, please try again",
        };
    }
    const token = sign(
        { sub: user.id, iat: Math.floor(Date.now() / 1000) },
        process.env.JWT_SECRET ?? "chotipatpscp2024",
        { expiresIn: "7d" }
    );
    cookies().set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 604800,
        path: "/",
    });
    return {
        success: true,
        message: "Logged in!",
    };
}
