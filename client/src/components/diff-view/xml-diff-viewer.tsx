import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { xmlDiffToMarkdown, structuredDiffToMarkdown } from '@/lib/advanced-xml-diff';
import { DiffContent } from '@shared/schema';
import {
  FileText,
  FileCode,
  Layout,
  Layers,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react';

// Markdownをレンダリングするためにシンプルなパーサーを使用
// 実際のアプリケーションでは、react-markdownなどのより完全なライブラリを使用することをお勧めします
const SimpleMarkdown: React.FC<{ markdown: string }> = ({ markdown }) => {
  // 基本的なMarkdownの変換ロジック：見出し、コードブロック、リスト、段落
  const renderMarkdown = (md: string) => {
    const lines = md.split('\n');
    return lines.map((line, index) => {
      // 見出し
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-3xl font-bold mt-4 mb-2">{line.substring(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-semibold mt-3 mb-2">{line.substring(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-medium mt-2 mb-1">{line.substring(4)}</h3>;
      }

      // コードブロック
      if (line === '```diff' || line === '```json' || line === '```') {
        return null; // コード境界線は無視
      }
      
      // diff行（コードブロック内）
      if (line.startsWith('+')) {
        return <div key={index} className="bg-green-100 dark:bg-green-900 font-mono text-sm py-0.5 px-1">{line}</div>;
      }
      if (line.startsWith('-')) {
        return <div key={index} className="bg-red-100 dark:bg-red-900 font-mono text-sm py-0.5 px-1">{line}</div>;
      }
      
      // 太字
      if (line.startsWith('**') && line.endsWith('**')) {
        return <strong key={index} className="block mt-2">{line.substring(2, line.length - 2)}</strong>;
      }
      
      // 空行
      if (line.trim() === '') {
        return <div key={index} className="h-2"></div>;
      }
      
      // デフォルト：通常のテキスト
      return <div key={index} className="text-sm">{line}</div>;
    }).filter(Boolean); // nullをフィルタリング
  };

  return (
    <div className="markdown-content">
      {renderMarkdown(markdown)}
    </div>
  );
};

interface XMLDiffViewerProps {
  oldXml: string;
  newXml: string;
  diffContent?: DiffContent;
  diffType?: 'xml' | 'structured';
  title?: string;
  onRefresh?: () => void;
}

const XMLDiffViewer: React.FC<XMLDiffViewerProps> = ({
  oldXml,
  newXml,
  diffContent,
  diffType = 'xml',
  title = 'XML差分表示',
  onRefresh
}) => {
  const { toast } = useToast();
  const [xmlDiff, setXmlDiff] = useState<string>('');
  const [markdownDiff, setMarkdownDiff] = useState<string>('');
  const [structuredMarkdown, setStructuredMarkdown] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>(diffType === 'structured' ? 'structured' : 'visual');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  
  useEffect(() => {
    if (!oldXml || !newXml) {
      setXmlDiff('XML内容がありません');
      setMarkdownDiff('差分を表示できません。XMLデータが不足しています。');
      return;
    }
    
    // サーバーサイドでXML差分処理を実行
    fetchXmlDiff();
  }, [oldXml, newXml]);
  
  useEffect(() => {
    if (diffContent) {
      try {
        const markdown = structuredDiffToMarkdown(diffContent);
        setStructuredMarkdown(markdown);
      } catch (error) {
        console.error('構造化差分のMarkdown変換エラー:', error);
        setStructuredMarkdown('差分の変換中にエラーが発生しました。');
      }
    }
  }, [diffContent]);
  
  const fetchXmlDiff = async () => {
    setIsLoading(true);
    try {
      // 本来はサーバーエンドポイントを呼び出してXML差分を取得
      // ここではクライアントサイドでモックデータを表示
      
      // サーバーAPIの呼び出し例
      // const response = await fetch('/api/compare-xml', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ oldXml, newXml })
      // });
      // const data = await response.json();
      // setXmlDiff(data.diff);
      
      // クライアントサイドでモックデータを表示
      setTimeout(() => {
        const mockXmlDiff = `@@ -5,7 +5,8 @@
<p:sp>
  <p:nvSpPr>
    <p:cNvPr id="4" name="Title 1"/>
-   <p:cNvSpPr/>
+   <p:cNvSpPr>
+     <a:spLocks noGrp="1"/>
+   </p:cNvSpPr>
    <p:nvPr>
      <p:ph type="title"/>
    </p:nvPr>
@@ -15,7 +16,7 @@
      <a:p>
        <a:r>
          <a:rPr lang="en-US" dirty="0" smtClean="0"/>
-         <a:t>プレゼンテーションタイトル</a:t>
+         <a:t>PowerPointバージョン管理システム</a:t>
        </a:r>
      </a:p>
    </p:txBody>`;
        
        setXmlDiff(mockXmlDiff);
        const md = xmlDiffToMarkdown(mockXmlDiff);
        setMarkdownDiff(md);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('XML差分取得エラー:', error);
      toast({
        title: 'エラー',
        description: 'XML差分の取得中にエラーが発生しました。',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };
  
  const handleRefresh = () => {
    fetchXmlDiff();
    if (onRefresh) onRefresh();
  };
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card className={`w-full border shadow-sm ${isExpanded ? 'h-auto' : 'max-h-[600px] overflow-hidden'}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={toggleExpand}>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {isExpanded ? '折りたたむ' : '展開する'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            更新
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="visual" className="flex items-center">
              <Layout className="h-4 w-4 mr-1" />
              <span>視覚的差分</span>
            </TabsTrigger>
            <TabsTrigger value="structured" className="flex items-center">
              <Layers className="h-4 w-4 mr-1" />
              <span>構造化差分</span>
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center">
              <FileText className="h-4 w-4 mr-1" />
              <span>テキスト</span>
            </TabsTrigger>
            <TabsTrigger value="raw" className="flex items-center">
              <FileCode className="h-4 w-4 mr-1" />
              <span>生XML</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="visual" className="mt-4">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-auto max-h-[520px] bg-slate-50 dark:bg-slate-900 p-4 rounded-md">
                <SimpleMarkdown markdown={markdownDiff} />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="structured" className="mt-4">
            <div className="overflow-auto max-h-[520px] bg-slate-50 dark:bg-slate-900 p-4 rounded-md">
              {diffContent ? (
                <SimpleMarkdown markdown={structuredMarkdown} />
              ) : (
                <p>構造化差分データがありません。</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="text" className="mt-4">
            <div className="overflow-auto max-h-[520px] bg-slate-50 dark:bg-slate-900 p-4 rounded-md">
              <pre className="text-xs font-mono">{xmlDiff}</pre>
            </div>
          </TabsContent>
          
          <TabsContent value="raw" className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-1">前バージョン</h3>
                <div className="overflow-auto max-h-[240px] bg-slate-50 dark:bg-slate-900 p-2 rounded-md">
                  <pre className="text-xs font-mono whitespace-pre-wrap">{oldXml}</pre>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">現バージョン</h3>
                <div className="overflow-auto max-h-[240px] bg-slate-50 dark:bg-slate-900 p-2 rounded-md">
                  <pre className="text-xs font-mono whitespace-pre-wrap">{newXml}</pre>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default XMLDiffViewer;