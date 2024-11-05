"use client";

import { Project } from "@prisma/client";
import { createContext } from "react";

const projectContext = createContext<Project>(null as any);

export default projectContext;