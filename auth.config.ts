import bcrypt from "bcryptjs";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { getUserByEmail } from "./data/user";
import { LoginSchema } from "./schemas";

export default {
    providers: [
        Google,
        GitHub,
        Credentials({
            async authorize(credentials) {
                const validatedFields = LoginSchema.safeParse(credentials);
                if (validatedFields.success) {
                    const { email, password } = validatedFields.data;
                    const user = await getUserByEmail(email);
                    if (!user || !user.password) return null;
                    const passwordMatch = await bcrypt.compare(
                        password,
                        user.password,
                    );
                    if (passwordMatch) return user;
                }
                return null;
            },
        }),
    ],
} satisfies NextAuthConfig;
