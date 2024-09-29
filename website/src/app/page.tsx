"use server";

import getUser from "@/actions/auth/getUser";
import logout from "@/actions/auth/logout";
import Link from "next/link";
import toast from "react-hot-toast";

export default async function HomePage() {
    const user = await getUser();
    return (
        <div className="p-8">
            <h1 className="text-4xl font-bold mb-2">lovechotipat - Mindforge</h1>
            {!!user && (
                <div>
                    <p>email: {user.email}</p>
                    <p>firstName: {user.firstName}</p>
                    <p>lastName: {user.lastName}</p>
                </div>
            )}
            <div className="flex gap-4">
                <Link href="/login" className="text-xl underline">
                    Login
                </Link>
                <Link href="/register" className="text-xl underline">
                    Register
                </Link>
                {/* {!!user && <LogoutButton />} */}
            </div>
        </div>
    );
}

function LogoutButton() {
    "use client";
    return (
        <button
            type="button"
            className="text-xl underline"
            onClick={async (e) => {
                e.preventDefault();
                const result = await logout();
                toast.success(result.message);
            }}
        >
            Logout
        </button>
    );
}
