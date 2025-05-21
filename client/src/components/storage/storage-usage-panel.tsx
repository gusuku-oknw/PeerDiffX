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
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  FaDatabase, 
  FaFileAlt, 
  FaExclamationTriangle, 
  FaChartPie, 
  FaCheck, 
  FaTrash, 
  FaFileArchive, 
  FaCloudDownloadAlt,
  FaInfoCircle,
  FaClock
} from 'react-icons/fa';

// ストレージ使用状況データの型定義
interface StorageUsageData {
  totalUsed: number; // GB
  totalLimit: number; // GB
  usageByType: {
    type: string;
    icon: React.ReactNode;
    size: number; // MB
    percentage: number;
    color: string;
  }[];
  recentFiles: {
    id: number;
    name: string;
    size: number; // KB
    type: string;
    lastModified: string;
    owner: string;
  }[];
}

export function StorageUsagePanel() {
  const [timeRange, setTimeRange] = useState("all");
  
  // サンプルデータ - 実際のアプリケーションではAPIから取得
  const usageData: StorageUsageData = {
    totalUsed: 175.8,
    totalLimit: 250,
    usageByType: [
      { 
        type: "プレゼンテーション", 
        icon: <FaFileAlt className="text-blue-500" />, 
        size: 95680, 
        percentage: 53.2, 
        color: "bg-blue-500" 
      },
      { 
        type: "画像", 
        icon: <FaFileAlt className="text-green-500" />, 
        size: 45120, 
        percentage: 25.1, 
        color: "bg-green-500" 
      },
      { 
        type: "バックアップ", 
        icon: <FaFileArchive className="text-amber-500" />, 
        size: 28800, 
        percentage: 16.0, 
        color: "bg-amber-500" 
      },
      { 
        type: "その他", 
        icon: <FaFileAlt className="text-purple-500" />, 
        size: 10240, 
        percentage: 5.7, 
        color: "bg-purple-500" 
      }
    ],
    recentFiles: [
      { 
        id: 1, 
        name: "Q4_Financial_Report.pptx", 
        size: 12288, 
        type: "プレゼンテーション", 
        lastModified: "2025-05-15", 
        owner: "田中 健太" 
      },
      { 
        id: 2, 
        name: "Marketing_Strategy_2025.pptx", 
        size: 18432, 
        type: "プレゼンテーション", 
        lastModified: "2025-05-12", 
        owner: "佐藤 美咲" 
      },
      { 
        id: 3, 
        name: "Product_Launch_Images.zip", 
        size: 45056, 
        type: "アーカイブ", 
        lastModified: "2025-05-10", 
        owner: "山田 太郎" 
      },
      { 
        id: 4, 
        name: "Customer_Feedback_Analysis.pptx", 
        size: 8192, 
        type: "プレゼンテーション", 
        lastModified: "2025-05-08", 
        owner: "鈴木 一郎" 
      },
      { 
        id: 5, 
        name: "Project_Timeline_2025.pptx", 
        size: 10240, 
        type: "プレゼンテーション", 
        lastModified: "2025-05-05", 
        owner: "高橋 直樹" 
      }
    ]
  };
  
  // ファイルサイズのフォーマット
  const formatFileSize = (sizeInKB: number): string => {
    if (sizeInKB < 1024) {
      return `${sizeInKB.toFixed(1)} KB`;
    } else if (sizeInKB < 1024 * 1024) {
      return `${(sizeInKB / 1024).toFixed(1)} MB`;
    } else {
      return `${(sizeInKB / (1024 * 1024)).toFixed(1)} GB`;
    }
  };
  
  // 使用率の計算
  const usagePercentage = (usageData.totalUsed / usageData.totalLimit) * 100;
  
  // 残り容量の計算
  const remainingStorage = usageData.totalLimit - usageData.totalUsed;
  
  // 使用状況に応じた色の取得
  const getUsageStatusColor = (percentage: number): string => {
    if (percentage < 70) return "text-green-500";
    if (percentage < 90) return "text-amber-500";
    return "text-red-500";
  };
  
  // ドーナツチャートのセグメントを描画
  const renderDonutSegments = () => {
    let cumulativePercentage = 0;
    
    return usageData.usageByType.map((item, index) => {
      const startPercentage = cumulativePercentage;
      cumulativePercentage += item.percentage;
      
      // SVGの円周計算 (円の外周はr * 2 * πなので、その割合を計算)
      const circumference = 2 * Math.PI * 47; // r=47の円の円周
      const strokeDasharray = (item.percentage / 100) * circumference;
      const strokeDashoffset = ((100 - startPercentage - item.percentage) / 100) * circumference;
      
      return (
        <circle
          key={index}
          cx="60"
          cy="60"
          r="47"
          fill="none"
          strokeWidth="8"
          className={item.color}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 60 60)"
          style={{
            transition: 'stroke-dashoffset 0.5s ease-in-out',
          }}
        />
      );
    });
  };
  
  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FaDatabase className="mr-2 h-6 w-6" />
            <CardTitle>ストレージ使用状況</CardTitle>
          </div>
          <Select defaultValue={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px] bg-white/10 text-white border-purple-400">
              <SelectValue placeholder="期間を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべての期間</SelectItem>
              <SelectItem value="month">今月</SelectItem>
              <SelectItem value="quarter">直近3ヶ月</SelectItem>
              <SelectItem value="year">今年</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CardDescription className="text-purple-100">
          プロジェクトのストレージ使用量と詳細情報
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* 全体使用量 */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-2">全体使用量</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold">{usageData.totalUsed.toFixed(1)} GB</span>
                <span className={`font-medium ${getUsageStatusColor(usagePercentage)}`}>
                  {usagePercentage.toFixed(1)}%
                </span>
              </div>
              <Progress value={usagePercentage} className="h-2 mb-2" />
              <div className="flex justify-between text-sm text-gray-500">
                <span>0 GB</span>
                <span>{usageData.totalLimit} GB</span>
              </div>
              <div className="mt-4 text-sm">
                <span className="text-gray-500">残り容量: </span>
                <span className="font-medium">{remainingStorage.toFixed(1)} GB</span>
              </div>
              {usagePercentage > 80 && (
                <div className="mt-2 text-sm text-amber-600 dark:text-amber-500 flex items-center">
                  <FaExclamationTriangle className="mr-1 h-3 w-3" />
                  <span>容量が{usagePercentage > 90 ? '非常に' : ''}少なくなっています</span>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* 種類別使用量 */}
          <Card className="col-span-2">
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">種類別使用量</h3>
              <div className="flex">
                <div className="w-32 h-32 relative">
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    {renderDonutSegments()}
                    <circle cx="60" cy="60" r="42" fill="white" />
                    <text x="60" y="55" textAnchor="middle" className="text-sm font-medium">
                      合計
                    </text>
                    <text x="60" y="70" textAnchor="middle" className="text-xl font-bold">
                      {usageData.totalUsed.toFixed(1)} GB
                    </text>
                  </svg>
                </div>
                <div className="flex-1 pl-4">
                  <ul className="space-y-3">
                    {usageData.usageByType.map((item, index) => (
                      <li key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${item.color} mr-2`}></div>
                          <div className="flex items-center">
                            {item.icon}
                            <span className="ml-2">{item.type}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{(item.size / 1024).toFixed(1)} MB</span>
                          <span className="text-xs text-gray-500">({item.percentage}%)</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* 最近のファイル */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">最近のファイル</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">ファイル名</TableHead>
                  <TableHead>所有者</TableHead>
                  <TableHead>種類</TableHead>
                  <TableHead className="text-right">サイズ</TableHead>
                  <TableHead className="text-right">更新日</TableHead>
                  <TableHead className="text-right">アクション</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usageData.recentFiles.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell className="font-medium">{file.name}</TableCell>
                    <TableCell>{file.owner}</TableCell>
                    <TableCell>{file.type}</TableCell>
                    <TableCell className="text-right">{formatFileSize(file.size)}</TableCell>
                    <TableCell className="text-right">{file.lastModified}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <FaCloudDownloadAlt className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <FaInfoCircle className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500">
                          <FaTrash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </CardContent>
      
      <CardFooter className="bg-gray-50 dark:bg-gray-800 p-4 border-t flex justify-between">
        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
          <FaClock className="mr-1" /> 
          最終更新: 2025年5月15日 15:30
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <FaFileArchive className="mr-2 h-4 w-4" />
            アーカイブ
          </Button>
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
            <FaCheck className="mr-2 h-4 w-4" />
            容量を確保
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}