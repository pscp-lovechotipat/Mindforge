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
import userContext from "@/contexts/user";
import { File, LoaderCircle, Plus, Search, X } from "lucide-react";
import {
    ChangeEvent,
    MouseEvent,
    useContext,
    useEffect,
    useState,
} from "react";
import toast from "react-hot-toast";
import projectContext from "@/contexts/project";
import inviteMembers from "@/actions/project/inviteMembers";

interface UserAutocomplete {
    id: number;
    email: string;
    profileUrl: string | null;
}

export function InviteMembersButton({ className }: { className?: string }) {
    const [open, setOpen] = useState(false);
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                className={`flex justify-center items-center space-x-1 py-2 ${
                    className ?? ""
                } text-lg font-bold bg-white text-myslate-950 rounded-xl transition hover:scale-[0.975] active:scale-95`}
            >
                <Plus strokeWidth={3} size={20} />{" "}
                <h1 className="whitespace-nowrap">Invite Member</h1>
            </DialogTrigger>
            <InviteMembersDialogContent onCompleted={() => setOpen(false)} />
        </Dialog>
    );
}

function InviteMembersDialogContent({
    onCompleted,
}: {
    onCompleted: () => any;
}) {
    const project = useContext(projectContext);

    const [user] = useContext(userContext);
    const [isLoading, setLoading] = useState(false);
    const [users, setUsers] = useState<UserAutocomplete[]>([]);
    const [usersAutocomplete, setUsersAutocomplete] = useState<
        UserAutocomplete[]
    >([]);

    const handleSubmitClick = async (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (isLoading) return;

        if (!users.length) {
            return toast.error("Please invite some users");
        }

        setLoading(true);
        await inviteMembers({
            projectId: project.id,
            userIds: users.map((u) => u.id),
        });
        setLoading(false);

        toast.success("Invited members!");
        onCompleted();
    };

    const handleUserInputChange = async (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        event.preventDefault();
        if (!user) return;
        const _usersAutocomplete = await loadUsersAutocomplete({
            query: event.target.value,
            notInProjectId: project.id,
        });
        setUsersAutocomplete(_usersAutocomplete);
    };

    return (
        <DialogContent className="min-w-[600px] bg-myslate-950 py-8 border-4">
            <DialogHeader className="mb-4">
                <DialogTitle className="text-5xl font-bold">
                    Invite Members
                </DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[600px]">
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
                                    <p className="text-sm">{user.email}</p>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setUsers((_users) => {
                                                _users = _users.filter(
                                                    (u) => u.id !== user.id
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
                    <p className="text-xl font-bold mb-2">Invite with email</p>
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
                                            (u) => u.id !== user.id
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
                                <h1 className="font-bold">{user.email}</h1>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <Button
                type="button"
                className="bg-white transition hover:bg-myslate-950 hover:text-white hover:shadow-lg border border-white/0 hover:border-white/20 hover:shadow-white/40 text-myslate-950 w-full text-xl rounded-full py-6"
                onClick={handleSubmitClick}
            >
                {isLoading ? (
                    <LoaderCircle className="animate-spin" strokeWidth={2.5} />
                ) : (
                    "Invites"
                )}
            </Button>
        </DialogContent>
    );
}
