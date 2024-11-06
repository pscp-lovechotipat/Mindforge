import createProject from "@/actions/createProject/createProject";
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
import userContext from "@/contexts/user";
import formatFileSize from "@/utils/formatFileSize";
import { zodResolver } from "@hookform/resolvers/zod";
import { Project, Role, User } from "@prisma/client";
import { File, LoaderCircle, Plus, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
    ChangeEvent,
    MouseEvent,
    useContext,
    useEffect,
    useState,
} from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import getRoles from "@/actions/settings/getRoles";
import getUsersInProject from "@/actions/project/getUsersInProject";
import createTodo from "@/actions/project/createTodo";

const formSchema = z.object({
    name: z.string().min(1).max(255),
    role: z.string().min(1).max(255),
    userId: z
        .string()
        .refine((val) => !isNaN(val as any) && !isNaN(parseFloat(val))),
    status: z.enum(["0", "1", "2"]),
    priority: z.enum(["0", "1", "2"]),
});

export function CreateTodoButton({
    project,
    className,
}: {
    project: Project;
    className?: string;
}) {
    const [open, setOpen] = useState(false);
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                className={`flex justify-center items-center space-x-1 py-2 ${
                    className ?? ""
                } text-lg font-bold bg-white text-myslate-950 rounded-xl transition hover:scale-[0.975] active:scale-95`}
            >
                <Plus strokeWidth={3} size={20} />{" "}
                <h1 className="whitespace-nowrap">New Todo</h1>
            </DialogTrigger>
            <CreateTodoDialogContent
                project={project}
                onCompleted={() => setOpen(false)}
            />
        </Dialog>
    );
}

function CreateTodoDialogContent({
    project,
    onCompleted,
}: {
    project: Project;
    onCompleted: () => any;
}) {
    const [user] = useContext(userContext);
    const [isLoading, setLoading] = useState(false);
    const [roles, setRoles] = useState<Role[]>([]);
    const [users, setUsers] = useState<
        Awaited<ReturnType<typeof getUsersInProject>>
    >([]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            status: "0",
            priority: "1",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (isLoading) return;
        setLoading(true);
        await createTodo({
            projectId: project.id,
            name: values.name,
            role: values.role,
            userId: +values.userId,
            status: +values.status,
            priority: +values.priority,
        });
        setLoading(false);
        toast.success("Created todo!");
        onCompleted();
    }

    useEffect(() => {
        (async () => {
            const [_roles, _users] = await Promise.all([
                getRoles(),
                getUsersInProject(project.id),
            ]);
            setRoles(_roles);
            setUsers(_users);
            console.log(_users);
        })();
    }, []);

    return (
        <DialogContent className="min-w-[600px] bg-myslate-950 py-8 border-4">
            <DialogHeader className="mb-4">
                <DialogTitle className="text-5xl font-bold">
                    Create todo
                </DialogTitle>
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
                                            Name
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                className="border-2 text-lg px-4 py-6 rounded-xl"
                                                {...field}
                                                placeholder="Create user authentication flows"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xl font-bold">
                                            Role
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                className="border-2 text-lg px-4 py-6 rounded-xl"
                                                {...field}
                                                placeholder="Frontend Developer"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            /> */}
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xl font-bold">
                                            Role
                                        </FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="border-2 text-lg px-4 py-6 rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {roles.map((role, idx) => (
                                                    <SelectItem
                                                        key={idx}
                                                        value={role.name}
                                                    >
                                                        {role.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="userId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xl font-bold">
                                            User to assign
                                        </FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="border-2 text-lg px-4 py-6 rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {users.map((user, idx) => (
                                                    <SelectItem
                                                        key={idx}
                                                        value={user.id.toString()}
                                                    >
                                                        {user.email}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xl font-bold">
                                            Status
                                        </FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="border-2 text-lg px-4 py-6 rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="0">
                                                    Pending
                                                </SelectItem>
                                                <SelectItem value="1">
                                                    In Progress
                                                </SelectItem>
                                                <SelectItem value="2">
                                                    Completed
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xl font-bold">
                                            Priority
                                        </FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="border-2 text-lg px-4 py-6 rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="0">
                                                    Low
                                                </SelectItem>
                                                <SelectItem value="1">
                                                    Medium
                                                </SelectItem>
                                                <SelectItem value="2">
                                                    High
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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
    );
}
