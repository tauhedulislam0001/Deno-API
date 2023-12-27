import {create,getNumericDate,verify} from "https://deno.land/x/djwt@v2.4/mod.ts";
import type { Header, Payload } from "https://deno.land/x/djwt@v2.4/mod.ts";
import { config as dotenvConfig } from "https://deno.land/x/dotenv@v3.2.0/mod.ts";
import { convertToCryptoKey } from "../helper/convertCryptoKey.ts";
  
export const ACCESS_TOKEN_EXPIRES_IN = 15;
export const REFRESH_TOKEN_EXPIRES_IN = 60;
  
  
dotenvConfig({ export: true, path: ".env", safe: true });

export const signJwt = async ({
    user_id,
    issuer,
    privateKeyPem,
    expiresIn,
}: {
    user_id: string;
    issuer: string;
    privateKeyPem: "ACCESS_TOKEN_PRIVATE_KEY" | "REFRESH_TOKEN_PRIVATE_KEY";
    expiresIn: Date;
}) => {
const header: Header = {
    alg: "RS256",
    typ: "JWT",
};

const nowInSeconds = Math.floor(Date.now() / 1000);
const tokenExpiresIn = getNumericDate(expiresIn);

const payload: Payload = {
    iss: issuer,
    iat: nowInSeconds,
    exp: tokenExpiresIn,
    sub: user_id,
};

const crytoPrivateKey = await convertToCryptoKey({
    pemKey: atob(Deno.env.get(privateKeyPem) as unknown as string),
    type: "PRIVATE",
});

const token = await create(header, payload, crytoPrivateKey!);
    return { token };
};
export const verifyJwt = async <T>({
        token,
        publicKeyPem,
    }: {
        token: string;
        publicKeyPem: "ACCESS_TOKEN_PUBLIC_KEY" | "REFRESH_TOKEN_PUBLIC_KEY";
    }): Promise<T | null> => {
    try {
        const crytoPublicKey = await convertToCryptoKey({
        pemKey: atob(Deno.env.get(publicKeyPem) as unknown as string),
        type: "PUBLIC",
        });

        return (await verify(token, crytoPublicKey!)) as T;
    } catch (error) {
        console.log(error);
        return null;
    }
};