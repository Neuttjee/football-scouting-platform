import { redirect } from "next/navigation";

export default function InternalPlayersRedirect() {
  redirect("/players?view=internal");
}