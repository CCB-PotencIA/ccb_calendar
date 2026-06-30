import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-base",
};

export function UserAvatar({ name, avatarUrl, size = "md" }: UserAvatarProps) {
  return (
    <Avatar className={cn(sizeClasses[size])}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
      <AvatarFallback
        className="bg-[#004c9e] text-white font-semibold"
        style={{ fontSize: size === "sm" ? "0.625rem" : size === "md" ? "0.75rem" : "0.875rem" }}
      >
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
