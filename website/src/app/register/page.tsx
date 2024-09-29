"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ChevronLeft, LoaderCircle } from "lucide-react";
import login from "@/actions/auth/login";
import Link from "next/link";
import register from "@/actions/auth/register";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const registerSchema = z
    .object({
        firstName: z.string().max(255),
        lastName: z.string().max(255),
        email: z.string().email().max(255),
        password: z
            .string()
            .min(8, "The password must be at least 8 characters long"),
        confirmPassword: z
            .string()
            .min(8, "The password must be at least 8 characters long"),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

export default function RegisterPage() {
    const [isLoading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
    });

    const router = useRouter();

    async function onSubmit(values: z.infer<typeof registerSchema>) {
        if (isLoading) return;
        setLoading(true);
        const result = await register(values);
        setLoading(false);
        if (!result.success) {
            return toast.error(result.message);
        }
        toast.success(result.message);
        router.push("/login");
    }

    return (
        <div className="relative flex justify-center items-center min-h-screen bg-gradient-to-b from-myslate-950 to-myslate-900 overflow-hidden">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[calc(50%+40px)] w-[102%] h-[40%] bg-myslate-400 rounded-[100%]"></div>
            <div className="relative flex bg-myslate-900 p-8 rounded-xl border border-myslate-800 shadow-lg shadow-myslate-200/10">
                <Link href="/login" className="absolute top-10 left-6">
                    <ChevronLeft size={36} />
                </Link>
                <div className="w-[600px] pr-8 border-r border-myslate-700">
                    <h1 className="text-center text-5xl font-bold mb-12">
                        Create an account
                    </h1>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="space-y-4 mb-8">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="firstName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xl">
                                                    First Name
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
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
                                        name="lastName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xl">
                                                    First Name
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        className="bg-myslate-600 text-lg px-4 py-6 rounded-xl border-none"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
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
                                            <FormLabel className="text-xl">
                                                Password
                                            </FormLabel>

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
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xl">
                                                Confirm Password
                                            </FormLabel>

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
                                    "Create User"
                                )}
                            </Button>
                        </form>
                    </Form>
                </div>
                <div className="ml-8 w-[450px]">
                    <h1 className="text-center text-5xl font-bold mb-12">
                        Select role
                    </h1>
                    <div className="grid grid-cols-2 gap-6">
                        <button
                            type="button"
                            className="text-center bg-myslate-300 text-myslate-950 py-2 rounded-xl"
                        >
                            <h1 className="text-xl font-bold">Role Name</h1>
                            <p className="text-sm -mt-0.5">Role Description</p>
                        </button>
                        <button
                            type="button"
                            className="text-center bg-myslate-300 text-myslate-950 py-2 rounded-xl"
                        >
                            <h1 className="text-xl font-bold">Role Name</h1>
                            <p className="text-sm -mt-0.5">Role Description</p>
                        </button>
                        <button
                            type="button"
                            className="text-center bg-myslate-300 text-myslate-950 py-2 rounded-xl"
                        >
                            <h1 className="text-xl font-bold">Role Name</h1>
                            <p className="text-sm -mt-0.5">Role Description</p>
                        </button>
                        <button
                            type="button"
                            className="text-center bg-myslate-300 text-myslate-950 py-2 rounded-xl"
                        >
                            <h1 className="text-xl font-bold">Role Name</h1>
                            <p className="text-sm -mt-0.5">Role Description</p>
                        </button>
                        <button
                            type="button"
                            className="text-center bg-myslate-300 text-myslate-950 py-2 rounded-xl"
                        >
                            <h1 className="text-xl font-bold">Role Name</h1>
                            <p className="text-sm -mt-0.5">Role Description</p>
                        </button>
                        <button
                            type="button"
                            className="text-center bg-myslate-300 text-myslate-950 py-2 rounded-xl"
                        >
                            <h1 className="text-xl font-bold">Role Name</h1>
                            <p className="text-sm -mt-0.5">Role Description</p>
                        </button>
                        <button
                            type="button"
                            className="text-center bg-myslate-300 text-myslate-950 py-2 rounded-xl"
                        >
                            <h1 className="text-xl font-bold">Role Name</h1>
                            <p className="text-sm -mt-0.5">Role Description</p>
                        </button>
                        <button
                            type="button"
                            className="text-center bg-myslate-300 text-myslate-950 py-2 rounded-xl"
                        >
                            <h1 className="text-xl font-bold">Role Name</h1>
                            <p className="text-sm -mt-0.5">Role Description</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
