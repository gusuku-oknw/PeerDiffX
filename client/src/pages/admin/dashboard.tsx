import React, { useState } from 'react';
import { Link } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TopReviewerPanel } from "@/components/rewards/top-reviewer-panel";
import {
  FaTachometerAlt,
  FaUsers,
  FaFileAlt,
  FaChartLine,
  FaCog,
  FaSignOutAlt,
  FaTrophy,
  FaUsersCog,
  FaDatabase,
  FaFileInvoiceDollar
} from "react-icons/fa";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* サイドバー */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-md">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <FaFileAlt className="text-blue-600 dark:text-blue-400" />
            <h1 className="text-xl font-bold">PeerDiffX</h1>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">管理ダッシュボード</div>
        </div>
        
        <nav className="mt-4">
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
            一般
          </div>
          <Link href="/admin/dashboard">
            <a className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border-r-4 border-blue-500">
              <FaTachometerAlt className="text-blue-500" />
              <span>ダッシュボード</span>
            </a>
          </Link>
          <Link href="/admin/users">
            <a className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <FaUsers />
              <span>ユーザー管理</span>
            </a>
          </Link>
          <Link href="/admin/presentations">
            <a className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <FaFileAlt />
              <span>プレゼンテーション</span>
            </a>
          </Link>
          
          <div className="px-4 py-2 mt-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
            分析と報告
          </div>
          <Link href="/admin/statistics">
            <a className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <FaChartLine />
              <span>使用統計</span>
            </a>
          </Link>
          <Link href="/admin/rewards">
            <a className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <FaTrophy />
              <span>優秀者ボーナス</span>
            </a>
          </Link>
          <Link href="/admin/billing">
            <a className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <FaFileInvoiceDollar />
              <span>請求情報</span>
            </a>
          </Link>
          
          <div className="px-4 py-2 mt-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
            システム
          </div>
          <Link href="/admin/roles">
            <a className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <FaUsersCog />
              <span>ロール管理</span>
            </a>
          </Link>
          <Link href="/admin/storage">
            <a className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <FaDatabase />
              <span>ストレージ</span>
            </a>
          </Link>
          <Link href="/admin/settings">
            <a className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <FaCog />
              <span>設定</span>
            </a>
          </Link>
        </nav>
        
        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="ghost" className="w-full justify-start text-gray-700 dark:text-gray-300">
            <FaSignOutAlt className="mr-2" />
            ログアウト
          </Button>
        </div>
      </div>
      
      {/* メインコンテンツ */}
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">管理ダッシュボード</h1>
            <p className="text-gray-500 dark:text-gray-400">システム全体の状態と主要な機能を管理</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <FaFileAlt className="mr-2 h-4 w-4" />
              レポート作成
            </Button>
            <Button size="sm">
              <FaCog className="mr-2 h-4 w-4" />
              設定
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="overview">
              <FaTachometerAlt className="mr-2 h-4 w-4" />
              <span>概要</span>
            </TabsTrigger>
            <TabsTrigger value="users">
              <FaUsers className="mr-2 h-4 w-4" />
              <span>ユーザー</span>
            </TabsTrigger>
            <TabsTrigger value="rewards">
              <FaTrophy className="mr-2 h-4 w-4" />
              <span>優秀者ボーナス</span>
            </TabsTrigger>
            <TabsTrigger value="storage">
              <FaDatabase className="mr-2 h-4 w-4" />
              <span>ストレージ</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">総ユーザー数</p>
                      <h3 className="text-3xl font-bold mt-1">1,254</h3>
                    </div>
                    <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                      <FaUsers className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center text-green-600 dark:text-green-400 text-sm">
                      <span>+5.2%</span>
                      <span className="text-gray-500 dark:text-gray-400 ml-2">先月比</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">プレゼンテーション数</p>
                      <h3 className="text-3xl font-bold mt-1">3,879</h3>
                    </div>
                    <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-full">
                      <FaFileAlt className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center text-green-600 dark:text-green-400 text-sm">
                      <span>+12.8%</span>
                      <span className="text-gray-500 dark:text-gray-400 ml-2">先月比</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">ストレージ使用量</p>
                      <h3 className="text-3xl font-bold mt-1">175.4 GB</h3>
                    </div>
                    <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                      <FaDatabase className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center text-amber-600 dark:text-amber-400 text-sm">
                      <span>75.2%</span>
                      <span className="text-gray-500 dark:text-gray-400 ml-2">使用中</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>優秀レビュアー概要</CardTitle>
                <CardDescription>上位の学生レビュアーとボーナス状況</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    詳細情報を確認するには「優秀者ボーナス」タブを選択してください
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setActiveTab("rewards")}
                  >
                    <FaTrophy className="mr-2 h-4 w-4" />
                    ボーナス管理画面を表示
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>ユーザー管理</CardTitle>
                <CardDescription>
                  システム全体のユーザーアカウントを管理します
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="text-center p-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    ユーザー管理機能は現在開発中です
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="rewards">
            <TopReviewerPanel />
          </TabsContent>
          
          <TabsContent value="storage">
            <StorageUsagePanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}