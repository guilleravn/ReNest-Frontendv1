import "server-only";
import { cookies } from "next/headers";
import { z } from "zod";

/** One-time message carried across a redirect (e.g. "account created" after sign-up). */
const FLASH_COOKIE = "renest_flash";
const FLASH_MAX_AGE_SECONDS = 60;
const flashMessageSchema = z.string().trim().min(1).max(200);

/** Stores a message for the next page. Server Action/Route Handler only. */
export async function setFlash(message: string): Promise<void> {
  (await cookies()).set(FLASH_COOKIE, message, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: FLASH_MAX_AGE_SECONDS,
  });
}

/**
 * The pending flash message, or `null`. Read-only: Server Components can't delete cookies,
 * so the component that shows it clears it with `clearFlashAction` once mounted.
 */
export async function readFlash(): Promise<string | null> {
  const result = flashMessageSchema.safeParse((await cookies()).get(FLASH_COOKIE)?.value);
  return result.success ? result.data : null;
}

/** Deletes the flash cookie. Server Action/Route Handler only. */
export async function clearFlash(): Promise<void> {
  (await cookies()).delete(FLASH_COOKIE);
}
