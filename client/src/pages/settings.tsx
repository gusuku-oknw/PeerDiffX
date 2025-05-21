import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FaCog, FaUser, FaGlobe, FaPalette, FaBell } from "react-icons/fa";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function SettingsPage() {
  const { user, isLoading: isLoadingUser } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");
  
  // UI設定 (実際のAPIエンドポイントはまだないので、フロントエンドでのみ状態管理)
  const [settings, setSettings] = useState({
    darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
    language: "ja",
    notifications: {
      emailUpdates: true,
      collaborationInvites: true,
      commentNotifications: true
    },
    appearance: {
      compactView: false,
      animationsEnabled: true,
      highContrastMode: false
    },
    presentation: {
      defaultAspectRatio: '16:9', // デフォルトのアスペクト比
      defaultZoomLevel: 100      // デフォルトのズームレベル
    }
  });

  // 設定変更のミューテーション (現在はAPIエンドポイントがないため、モックしています)
  const { mutate: updateSettings, isPending } = useMutation({
    mutationFn: async (newSettings: any) => {
      // 実際のバックエンドが実装されるまでは単にクライアント側で状態を更新
      return new Promise(resolve => setTimeout(() => resolve(newSettings), 500));
    },
    onSuccess: (data) => {
      setSettings(data as any);
      toast({
        title: "設定を保存しました",
        description: "変更が正常に適用されました。",
      });
    },
    onError: (error) => {
      toast({
        title: "エラーが発生しました",
        description: "設定の保存中に問題が発生しました。もう一度お試しください。",
        variant: "destructive"
      });
    }
  });

  // 設定を保存
  const handleSave = () => {
    updateSettings(settings);
  };

  if (isLoadingUser) {
    return (
      <div className="container mx-auto py-10 animate-pulse">
        <div className="bg-gray-200 dark:bg-gray-700 h-10 w-40 mb-6 rounded"></div>
        <div className="grid gap-6">
          <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded"></div>
          <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex items-center mb-6">
        <FaCog className="mr-2 h-6 w-6 text-gray-700 dark:text-gray-300" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">設定</h1>
      </div>

      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <TabsTrigger value="general" className="flex items-center space-x-2">
            <FaCog className="h-4 w-4" />
            <span className="hidden md:inline">一般</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center space-x-2">
            <FaUser className="h-4 w-4" />
            <span className="hidden md:inline">アカウント</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center space-x-2">
            <FaPalette className="h-4 w-4" />
            <span className="hidden md:inline">外観</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <FaBell className="h-4 w-4" />
            <span className="hidden md:inline">通知</span>
          </TabsTrigger>
          <TabsTrigger value="language" className="flex items-center space-x-2">
            <FaGlobe className="h-4 w-4" />
            <span className="hidden md:inline">言語</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>一般設定</CardTitle>
              <CardDescription>
                アプリケーションの基本的な設定を管理します。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">オートセーブ</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    変更を自動的に保存します
                  </p>
                </div>
                <Switch 
                  checked={settings.appearance.animationsEnabled}
                  onCheckedChange={(checked) => 
                    setSettings({
                      ...settings,
                      appearance: {
                        ...settings.appearance,
                        animationsEnabled: checked
                      }
                    })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">バージョン履歴</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    すべての変更の履歴を保存する期間
                  </p>
                </div>
                <Select defaultValue="30">
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="30日間" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7日間</SelectItem>
                    <SelectItem value="30">30日間</SelectItem>
                    <SelectItem value="90">90日間</SelectItem>
                    <SelectItem value="365">1年間</SelectItem>
                    <SelectItem value="unlimited">無制限</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isPending}>
                {isPending ? "保存中..." : "設定を保存"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>アカウント情報</CardTitle>
              <CardDescription>
                プロフィールとアカウント設定を管理します。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">名前</Label>
                <Input id="name" value={user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "ユーザー"} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input id="email" value={user?.email || "example@mail.com"} readOnly />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>外観設定</CardTitle>
              <CardDescription>
                アプリケーションの表示方法をカスタマイズします。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">ダークモード</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ダークカラーテーマを使用します
                  </p>
                </div>
                <Switch 
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => {
                    setSettings({...settings, darkMode: checked});
                    // UIのダークモードを切り替える
                    document.documentElement.classList.toggle('dark', checked);
                  }}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">コンパクトビュー</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    UI要素間の余白を減らします
                  </p>
                </div>
                <Switch 
                  checked={settings.appearance.compactView}
                  onCheckedChange={(checked) => 
                    setSettings({
                      ...settings,
                      appearance: {
                        ...settings.appearance,
                        compactView: checked
                      }
                    })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">ハイコントラストモード</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    視認性を高めるためにコントラストを強くします
                  </p>
                </div>
                <Switch 
                  checked={settings.appearance.highContrastMode}
                  onCheckedChange={(checked) => 
                    setSettings({
                      ...settings,
                      appearance: {
                        ...settings.appearance,
                        highContrastMode: checked
                      }
                    })
                  }
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isPending}>
                {isPending ? "保存中..." : "設定を保存"}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>プレゼンテーション設定</CardTitle>
              <CardDescription>
                スライド表示に関する設定を管理します。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="aspectRatio">デフォルトのアスペクト比</Label>
                <Select 
                  value={settings.presentation.defaultAspectRatio}
                  onValueChange={(value) => 
                    setSettings({
                      ...settings,
                      presentation: {
                        ...settings.presentation,
                        defaultAspectRatio: value
                      }
                    })
                  }
                >
                  <SelectTrigger id="aspectRatio">
                    <SelectValue placeholder="アスペクト比を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16:9">ワイドスクリーン (16:9)</SelectItem>
                    <SelectItem value="4:3">スタンダード (4:3)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  プレゼンテーション表示時のデフォルトアスペクト比を設定します
                </p>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="zoomLevel">デフォルトのズームレベル</Label>
                <div className="flex items-center space-x-2">
                  <Input 
                    id="zoomLevel" 
                    type="number" 
                    min="50" 
                    max="200" 
                    value={settings.presentation.defaultZoomLevel}
                    className="w-24"
                    onChange={(e) => 
                      setSettings({
                        ...settings,
                        presentation: {
                          ...settings.presentation,
                          defaultZoomLevel: parseInt(e.target.value, 10) || 100
                        }
                      })
                    }
                  />
                  <span>%</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  スライド表示時の初期ズームレベルを設定します (50%〜200%)
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isPending}>
                {isPending ? "保存中..." : "設定を保存"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>通知設定</CardTitle>
              <CardDescription>
                通知の受け取り方を管理します。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">メールでの更新通知</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    プレゼンテーションの更新時にメールで通知を受け取ります
                  </p>
                </div>
                <Switch 
                  checked={settings.notifications.emailUpdates}
                  onCheckedChange={(checked) => 
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        emailUpdates: checked
                      }
                    })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">コラボレーション招待</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    共同編集への招待通知を受け取ります
                  </p>
                </div>
                <Switch 
                  checked={settings.notifications.collaborationInvites}
                  onCheckedChange={(checked) => 
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        collaborationInvites: checked
                      }
                    })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">コメント通知</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    新しいコメントが追加されたときに通知を受け取ります
                  </p>
                </div>
                <Switch 
                  checked={settings.notifications.commentNotifications}
                  onCheckedChange={(checked) => 
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        commentNotifications: checked
                      }
                    })
                  }
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isPending}>
                {isPending ? "保存中..." : "設定を保存"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="language" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>言語設定</CardTitle>
              <CardDescription>
                表示言語を選択します。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">表示言語</Label>
                <Select 
                  value={settings.language}
                  onValueChange={(value) => setSettings({...settings, language: value})}
                >
                  <SelectTrigger id="language">
                    <SelectValue placeholder="言語を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ja">日本語</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="zh">中文</SelectItem>
                    <SelectItem value="ko">한국어</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isPending}>
                {isPending ? "保存中..." : "設定を保存"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}