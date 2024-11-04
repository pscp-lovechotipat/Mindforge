"use client";

import { ReactNode, useEffect, useState } from "react";
import { GetUserResult, userContext } from "@/contexts/user";

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
