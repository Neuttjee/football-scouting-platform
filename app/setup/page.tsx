import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import TwoFactorSetupClient from "@/components/account/TwoFactorSetupClient";

export default async function SetupPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return <TwoFactorSetupClient role={session.user.role} />;
}

