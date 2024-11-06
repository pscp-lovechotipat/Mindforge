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
import Link from "next/link";
import register from "@/actions/auth/register";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import registerSchema from "@/schemas/registerSchama";
import { Role, Skill } from "@prisma/client";
import getRoles from "@/actions/settings/getRoles";
import getSkills from "@/actions/settings/getSkills";

export default function RegisterPage() {
    const [isLoading, setLoading] = useState(false);
    const [roles, setRoles] = useState<Role[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [roleSelect, setRoleSelect] = useState<Role | null>(null);
    const [skillsSelect, setSkillsSelect] = useState<Skill[]>([]);

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

    useEffect(() => {
        getRoles().then(setRoles);
        getSkills().then(setSkills);
    }, []);

    return (
        <div className="relative flex justify-center items-center min-h-screen bg-gradient-to-b from-myslate-950 to-myslate-900 overflow-hidden">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[calc(50%+40px)] w-[102%] h-[40%] bg-myslate-400 rounded-[100%]"></div>

            <Link href="/login" className="absolute top-10 left-6">
                <ChevronLeft size={36} />
            </Link>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="relative flex bg-myslate-900 p-8 rounded-xl border border-myslate-800 shadow-lg shadow-myslate-200/10">
                        <div className="w-[600px] pr-8 border-r border-myslate-700">
                            <h1 className="text-center text-5xl font-bold mb-12">
                                Create an account
                            </h1>

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
                        </div>
                        <div className="ml-8 w-[450px]">
                            {/* <h1 className="text-center text-5xl font-bold mb-12">
                                Select role
                            </h1>
                            <div className="grid grid-cols-2 gap-6">
                                <button
                                    type="button"
                                    className="text-center bg-myslate-300 text-myslate-950 py-2 rounded-xl"
                                >
                                    <h1 className="text-xl font-bold">
                                        Role Name
                                    </h1>
                                    <p className="text-sm -mt-0.5">
                                        Role Description
                                    </p>
                                </button>
                                <button
                                    type="button"
                                    className="text-center bg-myslate-300 text-myslate-950 py-2 rounded-xl"
                                >
                                    <h1 className="text-xl font-bold">
                                        Role Name
                                    </h1>
                                    <p className="text-sm -mt-0.5">
                                        Role Description
                                    </p>
                                </button>
                                <button
                                    type="button"
                                    className="text-center bg-myslate-300 text-myslate-950 py-2 rounded-xl"
                                >
                                    <h1 className="text-xl font-bold">
                                        Role Name
                                    </h1>
                                    <p className="text-sm -mt-0.5">
                                        Role Description
                                    </p>
                                </button>
                                <button
                                    type="button"
                                    className="text-center bg-myslate-300 text-myslate-950 py-2 rounded-xl"
                                >
                                    <h1 className="text-xl font-bold">
                                        Role Name
                                    </h1>
                                    <p className="text-sm -mt-0.5">
                                        Role Description
                                    </p>
                                </button>
                                <button
                                    type="button"
                                    className="text-center bg-myslate-300 text-myslate-950 py-2 rounded-xl"
                                >
                                    <h1 className="text-xl font-bold">
                                        Role Name
                                    </h1>
                                    <p className="text-sm -mt-0.5">
                                        Role Description
                                    </p>
                                </button>
                                <button
                                    type="button"
                                    className="text-center bg-myslate-300 text-myslate-950 py-2 rounded-xl"
                                >
                                    <h1 className="text-xl font-bold">
                                        Role Name
                                    </h1>
                                    <p className="text-sm -mt-0.5">
                                        Role Description
                                    </p>
                                </button>
                                <button
                                    type="button"
                                    className="text-center bg-myslate-300 text-myslate-950 py-2 rounded-xl"
                                >
                                    <h1 className="text-xl font-bold">
                                        Role Name
                                    </h1>
                                    <p className="text-sm -mt-0.5">
                                        Role Description
                                    </p>
                                </button>
                                <button
                                    type="button"
                                    className="text-center bg-myslate-300 text-myslate-950 py-2 rounded-xl"
                                >
                                    <h1 className="text-xl font-bold">
                                        Role Name
                                    </h1>
                                    <p className="text-sm -mt-0.5">
                                        Role Description
                                    </p>
                                </button>
                            </div> */}
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
}
