import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
import { LogOut, Settings, User } from "lucide-react";

export function AuthButtons() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const handleLogin = () => {
    setIsAuthLoading(true);
    window.location.href = "/api/login";
  };

  const handleLogout = () => {
    setIsAuthLoading(true);
    window.location.href = "/api/logout";
  };

  if (isLoading) {
    return <Button variant="ghost" size="sm" disabled>読み込み中...</Button>;
  }

  if (isAuthenticated) {
    // Get user initials for avatar fallback
    const getInitials = () => {
      if (user?.firstName && user?.lastName) {
        return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
      } else if (user?.username) {
        return user.username.charAt(0).toUpperCase();
      }
      return 'U';
    };

    // Get display name
    const getDisplayName = () => {
      if (user?.firstName && user?.lastName) {
        return `${user.firstName} ${user.lastName}`;
      } else if (user?.username) {
        return user.username;
      }
      return 'User';
    };
    
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.profileImageUrl || ""} alt="プロフィール" />
              <AvatarFallback>
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {getDisplayName()}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email || ''}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <Link href="/profile">
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>プロフィール</span>
            </DropdownMenuItem>
          </Link>
          <Link href="/settings">
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>設定</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>ログアウト</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/signup">
        <Button variant="ghost" size="sm" disabled={isAuthLoading}>
          サインアップ
        </Button>
      </Link>
      <Button 
        variant="default" 
        size="sm"
        disabled={isAuthLoading}
        onClick={handleLogin}
      >
        {isAuthLoading ? "読み込み中..." : "ログイン"}
      </Button>
    </div>
  );
}