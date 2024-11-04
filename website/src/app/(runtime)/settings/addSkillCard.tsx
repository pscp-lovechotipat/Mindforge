"use client";

import { addMySkill } from "@/actions/settings/addMySkill";
import { Skill } from "@prisma/client";
import { MouseEvent } from "react";
import toast from "react-hot-toast";

export default function AddSkillCard({ skill }: { skill: Skill }) {
    const handleClick = async (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        toast.promise(addMySkill(skill.id), {
            loading: "Add skill...",
            success: "Added skill!",
            error: "Error!",
        });
    };
    return (
        <button
            type="button"
            className="p-4 bg-myslate-800 rounded-xl border border-white/20 text-left transition hover:bg-myslate-700 hover:scale-[0.975] active:scale-95"
            onClick={handleClick}
        >
            <h1 className="text-xl font-bold">{skill.name}</h1>
            <p className="text-sm text-white/60 truncate">
                {skill.description}
            </p>
        </button>
    );
}
