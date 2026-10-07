"use server";

import { clearFlash } from "./flash";

/** Marks the flash message as shown, so a reload or a later navigation doesn't repeat it. */
export async function clearFlashAction(): Promise<void> {
  await clearFlash();
}
