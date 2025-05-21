import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Profile() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    navigate("/login");
    return null;
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "??";
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`;
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">プロフィール</h1>

      <div className="grid gap-6 md:grid-cols-[1fr_3fr]">
        <div>
          <Card>
            <CardContent className="pt-6 flex flex-col items-center">
              {isLoading ? (
                <Skeleton className="h-24 w-24 rounded-full" />
              ) : (
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.profileImageUrl || ""} />
                  <AvatarFallback className="text-lg">
                    {getInitials(user?.firstName, user?.lastName)}
                  </AvatarFallback>
                </Avatar>
              )}

              <div className="mt-4 text-center">
                {isLoading ? (
                  <Skeleton className="h-7 w-32 mx-auto" />
                ) : (
                  <h2 className="text-xl font-semibold">
                    {user?.firstName} {user?.lastName}
                  </h2>
                )}

                {isLoading ? (
                  <Skeleton className="h-5 w-40 mt-1 mx-auto" />
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">{user?.email || "メールなし"}</p>
                )}
              </div>

              <Button
                variant="outline"
                className="mt-6 w-full"
                onClick={handleLogout}
              >
                ログアウト
              </Button>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>アカウント情報</CardTitle>
              <CardDescription>
                あなたのアカウント詳細とプリファレンスです
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">ユーザーID</h3>
                {isLoading ? (
                  <Skeleton className="h-5 w-40 mt-1" />
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">{user?.id || "不明"}</p>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium">アカウント作成日</h3>
                {isLoading ? (
                  <Skeleton className="h-5 w-40 mt-1" />
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("ja-JP")
                      : "不明"}
                  </p>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium">最終ログイン</h3>
                {isLoading ? (
                  <Skeleton className="h-5 w-40 mt-1" />
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    {user?.lastLogin
                      ? new Date(user.lastLogin).toLocaleString("ja-JP")
                      : "不明"}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}