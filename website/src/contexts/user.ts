import getUser from "@/actions/auth/getUser";
import { UseStateType } from "@/interfaces/react";
import { createContext } from "react";

export type GetUserResult = Awaited<ReturnType<typeof getUser>>;

export const userContext = createContext<UseStateType<GetUserResult>>([
    null,
] as any);
