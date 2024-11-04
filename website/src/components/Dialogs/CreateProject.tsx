"use client";

import loadUsersAutocomplete from "@/actions/createProject/loadUsersAutocomplete";
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
import formatFileSize from "@/utils/formatFileSize";
import { zodResolver } from "@hookform/resolvers/zod";
import { File, LoaderCircle, Plus, Search, X } from "lucide-react";
import { ChangeEvent, MouseEvent, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
    name: z.string().min(1).max(255),
    description: z.string().min(1).max(10000),
});

interface UserAutocomplete {
    id: number;
    email: string;
    profileUrl: string | null
}

export function CreateProjectButton({ className }: { className?: string }) {
    return (
        <Dialog>
            <DialogTrigger
                className={`flex justify-center items-center space-x-1 py-2 ${
                    className ?? ""
                } text-lg font-bold bg-white text-myslate-950 rounded-xl transition hover:scale-[0.975] active:scale-95`}
            >
                <Plus strokeWidth={3} size={20} />{" "}
                <h1 className="whitespace-nowrap">New Project</h1>
            </DialogTrigger>
            <CreateProjectDialogContent />
        </Dialog>
    );
}

export function CreateProjectCard() {
    return (
        <Dialog>
            <DialogTrigger className="text-left transition hover:scale-[0.975] active:scale-95">
                <div className="w-[300px] aspect-[16/9] bg-white/10 border-2 border-myslate-500 rounded-2xl mb-2 flex justify-center items-center">
                    <Plus size={60} />
                </div>
                <h1 className="text-lg font-bold">Blank Project</h1>
                <p>Date : --/--/--</p>
            </DialogTrigger>
            <CreateProjectDialogContent />
        </Dialog>
    );
}

function CreateProjectDialogContent() {
    const [isLoading, setLoading] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [users, setUsers] = useState<UserAutocomplete[]>([]);
    const [usersAutocomplete, setUsersAutocomplete] = useState<UserAutocomplete[]>([]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {}

    const handleUploadFileClick = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        const _input = document.createElement("input");
        _input.type = "file";
        _input.accept = ".txt,.md,.pdf";
        _input.onchange = function (e) {
            e.preventDefault();
            const file = (e.target as HTMLInputElement).files?.item(0);
            if (!file) return;
            setFiles((f) => [...f, file]);
        };
        _input.click();
    };

    const handleUserInputChange = async (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        event.preventDefault();
        const _usersAutocomplete = await loadUsersAutocomplete({
            query: event.target.value,
            idNotIn: users.map(u => u.id)
        });
        setUsersAutocomplete(_usersAutocomplete);
    };

    return (
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
                                            Project Name
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
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
                                            Project Description
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
                                                                ?.length > 10000
                                                                ? "text-red-500"
                                                                : ""
                                                        }`}
                                                    >
                                                        {field.value?.length ??
                                                            0}{" "}
                                                        / 10000 word
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div>
                                <p className="text-xl font-bold mb-2">
                                    Docs or Files (.txt, .md, .pdf)
                                </p>
                                <div className="rounded-xl border-2 p-4 mb-4">
                                    {/* <div className="border border-white/10 p-4 rounded-lg transition hover:bg-white/10">
                                        <div className="flex justify-center">
                                            <Plus />
                                        </div>
                                        <p className="text-center font-bold">Upload new file</p>
                                    </div> */}
                                    {files.length > 0 && (
                                        <div className="grid grid-cols-3 gap-2 mb-4">
                                            {files.map((file, idx) => (
                                                <div
                                                    key={idx}
                                                    className="relative bg-white/10 border border-white/20 p-4 rounded-lg"
                                                >
                                                    <button
                                                        type="button"
                                                        className="absolute -top-1 -right-1 w-[20px] flex justify-center items-center aspect-[1/1] rounded-full bg-red-500 transition hover:scale-95 active:scale-90"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setFiles(
                                                                (_files) => {
                                                                    _files =
                                                                        _files.filter(
                                                                            (
                                                                                _,
                                                                                _idx
                                                                            ) =>
                                                                                _idx !==
                                                                                idx
                                                                        );
                                                                    return _files;
                                                                }
                                                            );
                                                        }}
                                                    >
                                                        <X
                                                            size={16}
                                                            strokeWidth={2.5}
                                                        />
                                                    </button>
                                                    <div className="flex justify-center mb-1">
                                                        <File />
                                                    </div>
                                                    <div className="text-center">
                                                        <h1 className="text-center font-bold">
                                                            {file.name}
                                                        </h1>
                                                        <p className="text-white/40 text-xs">
                                                            (
                                                            {formatFileSize(
                                                                file.size
                                                            )}
                                                            )
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        className="w-full flex justify-center gap-2 p-3 bg-white/10 transition hover:bg-white/20 hover:scale-[0.975] active:scale-95 rounded-xl"
                                        onClick={handleUploadFileClick}
                                    >
                                        <Plus />
                                        <p className="font-bold">
                                            Upload new file
                                        </p>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold mb-4">
                            Invite member
                        </h1>
                        {users.length > 0 && (
                            <div className="mb-8">
                                <p className="text-white/60 mb-2">members</p>
                                <div className="flex flex-wrap gap-2">
                                    {users.map((user, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-1 border border-white/20 p-1 pr-2 rounded-full"
                                        >
                                            {/* <img
                                        className="w-[18px] aspect-[1/1] bg-white/10 rounded-full object-cover object-center"
                                        src="/mockup/nicenathapong_profile.jpg"
                                        alt="nicenathapong_profile"
                                    /> */}
                                            <div className="w-[18px] aspect-[1/1] bg-white/10 rounded-full"></div>
                                            <p className="text-sm">
                                                {user.email}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setUsers((_users) => {
                                                        _users = _users.filter(
                                                            (u) =>
                                                                u.id !== user.id
                                                        );
                                                        return _users;
                                                    });
                                                }}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mb-8">
                            <p className="text-xl font-bold mb-2">
                                Invite with email
                            </p>
                            <div className="flex items-center border-2 pr-4 rounded-xl">
                                <input
                                    type="text"
                                    className="w-full bg-transparent text-lg px-4 py-2.5 rounded-xl"
                                    onChange={handleUserInputChange}
                                />
                                <Search />
                            </div>
                            <div className="bg-myslate-900 rounded-xl">
                                {usersAutocomplete.map((user, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        className="w-full flex items-center gap-3 py-3 px-4 rounded-xl border-2 border-white/0 transition hover:border-white/20"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setUsers((u) => [...u, user]);
                                            setUsersAutocomplete((_users) => {
                                                _users = _users.filter(
                                                    (u) =>
                                                        u.id !== user.id
                                                );
                                                return _users;
                                            });
                                        }}
                                    >
                                        {/* <img
                                            className="w-[30px] aspect-[1/1] bg-white/10 rounded-full object-cover object-center"
                                            src="/mockup/nicenathapong_profile.jpg"
                                            alt="nicenathapong_profile"
                                        /> */}
                                        <div className="w-[30px] aspect-[1/1] bg-white/10 rounded-full"></div>
                                        <h1 className="font-bold">
                                            {user.email}
                                        </h1>
                                    </button>
                                ))}
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
                            "Create and Analyze"
                        )}
                    </Button>
                </form>
            </Form>
        </DialogContent>
    );
}
