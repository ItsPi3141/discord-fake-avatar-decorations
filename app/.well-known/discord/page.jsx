import { redirect } from "next/navigation";
export default async function RedirectDiscord() {
	redirect("/.well-known/discord/index.html");
}
