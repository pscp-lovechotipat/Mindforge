"use client";

import { setMyRole } from "@/actions/settings/setMyRole";
import { Role } from "@prisma/client";
import { X } from "lucide-react";
import { MouseEvent } from "react";
import toast from "react-hot-toast";

export default function MyRoleCard({
    role,
    className,
    onRemoveClick,
}: {
    role: Role;
    className?: string;
    onRemoveClick?: () => any;
}) {
    const handleRemoveClick = async (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (onRemoveClick) {
            return onRemoveClick();
        }
        toast.promise(setMyRole(null), {
            loading: "Removing Role...",
            success: "Removed Role!",
            error: "Error!",
        });
    };
    return (
        <div className={`relative rounded-xl bg-myslate-800 border border-white/20 p-4 ${className ?? ""}`}>
            <button
                type="button"
                className="absolute -top-2 right-4 h-[30px] flex gap-1 px-4 justify-center items-center rounded-full bg-red-500 transition hover:scale-[0.975] active:scale-95"
                onClick={handleRemoveClick}
            >
                <X size={16} strokeWidth={3} />
                <p className="text-sm font-bold">Remove role</p>
            </button>
            <h1 className="text-2xl font-bold">{role.name}</h1>
            <p>{role.description}</p>
        </div>
    );
}
