import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/");
  }

  redirect("/api/auth/signin/spotify");
}
