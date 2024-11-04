import { Dispatch, SetStateAction } from "react";

export type UseStateType<S> = [S, Dispatch<SetStateAction<S>>];