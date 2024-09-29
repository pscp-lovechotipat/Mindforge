import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export default async function logout() {
    cookies().delete("token");
    revalidatePath("/");

    return {
        success: true,
        message: "Logout completed.",
    };
}
