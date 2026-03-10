import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";

export async function requireAdminPageSession() {
  const session = await getServerSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/admin/login");
  }

  return session;
}
