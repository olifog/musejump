import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
	const { userId } = await auth();
	if (userId) {
		return redirect("/app");
	}

	return (
		<div className="flex flex-col items-center justify-center min-h-screen">
			<h1 className="text-4xl font-bold text-foreground">musejump</h1>
			<p className="text-lg text-foreground">skip and loop the good bits</p>
			<Button asChild className="mt-4">
				<SignInButton mode="modal" />
			</Button>
		</div>
	);
}
