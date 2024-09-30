"use client";

import logout from "@/actions/auth/logout";
import { MouseEvent } from "react";
import toast from "react-hot-toast";

export default function LogoutButton() {

    const handleLogoutClick = async (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        const result = await logout();
        toast.success(result.message);
    };

    return (
        <button className="text-xl underline" onClick={handleLogoutClick}>
            Logout
        </button>
    );
}