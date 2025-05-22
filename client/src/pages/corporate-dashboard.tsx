import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, Users, MessageSquare, TrendingUp, Calendar, 
  BarChart3, Settings, CreditCard, FileText, Eye, Brain 
} from "lucide-react";
import { Link, useLocation } from "wouter";

interface ProjectStats {
  id: number;
  name: string;
  companyName: string;
  progress: number;
  unreadComments: number;
  totalStudents: number;
  dueDate: string;
  status: string;
  aiSummary: string;
}

interface Subscription {
  planType: string;
  reviewQuotaUsed: number;
  reviewQuotaLimit: number;
  nextBillingDate: string;
  isActive: boolean;
}

export default function CorporateDashboard() {
  const [, setLocation] = useLocation();

  // プロジェクト統計情報を取得
  const { data: projects = [], isLoading: projectsLoading } = useQuery<ProjectStats[]>({
    queryKey: ["/api/corporate/projects"],
  });

  // サブスクリプション情報を取得
  const { data: subscription } = useQuery<Subscription>({
    queryKey: ["/api/corporate/subscription"],
  });

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "premium": return "bg-purple-100 text-purple-800";
      case "standard": return "bg-blue-100 text-blue-800";
      case "light": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPlanName = (plan: string) => {
    switch (plan) {
      case "premium": return "プレミアム";
      case "standard": return "スタンダード";
      case "light": return "ライト";
      default: return plan;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "active": return "bg-blue-100 text-blue-800";
      case "draft": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed": return "完了";
      case "active": return "進行中";
      case "draft": return "下書き";
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">企業ダッシュボード</h1>
          <p className="text-gray-600">プロジェクト管理とレビュー進捗を一元管理できます</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">概要</TabsTrigger>
            <TabsTrigger value="projects">プロジェクト管理</TabsTrigger>
            <TabsTrigger value="analytics">AI分析レポート</TabsTrigger>
            <TabsTrigger value="subscription">サブスクリプション</TabsTrigger>
          </TabsList>

          {/* 概要タブ */}
          <TabsContent value="overview" className="space-y-6">
            {/* サマリーカード */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">総プロジェクト数</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{projects.length}</div>
                  <p className="text-xs text-muted-foreground">+2 先月比</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">未読コメント</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {projects.reduce((sum, p) => sum + p.unreadComments, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">新着あり</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">参加学生数</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {projects.reduce((sum, p) => sum + p.totalStudents, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">アクティブ</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">平均進捗率</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length) : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">順調に進行中</p>
                </CardContent>
              </Card>
            </div>

            {/* 最近のプロジェクト */}
            <Card>
              <CardHeader>
                <CardTitle>最近のプロジェクト</CardTitle>
                <CardDescription>進行中のプロジェクトの概要です</CardDescription>
              </CardHeader>
              <CardContent>
                {projectsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects.slice(0, 3).map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium">{project.name}</h3>
                          <p className="text-sm text-gray-500">{project.companyName}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1">
                              <Progress value={project.progress} className="w-20 h-2" />
                              <span className="text-xs text-gray-500">{project.progress}%</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {project.unreadComments} 新着コメント
                            </Badge>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          詳細
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* プロジェクト管理タブ */}
          <TabsContent value="projects" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">プロジェクト管理</h2>
              <Button onClick={() => setLocation("/corporate/upload")} className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                新しいPPTXをアップロード
              </Button>
            </div>

            <Card>
              <CardContent className="pt-6">
                {projects.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>まだプロジェクトがありません</p>
                    <p className="text-sm">PPTXファイルをアップロードして新しいプロジェクトを開始しましょう</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <div key={project.id} className="border rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {project.name}
                            </h3>
                            <p className="text-gray-600 mb-2">{project.companyName}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                期限: {new Date(project.dueDate).toLocaleDateString('ja-JP')}
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                学生: {project.totalStudents}名
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="h-4 w-4" />
                                未読: {project.unreadComments}件
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(project.status)}>
                              {getStatusText(project.status)}
                            </Badge>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">進捗状況</span>
                            <span className="text-sm font-medium">{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} className="h-2" />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => setLocation(`/corporate/project/${project.id}/diff`)}
                            className="flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            差分プレビュー
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setLocation(`/corporate/project/${project.id}/comments`)}
                            className="flex items-center gap-2"
                          >
                            <MessageSquare className="h-4 w-4" />
                            コメント管理
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setLocation(`/corporate/project/${project.id}/ai-report`)}
                            className="flex items-center gap-2"
                          >
                            <Brain className="h-4 w-4" />
                            AI要約レポート
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI分析レポートタブ */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold">AI分析レポート</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    コメント要約
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium mb-2">主要なフィードバック</h4>
                      <p className="text-sm text-gray-700">
                        • デザインの統一性向上の提案が多数<br/>
                        • フォントサイズの調整要望<br/>
                        • 色彩バランスの改善提案
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    感情分析
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">肯定的</span>
                      <span className="text-sm font-medium">68%</span>
                    </div>
                    <Progress value={68} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">中立</span>
                      <span className="text-sm font-medium">22%</span>
                    </div>
                    <Progress value={22} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">改善提案</span>
                      <span className="text-sm font-medium">10%</span>
                    </div>
                    <Progress value={10} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* サブスクリプションタブ */}
          <TabsContent value="subscription" className="space-y-6">
            <h2 className="text-2xl font-bold">サブスクリプション管理</h2>
            
            {subscription && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      プラン情報
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>現在のプラン</span>
                      <Badge className={getPlanColor(subscription.planType)}>
                        {getPlanName(subscription.planType)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>次回請求日</span>
                      <span className="font-medium">
                        {new Date(subscription.nextBillingDate).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>ステータス</span>
                      <Badge variant={subscription.isActive ? "default" : "destructive"}>
                        {subscription.isActive ? "アクティブ" : "停止中"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      レビュー枠使用状況
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>使用済み / 上限</span>
                      <span className="font-medium">
                        {subscription.reviewQuotaUsed} / {subscription.reviewQuotaLimit}
                      </span>
                    </div>
                    
                    <Progress 
                      value={(subscription.reviewQuotaUsed / subscription.reviewQuotaLimit) * 100} 
                      className="h-2" 
                    />
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        追加枠購入
                      </Button>
                      <Button variant="outline" size="sm">
                        プラン変更
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}