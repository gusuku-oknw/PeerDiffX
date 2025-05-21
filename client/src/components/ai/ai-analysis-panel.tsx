import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  FaRobot, 
  FaChartBar, 
  FaChartPie, 
  FaFileAlt, 
  FaCommentDots,
  FaThumbsUp,
  FaThumbsDown,
  FaKeyboard,
  FaEye,
  FaDownload,
  FaPrint,
  FaShare
} from "react-icons/fa";

interface AiAnalysisPanelProps {
  presentationId: number;
  commitId: number;
}

export function AiAnalysisPanel({ presentationId, commitId }: AiAnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState("summary");

  // 実際のアプリケーションでは、この部分はAPIから取得するデータに置き換えます
  const summaryData = {
    title: "企業のデジタルトランスフォーメーション戦略",
    slides: 24,
    averageTimePerSlide: "45秒",
    keyThemes: ["クラウド移行", "データ活用", "顧客体験", "セキュリティ"],
    suggestedImprovements: [
      "スライド12-15でのデータ可視化を強化する",
      "結論部分でより明確なアクションアイテムを提示する",
      "技術用語の説明をスライド5に追加する"
    ]
  };

  const sentimentData = {
    overall: "肯定的",
    positive: 68,
    neutral: 24,
    negative: 8,
    topPositive: ["革新的", "効率的", "最適化"],
    topNegative: ["課題", "リスク", "コスト"]
  };

  const keywordsData = [
    { word: "デジタルトランスフォーメーション", count: 15, relevance: 0.92 },
    { word: "クラウド技術", count: 12, relevance: 0.87 },
    { word: "データ分析", count: 10, relevance: 0.85 },
    { word: "顧客エクスペリエンス", count: 8, relevance: 0.82 },
    { word: "AIソリューション", count: 7, relevance: 0.79 },
    { word: "セキュリティ対策", count: 6, relevance: 0.76 }
  ];

  const readabilityData = {
    score: 76,
    level: "上級ビジネス",
    averageSentenceLength: 15,
    complexTerms: 24,
    improvements: [
      "スライド7での専門用語を簡略化する",
      "スライド18の長文を分割する",
      "視覚的な図表を増やす"
    ]
  };

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FaRobot className="mr-2 h-6 w-6" />
            <CardTitle className="text-xl">AI分析レポート</CardTitle>
          </div>
          <div className="bg-blue-900 py-1.5 px-3 rounded-full text-sm">
            最終更新: 2時間前
          </div>
        </div>
        <CardDescription className="text-blue-100 text-base mt-2">
          プレゼンテーションの詳細分析と改善提案
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="summary" className="flex items-center">
              <FaFileAlt className="mr-2 h-5 w-5" />
              <span className="text-sm">要約</span>
            </TabsTrigger>
            <TabsTrigger value="sentiment" className="flex items-center">
              <FaThumbsUp className="mr-2 h-5 w-5" />
              <span className="text-sm">感情分析</span>
            </TabsTrigger>
            <TabsTrigger value="keywords" className="flex items-center">
              <FaKeyboard className="mr-2 h-5 w-5" />
              <span className="text-sm">キーワード</span>
            </TabsTrigger>
            <TabsTrigger value="readability" className="flex items-center">
              <FaEye className="mr-2 h-5 w-5" />
              <span className="text-sm">読みやすさ</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="space-y-4">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">スライド数</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{summaryData.slides}</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">平均所要時間</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{summaryData.averageTimePerSlide}/スライド</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">総所要時間</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">約18分</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">主要テーマ</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {summaryData.keyThemes.map((theme, index) => (
                  <div key={index} className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-sm">
                    {theme}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">改善提案</h3>
              <ul className="space-y-2">
                {summaryData.suggestedImprovements.map((improvement, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full h-5 w-5 text-xs mr-2 mt-0.5">{index + 1}</span>
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="sentiment" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">全体の感情傾向: <span className="text-green-600 dark:text-green-400">{sentimentData.overall}</span></h3>
            </div>
            
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
              <div className="flex mb-2">
                <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-4">
                  <div className="flex h-4 rounded-full overflow-hidden">
                    <div 
                      className="bg-green-500" 
                      style={{ width: `${sentimentData.positive}%` }}
                    ></div>
                    <div 
                      className="bg-gray-500" 
                      style={{ width: `${sentimentData.neutral}%` }}
                    ></div>
                    <div 
                      className="bg-red-500" 
                      style={{ width: `${sentimentData.negative}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                  <span>肯定的: {sentimentData.positive}%</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-500 rounded-full mr-1"></div>
                  <span>中立: {sentimentData.neutral}%</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                  <span>否定的: {sentimentData.negative}%</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-md font-medium mb-2 text-green-600 dark:text-green-400 flex items-center">
                  <FaThumbsUp className="mr-1" /> 
                  トップ肯定的表現
                </h4>
                <ul className="space-y-2">
                  {sentimentData.topPositive.map((word, index) => (
                    <li key={index} className="bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-md">
                      {word}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-md font-medium mb-2 text-red-600 dark:text-red-400 flex items-center">
                  <FaThumbsDown className="mr-1" /> 
                  トップ否定的表現
                </h4>
                <ul className="space-y-2">
                  {sentimentData.topNegative.map((word, index) => (
                    <li key={index} className="bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md">
                      {word}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="keywords" className="space-y-4">
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">主要キーワード分析</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                プレゼンテーション内で最も関連性の高いキーワードと出現頻度
              </p>
            </div>
            
            <div className="space-y-3">
              {keywordsData.map((keyword, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{keyword.word}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{keyword.count}回</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${keyword.relevance * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">
                    関連性: {(keyword.relevance * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="readability" className="space-y-4">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-medium">読みやすさスコア</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  レベル: {readabilityData.level}
                </p>
              </div>
              <div className="relative h-20 w-20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-2xl font-bold">{readabilityData.score}</div>
                </div>
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#eee"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#4ade80"
                    strokeWidth="3"
                    strokeDasharray={`${readabilityData.score}, 100`}
                  />
                </svg>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">平均文長</div>
                <div className="text-xl font-bold">{readabilityData.averageSentenceLength}語</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">専門用語数</div>
                <div className="text-xl font-bold">{readabilityData.complexTerms}</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">改善提案</h3>
              <ul className="space-y-2">
                {readabilityData.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                    <div className="bg-yellow-200 dark:bg-yellow-700 rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">
                      !
                    </div>
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-800 p-4 border-t">
        <div className="w-full space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="secondary" size="sm" className="h-9 px-3">
                      <FaDownload className="mr-1.5" />
                      <span className="text-sm">レポート保存</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>分析レポートをPDFで保存</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 px-3">
                      <FaPrint className="mr-1.5" />
                      <span className="text-sm">印刷</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>分析レポートを印刷</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 px-3">
                      <FaShare className="mr-1.5" />
                      <span className="text-sm">共有</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>このレポートを共有</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                AI分析スコア: <span className="text-blue-600 dark:text-blue-400 font-bold">85/100</span>
              </div>
            </div>
          </div>
          
          <div className="w-full flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-2 text-sm">
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <FaRobot className="mr-1.5" />
              PeerDiffX AI分析エンジン v2.3
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              最終更新: 2023年5月21日 14:30
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}