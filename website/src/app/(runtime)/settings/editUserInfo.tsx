"use client";

import editUserInfo from "@/actions/settings/editUserInfo";
import { getUserInfo } from "@/actions/settings/getUserInfo";
import { formToJSON } from "axios";
import { LoaderCircle, Save } from "lucide-react";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";

export default function EditUserInfo({
    userInfo,
}: {
    userInfo: Awaited<ReturnType<typeof getUserInfo>>;
}) {
    const [isLoading, setLoading] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isLoading) return;

        const payload = formToJSON(event.target as HTMLFormElement) as any;

        setLoading(true);
        await editUserInfo({
            experience: payload.experience,
        });
        setLoading(false);
        toast.success("Edited user info!");
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-4 mb-6">
                <div>
                    <p className="mb-2">Your experience</p>
                    <textarea
                        name="experience"
                        className="w-full text-lg px-4 py-2 rounded-xl bg-myslate-800"
                        placeholder="5 years in full-stack development with focus on scalable applications"
                        required
                        defaultValue={userInfo?.experience ?? ""}
                    />
                </div>
            </div>
            <button
                type="submit"
                className="flex gap-2 justify-center items-center bg-white text-myslate-900 px-4 py-2 w-full rounded-xl font-bold transition hover:scale-[0.975] active:scale-95"
            >
                {isLoading ? (
                    <LoaderCircle className="animate-spin" strokeWidth={2.5} />
                ) : (
                    <Save strokeWidth={2.5} />
                )}
                <p className="text-lg font-bold">Save user info</p>
            </button>
        </form>
    );
}
