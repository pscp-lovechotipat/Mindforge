import getUser from "@/actions/auth/getUser";
import Link from "next/link";
import LogoutButton from "./LogoutButton";
import { redirect } from "next/navigation";
import StartPage from "./StartPage";

export default async function HomePage() {
    const user = await getUser();

    if (!user) {
        redirect("/login");
    }

    return <StartPage />

    // return (
    //     <div className="p-8">
    //         <h1 className="text-4xl font-bold mb-2">
    //             lovechotipat - Mindforge
    //         </h1>
    //         {!!user && (
    //             <div>
    //                 <p>email: {user.email}</p>
    //                 <p>firstName: {user.firstName}</p>
    //                 <p>lastName: {user.lastName}</p>
    //             </div>
    //         )}
    //         <div className="flex gap-4">
    //             <Link href="/login" className="text-xl underline">
    //                 Login
    //             </Link>
    //             <Link href="/register" className="text-xl underline">
    //                 Register
    //             </Link>
    //             {!!user && <LogoutButton />}
    //         </div>
    //     </div>
    // );
}