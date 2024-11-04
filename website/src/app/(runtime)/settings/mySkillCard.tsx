"use client";

import { removeMySkill } from "@/actions/settings/removeMySkill";
import { Skill } from "@prisma/client";
import { X } from "lucide-react";
import { MouseEvent } from "react";
import toast from "react-hot-toast";

export default function MySkillCard({ skill }: { skill: Skill }) {
    const handleRemoveClick = async (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        toast.promise(removeMySkill(skill.id), {
            loading: "Removing Skill...",
            success: "Removed Skill!",
            error: "Error!",
        });
    };
    return (
        <div
            className="relative p-4 bg-myslate-800 rounded-xl border border-white/20 text-left"
        >
            <button
                type="button"
                className="absolute top-2 right-2 w-[25px] aspect-[1/1] flex justify-center items-center rounded-full bg-red-500 transition hover:scale-[0.975] active:scale-95"
                onClick={handleRemoveClick}
            >
                <X size={16} strokeWidth={3} />
            </button>
            <h1 className="text-xl font-bold">{skill.name}</h1>
            <p className="text-sm text-white/60 truncate">
                {skill.description}
            </p>
        </div>
    );
}
