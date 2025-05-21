import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Signup() {
  const { toast } = useToast();

  const handleSignup = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">アカウント作成</CardTitle>
          <CardDescription>
            PeerDiffXへようこそ！アカウントを作成して始めましょう
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Button onClick={handleSignup} className="w-full">
              Replitで登録
            </Button>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">すでにアカウントをお持ちの方</span>
            </div>
          </div>
          <div className="grid gap-2">
            <Link href="/login">
              <Button variant="outline" className="w-full">
                ログイン
              </Button>
            </Link>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="mt-2 text-xs text-center text-gray-700">
            登録することで、
            <Link href="/terms" className="underline">
              利用規約
            </Link>
            と
            <Link href="/privacy" className="underline">
              プライバシーポリシー
            </Link>
            に同意したことになります。
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}