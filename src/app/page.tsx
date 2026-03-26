import { redirect } from "next/navigation";
import { auth } from "@/modules/auth/auth";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/documents");
  }

  redirect("/login");
}
