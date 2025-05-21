import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import XMLDiffViewer from '@/components/diff-view/xml-diff-viewer';
import { queryClient } from '@/lib/queryClient';
import { extractXmlFromPptx, extractAllSlides } from '@/lib/pptx-extractor';
import { DiffContent } from '@shared/schema';
import { generateStructuredDiff } from '@/lib/advanced-xml-diff';
import { 
  ChevronLeft, 
  ChevronRight, 
  GitCompare, 
  FileText, 
  AlertTriangle,
  Download 
} from 'lucide-react';

const DiffView: React.FC = () => {
  const [location, setLocation] = useLocation();
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number>(1);
  const [oldXml, setOldXml] = useState<string>('');
  const [newXml, setNewXml] = useState<string>('');
  const [diffContent, setDiffContent] = useState<DiffContent | undefined>();
  const [slideCount, setSlideCount] = useState<number>(0);
  
  // URLからコミットIDを取得
  const searchParams = new URLSearchParams(window.location.search);
  const baseCommitId = searchParams.get('baseCommitId');
  const compareCommitId = searchParams.get('compareCommitId');
  
  // コミット情報の取得
  const { data: baseCommit, isLoading: isLoadingBase } = useQuery({
    queryKey: ['/api/commits', baseCommitId],
    enabled: !!baseCommitId,
  });
  
  const { data: compareCommit, isLoading: isLoadingCompare } = useQuery({
    queryKey: ['/api/commits', compareCommitId],
    enabled: !!compareCommitId,
  });
  
  // スライドデータの取得
  const { data: baseSlides, isLoading: isLoadingBaseSlides } = useQuery({
    queryKey: ['/api/commits', baseCommitId, 'slides'],
    enabled: !!baseCommitId,
  });
  
  const { data: compareSlides, isLoading: isLoadingCompareSlides } = useQuery({
    queryKey: ['/api/commits', compareCommitId, 'slides'],
    enabled: !!compareCommitId,
  });
  
  // 差分データの取得
  const { data: diffData, isLoading: isLoadingDiff } = useQuery({
    queryKey: ['/api/compare', baseCommitId, compareCommitId],
    enabled: !!baseCommitId && !!compareCommitId,
  });
  
  useEffect(() => {
    if (baseSlides && compareSlides) {
      // スライド数を設定
      setSlideCount(Math.max(baseSlides.length, compareSlides.length));
      
      // 現在選択されているスライドのXMLを設定
      updateSelectedSlideXml();
    }
  }, [baseSlides, compareSlides, selectedSlideIndex]);
  
  useEffect(() => {
    if (oldXml && newXml) {
      // XMLの差分を計算
      try {
        const structuredDiff = generateStructuredDiff(oldXml, newXml);
        setDiffContent(structuredDiff);
      } catch (error) {
        console.error('XML差分生成エラー:', error);
        setDiffContent(undefined);
      }
    }
  }, [oldXml, newXml]);
  
  const updateSelectedSlideXml = () => {
    if (!baseSlides || !compareSlides) return;
    
    const baseSlide = baseSlides.find(slide => slide.slideNumber === selectedSlideIndex);
    const compareSlide = compareSlides.find(slide => slide.slideNumber === selectedSlideIndex);
    
    setOldXml(baseSlide?.xmlContent || '');
    setNewXml(compareSlide?.xmlContent || '');
  };
  
  const handlePreviousSlide = () => {
    if (selectedSlideIndex > 1) {
      setSelectedSlideIndex(selectedSlideIndex - 1);
    }
  };
  
  const handleNextSlide = () => {
    if (selectedSlideIndex < slideCount) {
      setSelectedSlideIndex(selectedSlideIndex + 1);
    }
  };
  
  const handleBackToHistory = () => {
    // 履歴ページに戻る
    setLocation('/history');
  };
  
  const isLoading = isLoadingBase || isLoadingCompare || isLoadingBaseSlides || isLoadingCompareSlides || isLoadingDiff;
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  if (!baseCommit || !compareCommit) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>エラー</AlertTitle>
          <AlertDescription>
            比較するコミットが見つかりませんでした。パラメータを確認してください。
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={handleBackToHistory}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            履歴ページに戻る
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col mb-6">
        <div className="flex items-center mb-4">
          <Button variant="outline" size="sm" onClick={handleBackToHistory}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            履歴に戻る
          </Button>
          <h1 className="text-2xl font-bold ml-4">コミット比較</h1>
        </div>
        
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">比較情報</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="border p-3 rounded-md bg-slate-50 dark:bg-slate-900">
                <div className="text-sm font-medium mb-1">ベースコミット</div>
                <div className="text-xs text-muted-foreground mb-1">#{baseCommit.id}</div>
                <div className="text-sm font-semibold">{baseCommit.message}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(baseCommit.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="border p-3 rounded-md bg-slate-50 dark:bg-slate-900">
                <div className="text-sm font-medium mb-1">比較コミット</div>
                <div className="text-xs text-muted-foreground mb-1">#{compareCommit.id}</div>
                <div className="text-sm font-semibold">{compareCommit.message}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(compareCommit.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePreviousSlide}
              disabled={selectedSlideIndex <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              前のスライド
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleNextSlide}
              disabled={selectedSlideIndex >= slideCount}
            >
              次のスライド
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="text-sm">
            スライド {selectedSlideIndex} / {slideCount}
          </div>
        </div>
        
        <XMLDiffViewer 
          oldXml={oldXml} 
          newXml={newXml} 
          diffContent={diffContent}
          title={`スライド ${selectedSlideIndex} の変更`}
          diffType="structured"
          onRefresh={updateSelectedSlideXml}
        />
        
        {/* スライドのサムネイル表示（将来的な拡張機能） */}
        {/* <div className="grid grid-cols-2 gap-4 mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">ベースバージョン</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {baseSlides && baseSlides.find(s => s.slideNumber === selectedSlideIndex)?.thumbnail ? (
                <img 
                  src={baseSlides.find(s => s.slideNumber === selectedSlideIndex)?.thumbnail || ''} 
                  alt={`ベーススライド ${selectedSlideIndex}`}
                  className="w-full border rounded-md"
                />
              ) : (
                <div className="w-full h-32 bg-slate-100 dark:bg-slate-800 flex items-center justify-center border rounded-md">
                  <FileText className="h-8 w-8 text-slate-400" />
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">比較バージョン</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {compareSlides && compareSlides.find(s => s.slideNumber === selectedSlideIndex)?.thumbnail ? (
                <img 
                  src={compareSlides.find(s => s.slideNumber === selectedSlideIndex)?.thumbnail || ''} 
                  alt={`比較スライド ${selectedSlideIndex}`}
                  className="w-full border rounded-md"
                />
              ) : (
                <div className="w-full h-32 bg-slate-100 dark:bg-slate-800 flex items-center justify-center border rounded-md">
                  <FileText className="h-8 w-8 text-slate-400" />
                </div>
              )}
            </CardContent>
          </Card>
        </div> */}
        
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-3">概要</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="border p-4 rounded-md bg-green-50 dark:bg-green-900/20">
                  <div className="font-medium text-green-700 dark:text-green-300 mb-1">追加</div>
                  <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                    {diffContent?.added.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">要素</div>
                </div>
                <div className="border p-4 rounded-md bg-amber-50 dark:bg-amber-900/20">
                  <div className="font-medium text-amber-700 dark:text-amber-300 mb-1">変更</div>
                  <div className="text-2xl font-bold text-amber-800 dark:text-amber-200">
                    {diffContent?.modified.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">要素</div>
                </div>
                <div className="border p-4 rounded-md bg-red-50 dark:bg-red-900/20">
                  <div className="font-medium text-red-700 dark:text-red-300 mb-1">削除</div>
                  <div className="text-2xl font-bold text-red-800 dark:text-red-200">
                    {diffContent?.deleted.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">要素</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DiffView;