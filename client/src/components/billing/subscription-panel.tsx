import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  FaCreditCard,
  FaFileInvoiceDollar,
  FaHistory,
  FaArrowUp,
  FaExchangeAlt,
  FaCalendarAlt,
  FaClock,
  FaInfoCircle,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUserPlus,
  FaUserMinus,
  FaDownload
} from "react-icons/fa";

// サブスクリプション情報の型定義
interface Subscription {
  planName: string;
  planStatus: 'active' | 'past_due' | 'canceled';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBillingDate: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  seats: number;
  maxSeats: number;
  maxStorage: number;  // GB
  usedStorage: number; // GB
  paymentMethod: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  upcomingChanges?: {
    planName: string;
    seats: number;
    effectiveDate: string;
    amount: number;
  };
}

// 請求履歴の型定義
interface Invoice {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: 'paid' | 'open' | 'void' | 'uncollectible';
  downloadUrl?: string;
  items: {
    description: string;
    amount: number;
    quantity: number;
  }[];
}

// プランオプションの型定義
interface PlanOption {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  maxSeats: number;
  maxStorage: number;
  highlight?: boolean;
}

export function SubscriptionPanel() {
  const [activeTab, setActiveTab] = useState('current');
  const [showPlanOptions, setShowPlanOptions] = useState(false);
  
  // サンプルデータ - 実際のアプリケーションではAPIから取得
  const subscription: Subscription = {
    planName: "ビジネスプラン",
    planStatus: 'active',
    currentPeriodStart: '2025-05-01',
    currentPeriodEnd: '2025-06-01',
    nextBillingDate: '2025-06-01',
    amount: 49800,
    currency: 'JPY',
    interval: 'month',
    seats: 10,
    maxSeats: 15,
    maxStorage: 500, // 500GB
    usedStorage: 175.8, // 175.8GB
    paymentMethod: {
      brand: 'visa',
      last4: '4242',
      expMonth: 12,
      expYear: 2026
    }
  };
  
  // 請求履歴データ
  const invoices: Invoice[] = [
    {
      id: 'inv_12345',
      date: '2025-05-01',
      amount: 49800,
      currency: 'JPY',
      status: 'paid',
      downloadUrl: '#',
      items: [
        { description: 'ビジネスプラン (2025-05-01 - 2025-06-01)', amount: 49800, quantity: 1 }
      ]
    },
    {
      id: 'inv_12344',
      date: '2025-04-01',
      amount: 49800,
      currency: 'JPY',
      status: 'paid',
      downloadUrl: '#',
      items: [
        { description: 'ビジネスプラン (2025-04-01 - 2025-05-01)', amount: 49800, quantity: 1 }
      ]
    },
    {
      id: 'inv_12343',
      date: '2025-03-01',
      amount: 39800,
      currency: 'JPY',
      status: 'paid',
      downloadUrl: '#',
      items: [
        { description: 'ビジネスプラン (2025-03-01 - 2025-04-01)', amount: 39800, quantity: 1 }
      ]
    }
  ];
  
  // 利用可能なプランオプション
  const planOptions: PlanOption[] = [
    {
      id: "basic",
      name: "ベーシックプラン",
      description: "中小規模チーム向けの基本機能",
      price: 19800,
      currency: "JPY",
      interval: "month",
      features: [
        "5ユーザーまで",
        "100GBストレージ",
        "基本プレゼンテーション機能",
        "バージョン管理",
        "メールサポート"
      ],
      maxSeats: 5,
      maxStorage: 100
    },
    {
      id: "business",
      name: "ビジネスプラン",
      description: "成長するチーム向けの高度な機能",
      price: 49800,
      currency: "JPY",
      interval: "month",
      features: [
        "15ユーザーまで",
        "500GBストレージ",
        "高度なプレゼンテーション機能",
        "詳細なバージョン管理",
        "コメント・レビュー機能",
        "優先サポート",
        "API連携"
      ],
      maxSeats: 15,
      maxStorage: 500,
      highlight: true
    },
    {
      id: "enterprise",
      name: "エンタープライズプラン",
      description: "大規模組織向けのエンタープライズ機能",
      price: 99800,
      currency: "JPY",
      interval: "month",
      features: [
        "無制限ユーザー",
        "2TBストレージ",
        "全機能利用可能",
        "高度なセキュリティ",
        "カスタム統合",
        "専任サポート担当者",
        "SLA保証"
      ],
      maxSeats: 999,
      maxStorage: 2000
    }
  ];
  
  // 通貨フォーマット
  const formatCurrency = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };
  
  // 日付フォーマット
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  // ステータスに応じたバッジをレンダリング
  const renderStatusBadge = (status: 'active' | 'past_due' | 'canceled' | 'paid' | 'open' | 'void' | 'uncollectible') => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 flex items-center gap-1">
            <FaCheckCircle className="h-3 w-3" />
            <span>有効</span>
          </Badge>
        );
      case 'past_due':
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 flex items-center gap-1">
            <FaExclamationTriangle className="h-3 w-3" />
            <span>支払い遅延</span>
          </Badge>
        );
      case 'canceled':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 flex items-center gap-1">
            <FaExclamationTriangle className="h-3 w-3" />
            <span>キャンセル済</span>
          </Badge>
        );
      case 'paid':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 flex items-center gap-1">
            <FaCheckCircle className="h-3 w-3" />
            <span>支払済</span>
          </Badge>
        );
      case 'open':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 flex items-center gap-1">
            <FaClock className="h-3 w-3" />
            <span>未払い</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800 flex items-center gap-1">
            <FaInfoCircle className="h-3 w-3" />
            <span>その他</span>
          </Badge>
        );
    }
  };
  
  // クレジットカードブランドのアイコン
  const renderCardBrand = (brand: string) => {
    return <FaCreditCard className="text-blue-500" />;
  };
  
  // 使用率のセクションをレンダリング
  const renderUsageSection = () => {
    const seatsUsagePercentage = (subscription.seats / subscription.maxSeats) * 100;
    const storageUsagePercentage = (subscription.usedStorage / subscription.maxStorage) * 100;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">ユーザーシート</h3>
            <span className="text-sm">{subscription.seats} / {subscription.maxSeats}</span>
          </div>
          <Progress value={seatsUsagePercentage} className="h-2 mb-2" />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>使用率: {seatsUsagePercentage.toFixed(1)}%</span>
            <span>残り: {subscription.maxSeats - subscription.seats} シート</span>
          </div>
          <div className="mt-4 flex">
            <Button size="sm" variant="outline" className="mr-2 text-xs">
              <FaUserPlus className="mr-1 h-3 w-3" />
              ユーザー追加
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              <FaUserMinus className="mr-1 h-3 w-3" />
              ユーザー削除
            </Button>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">ストレージ使用量</h3>
            <span className="text-sm">{subscription.usedStorage.toFixed(1)} / {subscription.maxStorage} GB</span>
          </div>
          <Progress value={storageUsagePercentage} className="h-2 mb-2" />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>使用率: {storageUsagePercentage.toFixed(1)}%</span>
            <span>残り: {(subscription.maxStorage - subscription.usedStorage).toFixed(1)} GB</span>
          </div>
          <div className="mt-4">
            <Button size="sm" variant="outline" className="text-xs">
              <FaInfoCircle className="mr-1 h-3 w-3" />
              詳細な使用状況を表示
            </Button>
          </div>
        </div>
      </div>
    );
  };
  
  // 現在のサブスクリプション情報セクションをレンダリング
  const renderCurrentSubscription = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">{subscription.planName}</CardTitle>
              {renderStatusBadge(subscription.planStatus)}
            </div>
            <CardDescription>
              {formatCurrency(subscription.amount, subscription.currency)}/{subscription.interval === 'month' ? '月' : '年'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">現在の期間</div>
                <div className="flex items-center">
                  <FaCalendarAlt className="mr-2 text-blue-500" />
                  <span>
                    {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">次回請求日</div>
                <div className="flex items-center">
                  <FaClock className="mr-2 text-blue-500" />
                  <span>{formatDate(subscription.nextBillingDate)}</span>
                </div>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">支払い方法</div>
              <div className="flex items-center">
                {renderCardBrand(subscription.paymentMethod.brand)}
                <span className="ml-2">
                  {subscription.paymentMethod.brand.toUpperCase()} **** **** **** {subscription.paymentMethod.last4}
                </span>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  有効期限: {subscription.paymentMethod.expMonth}/{subscription.paymentMethod.expYear}
                </span>
                <Button size="sm" variant="ghost" className="ml-2">
                  <FaExchangeAlt className="mr-1 h-3 w-3" />
                  変更
                </Button>
              </div>
            </div>
            
            {subscription.upcomingChanges && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-100 dark:border-blue-800">
                <div className="font-medium text-blue-800 dark:text-blue-400 mb-1">今後の変更</div>
                <div className="text-sm">
                  {formatDate(subscription.upcomingChanges.effectiveDate)}から
                  <span className="font-medium">{subscription.upcomingChanges.planName}</span>
                  ({formatCurrency(subscription.upcomingChanges.amount, subscription.currency)}/月)に変更されます。
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-gray-50 dark:bg-gray-800 p-4 border-t flex justify-between">
            <Button variant="outline" size="sm" onClick={() => setShowPlanOptions(true)}>
              <FaExchangeAlt className="mr-2 h-4 w-4" />
              プラン変更
            </Button>
            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
              サブスクリプションをキャンセル
            </Button>
          </CardFooter>
        </Card>
        
        {renderUsageSection()}
      </div>
    );
  };
  
  // 請求履歴セクションをレンダリング
  const renderBillingHistory = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>請求履歴</CardTitle>
          <CardDescription>
            過去の請求書と支払い履歴
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>請求日</TableHead>
                <TableHead>請求書番号</TableHead>
                <TableHead>金額</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead className="text-right">アクション</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{formatDate(invoice.date)}</TableCell>
                  <TableCell>{invoice.id}</TableCell>
                  <TableCell>{formatCurrency(invoice.amount, invoice.currency)}</TableCell>
                  <TableCell>{renderStatusBadge(invoice.status)}</TableCell>
                  <TableCell className="text-right">
                    {invoice.downloadUrl && (
                      <Button size="sm" variant="ghost">
                        <FaDownload className="mr-1 h-3 w-3" />
                        請求書
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="bg-gray-50 dark:bg-gray-800 p-4 border-t flex justify-end">
          <Button variant="outline" size="sm">
            <FaHistory className="mr-2 h-4 w-4" />
            すべての履歴を表示
          </Button>
        </CardFooter>
      </Card>
    );
  };
  
  // プランオプションセクションをレンダリング
  const renderPlanOptions = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">利用可能なプラン</h3>
          <Button size="sm" variant="ghost" onClick={() => setShowPlanOptions(false)}>
            ← 現在のプランに戻る
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {planOptions.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${plan.highlight ? 'border-blue-500 dark:border-blue-400 shadow-md' : ''}`}
            >
              {plan.highlight && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-xs rounded-bl-lg rounded-tr-lg">
                  おすすめ
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-2">
                  <span className="text-2xl font-bold">{formatCurrency(plan.price, plan.currency)}</span>
                  <span className="text-gray-500 dark:text-gray-400">/{plan.interval === 'month' ? '月' : '年'}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <FaCheckCircle className="text-green-500 mt-1 mr-2 h-4 w-4" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button 
                  variant={plan.id === "business" ? "default" : "outline"}
                  className={plan.id === "business" ? "w-full" : "w-full"}
                >
                  {plan.id === subscription.planName ? "現在のプラン" : "プランを選択"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="flex items-center">
          <FaFileInvoiceDollar className="mr-2 h-6 w-6" />
          <CardTitle>請求およびサブスクリプション</CardTitle>
        </div>
        <CardDescription className="text-blue-100">
          サブスクリプション情報、請求履歴、支払い方法の管理
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        {!showPlanOptions && (
          <div className="mb-6">
            <div className="flex space-x-4 border-b">
              <button
                className={`pb-2 px-1 ${activeTab === 'current' ? 'border-b-2 border-blue-500 font-medium text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}
                onClick={() => setActiveTab('current')}
              >
                現在のサブスクリプション
              </button>
              <button
                className={`pb-2 px-1 ${activeTab === 'history' ? 'border-b-2 border-blue-500 font-medium text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}
                onClick={() => setActiveTab('history')}
              >
                請求履歴
              </button>
            </div>
          </div>
        )}
        
        {showPlanOptions ? (
          renderPlanOptions()
        ) : (
          <>
            {activeTab === 'current' && renderCurrentSubscription()}
            {activeTab === 'history' && renderBillingHistory()}
          </>
        )}
      </CardContent>
    </Card>
  );
}