import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { SignOutButton } from "@clerk/nextjs";
import type { UserProfile } from "@spotify/web-api-ts-sdk";
import { LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";

export interface UserHeaderProps {
	user: UserProfile;
}

export const UserHeader = ({ user }: UserHeaderProps) => {
	const { theme, setTheme } = useTheme();
	const initials = user.display_name
		?.split(" ")
		.map((n) => n[0])
		.join("");

	return (
		<Card className="flex flex-row items-center gap-3 mb-4 p-2">
			<Avatar className="h-10 w-10">
				{user.images?.[0]?.url && (
					<AvatarImage
						src={user.images[0].url}
						alt={user.display_name || "User"}
					/>
				)}
				<AvatarFallback>{initials || "U"}</AvatarFallback>
			</Avatar>

			<div>
				<h1 className="text-lg font-bold">{user.display_name}</h1>
				<p className="text-xs text-muted-foreground">
					{user.followers?.total || 0} followers
				</p>
			</div>

			<SignOutButton>
				<Button variant="outline" className="">
					Sign out
					<LogOut />
				</Button>
			</SignOutButton>

			<div className="flex-1" />

			<Button
				variant="outline"
				size="icon"
				onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
			>
				{theme === "dark" ? <Sun /> : <Moon />}
			</Button>
		</Card>
	);
};
