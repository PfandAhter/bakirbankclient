import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from 'next/headers';

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export async function createUserSessionToken(acctoken: string) {
    const cookieStore = await cookies();
    const expirestAt = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) // 1 gün
    const session = await encrypt({ token: acctoken, expiresAt: expirestAt });

    cookieStore.set("mb_session", session, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        expires: expirestAt, // 1 gün
    });
}

type SessionPayload = {
    token: string;
    expiresAt: Date;
};

export async function encrypt(payload: SessionPayload) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256", typ: "JWT" })
        .setIssuedAt()
        .setExpirationTime("1d") // 1 gün
        .sign(encodedKey);
}

export async function decrypt(session: string | undefined = "") {
    try {
        const { payload } = await jwtVerify(session, encodedKey, {
            algorithms: ["HS256"],
        });
        return payload;
    } catch (error) {
        console.log("Failed to verify session", error);
    }
}

export async function deleteUserSessionToken() {
    const cookieStore = await cookies();
    cookieStore.delete("mb_session");
}



export async function getAccessTokenFromSession(): Promise<string | null> {
    const cookieStore = await cookies();
    const session = cookieStore.get("mb_session")?.value;

    if (!session) return null;

    const data = await decrypt(session);
    if (!data || !data.token) return null;

    return data.token as string;
}

/*export const getCookie = (name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }

    return null;
}*/

/*export const setCookie = (name: string, value: string, days: number = 1) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;secure;samesite=strict`;
}*/

/*export const deleteCookie = (name: string) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}*/