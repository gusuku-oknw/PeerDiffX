import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, CheckCircle, Clock, MessageSquare, Star, Trophy, Download } from "lucide-react";
import { Link, useLocation } from "wouter";

interface StudentProject {
  id: number;
  name: string;
  companyName: string;
  dueDate: string;
  status: string;
  commentCount: number;
}

interface StudentProfile {
  rank: string;
  totalComments: number;
  approvedComments: number;
  approvalRate: number;
  bonusProgress: number;
}

export default function StudentDashboard() {
  const [, setLocation] = useLocation();

  // 仮データで表示（バックエンド連携は後回し）
  const projects: StudentProject[] = [
    {
      id: 1,
      name: "デジタルマーケティング戦略レビュー",
      companyName: "TechCorp株式会社",
      dueDate: "2025-02-15T23:59:59Z",
      status: "in_progress",
      commentCount: 3
    },
    {
      id: 2,
      name: "新商品プレゼンテーション分析",
      companyName: "Innovation Inc.",
      dueDate: "2025-02-28T23:59:59Z", 
      status: "assigned",
      commentCount: 0
    }
  ];
  const projectsLoading = false;

  // 学生プロフィール仮データ
  const profile: StudentProfile = {
    rank: "silver",
    totalComments: 45,
    approvedComments: 38,
    approvalRate: 84,
    bonusProgress: 75
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case "gold": return "text-yellow-600 bg-yellow-100";
      case "silver": return "text-gray-600 bg-gray-100";
      case "bronze": return "text-amber-600 bg-amber-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getRankIcon = (rank: string) => {
    switch (rank) {
      case "gold": return <Trophy className="h-5 w-5 text-yellow-600" />;
      case "silver": return <Star className="h-5 w-5 text-gray-600" />;
      case "bronze": return <Trophy className="h-5 w-5 text-amber-600" />;
      default: return <Star className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "assigned": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed": return "完了";
      case "in_progress": return "進行中";
      case "assigned": return "割り当て済み";
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">学生ダッシュボード</h1>
          <p className="text-gray-600">あなたのプロジェクトとレビュー進捗を確認できます</p>
        </div>

        {/* プロフィールカード */}
        {profile && (
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getRankIcon(profile.rank)}
                プロフィール
                <Badge className={`ml-2 ${getRankColor(profile.rank)}`}>
                  {profile.rank.toUpperCase()}ランク
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{profile.totalComments}</div>
                  <div className="text-sm text-gray-600">総コメント数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{profile.approvedComments}</div>
                  <div className="text-sm text-gray-600">承認されたコメント</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{profile.approvalRate}%</div>
                  <div className="text-sm text-gray-600">承認率</div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">ボーナス進捗</span>
                    <span className="text-sm font-medium">{profile.bonusProgress}%</span>
                  </div>
                  <Progress value={profile.bonusProgress} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* プロジェクト一覧 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              割り当てられたプロジェクト
            </CardTitle>
            <CardDescription>
              レビューが必要なプレゼンテーションプロジェクトの一覧です
            </CardDescription>
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
            ) : projects.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>現在割り当てられているプロジェクトはありません</p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
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
                            <MessageSquare className="h-4 w-4" />
                            コメント: {project.commentCount}件
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(project.status)}>
                          {getStatusText(project.status)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setLocation(`/student/project/${project.id}`)}
                        className="flex items-center gap-2"
                      >
                        <MessageSquare className="h-4 w-4" />
                        レビューを開始
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        PPTX ダウンロード
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 最近のアクティビティ */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              最近のアクティビティ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">コメントが承認されました</p>
                  <p className="text-xs text-gray-500">デジタルマーケティング戦略レビュー - 2時間前</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">新しいコメントを投稿しました</p>
                  <p className="text-xs text-gray-500">デジタルマーケティング戦略レビュー - 1日前</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}