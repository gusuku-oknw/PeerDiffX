import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FaTrophy, 
  FaMedal, 
  FaCoins, 
  FaChartLine, 
  FaUserGraduate, 
  FaFileInvoiceDollar,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle
} from "react-icons/fa";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// 優秀レビュアーのデータ型
interface TopReviewer {
  id: number;
  name: string;
  avatarUrl: string;
  email: string;
  score: number;
  totalReviews: number;
  qualityScore: number;
  bonusAmount: number;
  bonusStatus: 'paid' | 'pending' | 'processing';
  lastPaymentDate?: string;
  university: string;
  department: string;
  rank: number;
}

// 月別ボーナス統計の型
interface MonthlyStats {
  month: string;
  totalPaid: number;
  totalReviewers: number;
  averageBonus: number;
}

export function TopReviewerPanel() {
  const [selectedMonth, setSelectedMonth] = useState("2025-05");
  const [activeTab, setActiveTab] = useState("reviewers");
  
  // 優秀レビュアーのサンプルデータ
  const topReviewers: TopReviewer[] = [
    {
      id: 1,
      name: "山田 優太",
      avatarUrl: "",
      email: "yuta.yamada@edu.example.ac.jp",
      score: 97,
      totalReviews: 45,
      qualityScore: 9.8,
      bonusAmount: 15000,
      bonusStatus: 'paid',
      lastPaymentDate: '2025-04-15',
      university: "東京大学",
      department: "工学部",
      rank: 1
    },
    {
      id: 2,
      name: "佐藤 美咲",
      avatarUrl: "",
      email: "misaki.sato@edu.example.ac.jp",
      score: 94,
      totalReviews: 38,
      qualityScore: 9.7,
      bonusAmount: 12000,
      bonusStatus: 'paid',
      lastPaymentDate: '2025-04-15',
      university: "京都大学",
      department: "経済学部",
      rank: 2
    },
    {
      id: 3,
      name: "鈴木 健太",
      avatarUrl: "",
      email: "kenta.suzuki@edu.example.ac.jp",
      score: 92,
      totalReviews: 41,
      qualityScore: 9.4,
      bonusAmount: 10000,
      bonusStatus: 'processing',
      university: "大阪大学",
      department: "法学部",
      rank: 3
    },
    {
      id: 4,
      name: "高橋 直樹",
      avatarUrl: "",
      email: "naoki.takahashi@edu.example.ac.jp",
      score: 89,
      totalReviews: 36,
      qualityScore: 9.2,
      bonusAmount: 8000,
      bonusStatus: 'pending',
      university: "名古屋大学",
      department: "情報学部",
      rank: 4
    },
    {
      id: 5,
      name: "田中 さくら",
      avatarUrl: "",
      email: "sakura.tanaka@edu.example.ac.jp",
      score: 87,
      totalReviews: 33,
      qualityScore: 9.0,
      bonusAmount: 7000,
      bonusStatus: 'pending',
      university: "早稲田大学",
      department: "国際教養学部",
      rank: 5
    }
  ];
  
  // 月別ボーナス統計のサンプルデータ
  const monthlyStats: MonthlyStats[] = [
    { month: "2025-05", totalPaid: 52000, totalReviewers: 5, averageBonus: 10400 },
    { month: "2025-04", totalPaid: 48000, totalReviewers: 5, averageBonus: 9600 },
    { month: "2025-03", totalPaid: 45000, totalReviewers: 4, averageBonus: 11250 },
    { month: "2025-02", totalPaid: 40000, totalReviewers: 4, averageBonus: 10000 },
    { month: "2025-01", totalPaid: 38000, totalReviewers: 4, averageBonus: 9500 }
  ];
  
  // ボーナスステータスに応じたバッジを表示
  const renderBonusStatus = (status: 'paid' | 'pending' | 'processing') => {
    switch (status) {
      case 'paid':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 flex items-center gap-1">
            <FaCheckCircle className="h-3 w-3" />
            <span>支払済</span>
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 flex items-center gap-1">
            <FaClock className="h-3 w-3" />
            <span>処理中</span>
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800 flex items-center gap-1">
            <FaExclamationCircle className="h-3 w-3" />
            <span>未処理</span>
          </Badge>
        );
    }
  };
  
  // ランクに応じたアイコンを表示
  const renderRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <FaTrophy className="text-yellow-500" />;
      case 2:
        return <FaMedal className="text-gray-400" />;
      case 3:
        return <FaMedal className="text-amber-700" />;
      default:
        return null;
    }
  };
  
  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-gradient-to-r from-amber-600 to-yellow-500 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FaTrophy className="mr-2 h-6 w-6" />
            <CardTitle>優秀レビュアーボーナス管理</CardTitle>
          </div>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px] bg-white/10 text-white border-amber-400">
              <SelectValue placeholder="期間を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025-05">2025年5月</SelectItem>
              <SelectItem value="2025-04">2025年4月</SelectItem>
              <SelectItem value="2025-03">2025年3月</SelectItem>
              <SelectItem value="2025-02">2025年2月</SelectItem>
              <SelectItem value="2025-01">2025年1月</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CardDescription className="text-amber-100">
          トップクラスの学生レビュアーへのボーナス管理・支払い状況
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs defaultValue="reviewers" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full rounded-none grid grid-cols-3">
            <TabsTrigger value="reviewers" className="rounded-none">
              <FaUserGraduate className="mr-2 h-4 w-4" />
              <span>レビュアー一覧</span>
            </TabsTrigger>
            <TabsTrigger value="statistics" className="rounded-none">
              <FaChartLine className="mr-2 h-4 w-4" />
              <span>統計</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="rounded-none">
              <FaFileInvoiceDollar className="mr-2 h-4 w-4" />
              <span>支払い管理</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="reviewers" className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">順位</TableHead>
                  <TableHead>レビュアー</TableHead>
                  <TableHead className="text-center">スコア</TableHead>
                  <TableHead className="text-center">レビュー数</TableHead>
                  <TableHead className="text-right">ボーナス額</TableHead>
                  <TableHead className="text-center">ステータス</TableHead>
                  <TableHead className="text-right">アクション</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topReviewers.map((reviewer) => (
                  <TableRow key={reviewer.id}>
                    <TableCell className="text-center font-medium">
                      <div className="flex items-center justify-center">
                        {renderRankIcon(reviewer.rank)}
                        <span className="ml-1">{reviewer.rank}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src={reviewer.avatarUrl} alt={reviewer.name} />
                          <AvatarFallback className="bg-amber-100 text-amber-800">
                            {reviewer.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{reviewer.name}</div>
                          <div className="text-xs text-gray-500">{reviewer.university}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-semibold">{reviewer.score}</span>
                        <Progress value={reviewer.score} className="h-1.5 w-16" />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{reviewer.totalReviews}</TableCell>
                    <TableCell className="text-right font-medium">
                      ¥{reviewer.bonusAmount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      {renderBonusStatus(reviewer.bonusStatus)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={reviewer.bonusStatus === 'paid'}
                        className="h-8"
                      >
                        {reviewer.bonusStatus === 'paid' ? '支払済' : '支払う'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          
          <TabsContent value="statistics" className="p-6">
            <div className="grid grid-cols-3 gap-6 mb-8">
              <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium text-amber-800 dark:text-amber-400">総支払額</div>
                      <div className="text-3xl font-bold mt-1">¥{monthlyStats.find(s => s.month === selectedMonth)?.totalPaid.toLocaleString()}</div>
                    </div>
                    <div className="p-4 bg-amber-100 dark:bg-amber-800/40 rounded-full">
                      <FaCoins className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium text-amber-800 dark:text-amber-400">レビュアー数</div>
                      <div className="text-3xl font-bold mt-1">{monthlyStats.find(s => s.month === selectedMonth)?.totalReviewers}人</div>
                    </div>
                    <div className="p-4 bg-amber-100 dark:bg-amber-800/40 rounded-full">
                      <FaUserGraduate className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium text-amber-800 dark:text-amber-400">平均ボーナス</div>
                      <div className="text-3xl font-bold mt-1">¥{monthlyStats.find(s => s.month === selectedMonth)?.averageBonus.toLocaleString()}</div>
                    </div>
                    <div className="p-4 bg-amber-100 dark:bg-amber-800/40 rounded-full">
                      <FaChartLine className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="rounded-lg border bg-card dark:bg-card shadow-sm">
              <div className="p-6">
                <h3 className="text-lg font-medium mb-4">月別ボーナス支払い推移</h3>
                <div className="w-full h-64 flex items-end justify-between gap-4 pt-8">
                  {monthlyStats.map((stat, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className={`w-16 ${stat.month === selectedMonth ? 'bg-amber-500' : 'bg-amber-200 dark:bg-amber-700'} rounded-t-sm transition-all`}
                        style={{ height: `${(stat.totalPaid / 60000) * 100}%` }}
                      ></div>
                      <div className="text-xs mt-2 text-gray-600 dark:text-gray-400">
                        {stat.month.split('-')[0]}年{parseInt(stat.month.split('-')[1])}月
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="payments" className="p-6">
            <div className="flex justify-between mb-6">
              <div>
                <h3 className="text-lg font-medium">支払い処理</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">選択した学生へのボーナス支払いを管理</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">一括選択</Button>
                <Button className="bg-amber-600 hover:bg-amber-700">処理を開始</Button>
              </div>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">
                    <input type="checkbox" className="rounded" />
                  </TableHead>
                  <TableHead>レビュアー</TableHead>
                  <TableHead>大学</TableHead>
                  <TableHead>メールアドレス</TableHead>
                  <TableHead className="text-right">ボーナス額</TableHead>
                  <TableHead className="text-center">ステータス</TableHead>
                  <TableHead className="text-center">処理日</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topReviewers.filter(r => r.bonusStatus !== 'paid').map((reviewer) => (
                  <TableRow key={reviewer.id}>
                    <TableCell className="text-center">
                      <input type="checkbox" className="rounded" />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{reviewer.name}</div>
                    </TableCell>
                    <TableCell>{reviewer.university}</TableCell>
                    <TableCell>{reviewer.email}</TableCell>
                    <TableCell className="text-right font-medium">
                      ¥{reviewer.bonusAmount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      {renderBonusStatus(reviewer.bonusStatus)}
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-500">
                      {reviewer.bonusStatus === 'paid' ? reviewer.lastPaymentDate : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <h4 className="font-medium flex items-center text-amber-800 dark:text-amber-400">
                <FaExclamationCircle className="mr-2" />
                支払い処理の注意事項
              </h4>
              <ul className="mt-2 text-sm space-y-1 text-amber-700 dark:text-amber-300">
                <li>• ボーナス支払いは月末に一括処理されます</li>
                <li>• 支払い処理には担当者の承認が必要です</li>
                <li>• 処理が完了すると、レビュアーへ自動的に通知メールが送信されます</li>
                <li>• 支払い情報の修正は経理部門へ連絡してください</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="bg-gray-50 dark:bg-gray-800 p-4 border-t flex justify-between">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          最終更新: 2025年5月10日
        </div>
        <Button variant="outline" size="sm">
          レポートをダウンロード
        </Button>
      </CardFooter>
    </Card>
  );
}