import { PrismaClient } from "@prisma/client";

export function createD1Adapter(env: any) {
    return new Proxy(new PrismaClient(), {
        get(target, prop) {
            const model = target[prop as keyof typeof target];
            if (typeof model !== "object") return model;

            return new Proxy(model, {
                get(modelTarget, modelProp) {
                    const operation =
                        modelTarget[modelProp as keyof typeof modelTarget];
                    if (typeof operation !== "function") return operation;

                    return async (...args: any[]) => {
                        const sql = (operation as any).toSQL?.(...args);
                        if (!sql) return (operation as any)(...args);

                        const result = await env.DB.prepare(sql.sql)
                            .bind(...sql.parameters)
                            .all();
                        return result.results;
                    };
                },
            });
        },
    });
}
