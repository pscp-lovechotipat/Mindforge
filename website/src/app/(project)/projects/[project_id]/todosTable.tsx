"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import getProjectTodos from "@/actions/project/getProjectTodos";
import setTodoStatus from "@/actions/project/setTodoStatus";
import toast from "react-hot-toast";
import getStatusColor from "@/utils/getStatusColor";
import { useContext, useRef } from "react";
import getPriorityColor from "@/utils/getPriorityColor";
import setTodoPriority from "@/actions/project/setTodoPriority";
import deleteTodo from "@/actions/project/deleteTodo";
import toggleAllTodos from "@/actions/project/toggleAllTodos";
import projectContext from "@/contexts/project";
import { CreateTodoButton } from "@/components/Dialogs/CreateTodo";

type GetTodoResult = Awaited<ReturnType<typeof getProjectTodos>>;

export default function TodosTable({ todos }: { todos: GetTodoResult }) {
    const project = useContext(projectContext);

    const handleStatusChange = (todo: GetTodoResult[number], value: string) => {
        toast.promise(setTodoStatus(todo.id, +value), {
            loading: "Editing todo status...",
            success: "Editted todo status!",
            error: "Error!",
        });
    };
    const handlePriorityChange = (
        todo: GetTodoResult[number],
        value: string
    ) => {
        toast.promise(setTodoPriority(todo.id, +value), {
            loading: "Editing todo status...",
            success: "Editted todo status!",
            error: "Error!",
        });
    };
    const handleDeleteClick = (todo: GetTodoResult[number]) => {
        toast.promise(deleteTodo(todo.id), {
            loading: "Deleteing todo...",
            success: "Deleted todo!",
            error: "Error!",
        });
    };
    const handleToggleAllTodos = () => {
        toast.promise(
            toggleAllTodos(project.id, !todos.every((t) => t.status === 2)),
            {
                loading: `${
                    todos.every((t) => t.status === 2)
                        ? "Uncompleted"
                        : "Completed"
                } all todos...`,
                success: `${
                    todos.every((t) => t.status === 2)
                        ? "Uncompleted"
                        : "Completed"
                } all todos!`,
                error: "Error!",
            }
        );
    };

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <div>
                    {/* <p className="mb-2">Filters</p>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            className="px-6 py-2 border border-white/20 rounded-lg font-bold"
                        >
                            For Me
                        </button>
                        <button
                            type="button"
                            className="px-6 py-2 border border-white/20 rounded-lg font-bold"
                        >
                            Completed
                        </button>
                    </div> */}
                </div>

                <CreateTodoButton className="h-fit px-6" />
            </div>

            <div className="bg-myslate-900 border-2 rounded-2xl overflow-hidden max-w-[calc(100vw-205px)]">
                <Table className="text-lg overflow-x-auto whitespace-nowrap">
                    {/* <TableCaption>A list of your recent todos.</TableCaption> */}
                    <TableHeader>
                        <TableRow className="hover:bg-slate-900">
                            <TableHead className="px-4 pt-3 pb-1">
                                <input
                                    type="checkbox"
                                    className="w-[20px] aspect-[1/1] transition hover:scale-95 active:scale-90"
                                    checked={todos.every((t) => t.status === 2)}
                                    onChange={(e) => {
                                        e.preventDefault();
                                        handleToggleAllTodos();
                                    }}
                                />
                            </TableHead>
                            <TableHead className="text-white font-bold px-4 py-2">
                                Task
                            </TableHead>
                            <TableHead className="text-white font-bold px-4 py-2">
                                Created At
                            </TableHead>
                            <TableHead className="text-white font-bold px-4 py-2">
                                Assignee
                            </TableHead>
                            <TableHead className="text-white font-bold px-4 py-2">
                                Role
                            </TableHead>
                            <TableHead className="text-white font-bold px-4 py-2">
                                Status
                            </TableHead>
                            <TableHead className="text-white font-bold px-4 py-2">
                                Priority
                            </TableHead>
                            <TableHead className="text-white font-bold px-4 py-2">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {todos.map((todo, idx) => (
                            <TableRow key={idx} className="hover:bg-slate-900">
                                <TableCell className="px-4 pt-3 pb-1">
                                    <input
                                        type="checkbox"
                                        className="w-[20px] aspect-[1/1] transition hover:scale-95 active:scale-90"
                                        checked={todo.status === 2}
                                        onChange={(e) => {
                                            e.preventDefault();
                                            if (todo.status === 2) {
                                                return handleStatusChange(
                                                    todo,
                                                    "0"
                                                );
                                            }
                                            handleStatusChange(todo, "2");
                                        }}
                                    />
                                </TableCell>
                                <TableCell className="text-white px-4 py-2">
                                    {todo.name}
                                </TableCell>
                                <TableCell className="text-white/40 px-4 py-2 text-sm">
                                    {todo.createdAt.toLocaleString()}
                                </TableCell>
                                <TableCell className="px-4 py-2">
                                    <p className="w-fit text-sm px-4 py-1 bg-white/10 rounded-full">
                                        {todo.user.email}
                                    </p>
                                </TableCell>
                                <TableCell className="px-4 py-2">
                                    <p className="w-fit text-sm px-4 py-1 bg-white/10 rounded-full">
                                        {todo.role}
                                    </p>
                                </TableCell>
                                <TableCell className="text-white font-bold px-4 py-2">
                                    <Select
                                        defaultValue={todo.status.toString()}
                                        onValueChange={(val) =>
                                            handleStatusChange(todo, val)
                                        }
                                    >
                                        <SelectTrigger
                                            className={`w-[120px] h-[30px] rounded-lg transition ${getStatusColor(
                                                todo.status
                                            )}`}
                                        >
                                            <SelectValue />
                                        </SelectTrigger>
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
                                </TableCell>
                                <TableCell className="text-white font-bold px-4 py-2">
                                    <Select
                                        defaultValue={todo.priority.toString()}
                                        onValueChange={(val) =>
                                            handlePriorityChange(todo, val)
                                        }
                                    >
                                        <SelectTrigger
                                            className={`w-[120px] h-[30px] rounded-lg transition ${getPriorityColor(
                                                todo.priority
                                            )}`}
                                        >
                                            <SelectValue />
                                        </SelectTrigger>
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
                                </TableCell>
                                <TableCell className="px-4 py-2">
                                    <AlertDialog>
                                        <AlertDialogTrigger className="text-base font-bold text-red-400 underline">
                                            Delete
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="bg-myslate-900 border-2">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    Are you sure to delete this
                                                    task?
                                                </AlertDialogTitle>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="font-bold bg-myslate-700 border-none hover:text-white hover:bg-myslate-600 hover:scale-[0.975] active:scale-95">
                                                    Cancel
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                    className="font-bold bg-red-500 transition hover:bg-red-600 hover:scale-[0.975] active:scale-95"
                                                    onClick={() => {
                                                        handleDeleteClick(todo);
                                                    }}
                                                >
                                                    Continue
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}
