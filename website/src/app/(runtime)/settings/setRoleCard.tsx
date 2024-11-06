"use client";

import { setMyRole } from "@/actions/settings/setMyRole";
import { Role } from "@prisma/client";
import { MouseEvent } from "react";
import toast from "react-hot-toast";

export default function SetRoleCard({ role, onClick }: { role: Role; onClick?: () => any; }) {
    const handleClick = async (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        // Reuse component
        if (onClick) {
            return onClick();
        }
        toast.promise(setMyRole(role.id), {
            loading: "Setting Role...",
            success: "Setting Role Completed!",
            error: "Error!"
        });
    };
    return (
        <button
            type="button"
            className={`p-4 bg-myslate-800 rounded-xl border border-white/20 text-left transition hover:bg-myslate-700 hover:scale-[0.975] active:scale-95`}
            onClick={handleClick}
        >
            <h1 className="text-xl font-bold">{role.name}</h1>
            <p className="text-sm text-white/60 truncate">{role.description}</p>
        </button>
    );
}
