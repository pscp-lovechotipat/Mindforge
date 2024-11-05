"use client";

import { ReactNode, useState } from "react";
import userContext, { GetUserResult } from "@/contexts/user";

export default function UserProvider({
    user: _user,
    children,
}: {
    user: GetUserResult;
    children: ReactNode;
}) {
    const [user, setUser] = useState<GetUserResult>(_user);
    return (
        <userContext.Provider value={[user, setUser]}>
            {children}
        </userContext.Provider>
    );
}
