import Image from "next/image";
import { UserProfile } from "@spotify/web-api-ts-sdk";

export interface UserHeaderProps {
  user: UserProfile;
}

export const UserHeader = ({ user }: UserHeaderProps) => {
  return (
    <div className="flex items-center gap-3 mb-4 p-2 bg-gray-800 rounded-lg">
      {user.images && user.images[0]?.url && (
        <div className="relative h-10 w-10 rounded-full overflow-hidden">
          <Image
            src={user.images[0].url}
            alt={user.display_name || "User"}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div>
        <h1 className="text-lg font-bold">{user.display_name}</h1>
        <p className="text-xs text-gray-400">
          {user.followers?.total || 0} followers
        </p>
      </div>
    </div>
  );
};
