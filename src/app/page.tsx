import { redirect } from "next/navigation";

/** The feed is the home screen; `/` only forwards to it. */
export default function HomePage() {
  redirect("/feed");
}
