"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Plus, Search, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
    name: z.string().min(1).max(255),
    description: z.string().min(1).max(255),
});

export default function CreateProjectDialog() {
    const [isLoading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {}

    return (
        <Dialog>
            <DialogTrigger className="flex justify-center items-center space-x-1 w-full py-2 mb-6 text-lg font-bold bg-white text-myslate-950 rounded-xl">
                <Plus strokeWidth={3} size={20} /> <h1>New Project</h1>
            </DialogTrigger>

            <DialogContent className="min-w-[600px] bg-myslate-950 py-8 border-4">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-5xl font-bold">
                        Create a project
                    </DialogTitle>
                    {/* <DialogDescription>
                This action cannot be undone. This will permanently
                delete your account and remove your data from our
                servers.
            </DialogDescription> */}
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="overflow-y-auto max-h-[600px]">
                            <div className="space-y-4 mb-8">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xl font-bold">
                                                Your project name
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    className="border-2 text-lg px-4 py-6 rounded-xl"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xl font-bold">
                                                Description
                                            </FormLabel>
                                            <div className="border-2 rounded-xl">
                                                <FormControl>
                                                    <Textarea
                                                        className="w-full h-[250px] border-none rounded-xl text-lg"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <div className="px-4 flex justify-center">
                                                    <div className="w-full border-t border-white/40 flex justify-end px-4 py-1">
                                                        <p
                                                            className={`font-semibold ${
                                                                field.value
                                                                    ?.length >
                                                                255
                                                                    ? "text-red-500"
                                                                    : ""
                                                            }`}
                                                        >
                                                            {field.value
                                                                ?.length ??
                                                                0}{" "}
                                                            / 255 word
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <h1 className="text-3xl font-bold mb-4">
                                Invite member
                            </h1>
                            <div className="mb-8">
                                <p className="text-white/60 mb-2">members</p>
                                <div className="flex flex-wrap gap-2">
                                    <div className="flex items-center gap-1 border border-white/20 p-1 pr-2 rounded-full">
                                        <img
                                            className="w-[18px] aspect-[1/1] bg-white/10 rounded-full object-cover object-center"
                                            src="/mockup/nicenathapong_profile.jpg"
                                            alt="nicenathapong_profile"
                                        />
                                        <p className="text-sm">
                                            nicenathapong@gmail.com
                                        </p>
                                        <button type="button">
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="mb-8">
                                <p className="text-xl font-bold mb-2">
                                    Invite with email
                                </p>
                                <div className="flex items-center border-2 pr-4 rounded-xl">
                                    <input
                                        type="text"
                                        className="w-full bg-transparent text-lg px-4 py-2.5 rounded-xl"
                                    />
                                    <Search />
                                </div>
                                <div className="bg-myslate-900 rounded-xl">
                                    <button
                                        type="button"
                                        className="w-full flex items-center gap-3 py-3 px-4 rounded-xl border-2 border-white/0 transition hover:border-white/20"
                                    >
                                        <img
                                            className="w-[30px] aspect-[1/1] bg-white/10 rounded-full object-cover object-center"
                                            src="/mockup/nicenathapong_profile.jpg"
                                            alt="nicenathapong_profile"
                                        />
                                        <h1 className="font-bold">
                                            nicenathapong@gmail.com
                                        </h1>
                                    </button>
                                    <button
                                        type="button"
                                        className="w-full flex items-center gap-3 py-3 px-4 rounded-xl border-2 border-white/0 transition hover:border-white/20"
                                    >
                                        <img
                                            className="w-[30px] aspect-[1/1] bg-white/10 rounded-full object-cover object-center"
                                            src="/mockup/nicenathapong_profile.jpg"
                                            alt="nicenathapong_profile"
                                        />
                                        <h1 className="font-bold">
                                            nicenathapong@gmail.com
                                        </h1>
                                    </button>{" "}
                                    <button
                                        type="button"
                                        className="w-full flex items-center gap-3 py-3 px-4 rounded-xl border-2 border-white/0 transition hover:border-white/20"
                                    >
                                        <img
                                            className="w-[30px] aspect-[1/1] bg-white/10 rounded-full object-cover object-center"
                                            src="/mockup/nicenathapong_profile.jpg"
                                            alt="nicenathapong_profile"
                                        />
                                        <h1 className="font-bold">
                                            nicenathapong@gmail.com
                                        </h1>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="bg-white transition hover:bg-myslate-950 hover:text-white hover:shadow-lg border border-white/0 hover:border-white/20 hover:shadow-white/40 text-myslate-950 w-full text-xl rounded-full py-6"
                        >
                            {isLoading ? (
                                <LoaderCircle
                                    className="animate-spin"
                                    strokeWidth={2.5}
                                />
                            ) : (
                                "Create"
                            )}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
