"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ChevronRight, LoaderCircle } from "lucide-react";
import login from "@/actions/auth/login";
import Link from "next/link";
import toast from "react-hot-toast";
import { useState } from "react";
import { useRouter } from "next/navigation";

const formSchema = z.object({
    email: z.string().email(),
    password: z
        .string()
        .min(8, "The password must be at least 8 characters long"),
});

export default function LoginPage() {
    const [isLoading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    const router = useRouter();

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (isLoading) return;
        setLoading(true);
        const result = await login(values);
        setLoading(false);
        if (!result.success) {
            return toast.error(result.message);
        }
        toast.success(result.message);
        router.push("/");
    }

    return (
        <div className="relative flex justify-center items-center min-h-screen bg-gradient-to-b from-myslate-950 to-myslate-900 overflow-hidden">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[calc(50%+40px)] w-[102%] h-[40%] bg-myslate-400 rounded-[100%]"></div>
            <div className="w-[500px] bg-myslate-900 p-8 rounded-xl border border-myslate-800 shadow-lg shadow-myslate-200/10">
                <h1 className="text-center text-5xl font-bold mb-12">
                    Sign In
                </h1>
                <div className="flex justify-end">
                    <Link
                        href="/register"
                        className="flex items-center space-x-1"
                    >
                        <p className="font-bold">Create an account</p>
                        <ChevronRight size={20} strokeWidth={2.5} />
                    </Link>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="space-y-4 mb-8">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xl">
                                            Email
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                className="bg-myslate-600 text-lg px-4 py-6 rounded-xl border-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex justify-between items-end">
                                            <FormLabel className="text-xl">
                                                Password
                                            </FormLabel>
                                            <a className="text-sm text-myslate-500">
                                                Forgot Password?
                                            </a>
                                        </div>

                                        <FormControl>
                                            <Input
                                                type="password"
                                                className="bg-myslate-600 text-lg px-4 py-6 rounded-xl border-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="bg-myslate-950 transition hover:bg-white hover:text-myslate-950 w-full text-xl rounded-full py-6"
                        >
                            {isLoading ? (
                                <LoaderCircle
                                    className="animate-spin"
                                    strokeWidth={2.5}
                                />
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}
