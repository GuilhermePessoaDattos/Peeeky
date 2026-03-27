import { redirect } from "next/navigation";
import { auth } from "@/modules/auth/auth";
import { LandingPage } from "./(marketing)/landing";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/documents");
  }

  return <LandingPage />;
}
