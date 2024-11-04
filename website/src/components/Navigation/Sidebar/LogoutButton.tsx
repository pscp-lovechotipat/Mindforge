"use client";

import logout from "@/actions/auth/logout";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { MouseEvent } from "react";
import toast from "react-hot-toast";

export default function LogoutButton() {
    const router = useRouter();
    
    const handleLogoutClick = async (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        const result = await logout();
        router.push("/login");
        toast.success(result.message);
    };

    return (
        <button
            type="button"
            className="w-[65px] aspect-[1/1] flex justify-center items-center rounded-full transition hover:scale-[0.975] active:scale-95 hover:bg-white/10"
            onClick={handleLogoutClick}
        >
            <LogOut size={40} />
        </button>
    );
}
