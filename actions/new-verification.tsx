"use server";

import { getUserByEmail } from "@/data/user";
import { getVerificationTokenByToekn } from "@/data/verification-token";
import { prisma } from "@/lib/db";

export const newVerification = async (token: string) => {
    const existingToken = await getVerificationTokenByToekn(token);

    if (!existingToken) {
        return { error: "Token does not exist!" };
    }

    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
        return { error: "Token has expired!" };
    }

    const existingUser = await getUserByEmail(existingToken.email);

    if (!existingUser) {
        return { error: "Email does not exist!" };
    }

    await prisma.user.update({
        where: { id: existingUser.id },
        data: {
            emailVerified: new Date(),
            email: existingToken.email,
        },
    });

    await prisma.verificationToken.delete({
        where: { id: existingToken.id },
    });

    return { success: "Email verified!" };
};
