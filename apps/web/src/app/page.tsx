import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();
  if (userId) {
    return redirect("/app");
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold text-white">musejump</h1>
      <p className="text-lg text-white">skip and loop the good bits</p>
      <SignInButton mode="modal" />
    </div>
  );
}
