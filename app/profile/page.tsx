import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { verifyToken } from "@/lib/auth";
import ProfileSettings from "../components/ProfileSettings";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("synapse_token")?.value;

  if (!token) {
    redirect("/login");
  }

  const payload = verifyToken(token);
  if (!payload) {
    redirect("/login");
  }

  return <ProfileSettings />;
}
