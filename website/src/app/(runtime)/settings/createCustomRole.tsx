"use client";

import createRole from "@/actions/settings/createRole";
import { formToJSON } from "axios";
import { ChevronDown, ChevronUp, LoaderCircle, Plus } from "lucide-react";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";

export default function CreateCustomRole() {
    const [isOpen, setOpen] = useState(false);
    const [isLoading, setLoading] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isLoading) return;

        const payload = formToJSON(event.target as HTMLFormElement) as any;

        setLoading(true);
        await createRole({
            name: payload.name,
            description: payload.description,
        });
        setLoading(false);
        toast.success("Created role!");
    };

    return (
        <div className="rounded-xl border border-white/20 overflow-hidden">
            <button
                type="button"
                className="w-full flex justify-between items-center bg-myslate-800 px-4 py-2"
                onClick={(e) => {
                    e.preventDefault();
                    setOpen(!isOpen);
                }}
            >
                <p className="text-xl font-bold">Or create your custom role</p>
                {isOpen ? (
                    <ChevronUp strokeWidth={2.5} />
                ) : (
                    <ChevronDown strokeWidth={2.5} />
                )}
            </button>
            {isOpen && (
                <form className="p-4" onSubmit={handleSubmit}>
                    <div className="space-y-4 mb-6">
                        <div>
                            <p className="mb-2">Role Name</p>
                            <input
                                type="text"
                                name="name"
                                className="w-full text-lg px-4 py-2 rounded-xl bg-myslate-800"
                                placeholder="Software Developer"
                                required
                            />
                        </div>
                        <div>
                            <p className="mb-2">Role Description</p>
                            <textarea
                                name="description"
                                className="w-full px-4 py-2 rounded-xl bg-myslate-800"
                                placeholder="Designs, codes, tests, and maintains software applications using various programming languages and frameworks"
                                required
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="flex gap-2 justify-center items-center bg-white text-myslate-900 px-4 py-2 w-full rounded-xl font-bold"
                    >
                        {isLoading ? (
                            <LoaderCircle
                                className="animate-spin"
                                strokeWidth={2.5}
                            />
                        ) : (
                            <Plus strokeWidth={3} />
                        )}
                        <p className="text-lg">Create custom role</p>
                    </button>
                </form>
            )}
        </div>
    );
}