// プレゼンテーション状態を管理するカスタムフック
import { useState, useEffect } from "react";
import { usePresentation, useCommits, useSlides } from "@/hooks/use-pptx";
import { useBranch } from "@/hooks/use-branches";
import { findDefaultBranch } from "@/features/branches/branch-manager";
import { fetchSlides, createSlidesFromAPI, createDefaultSlide } from "@/features/slides/slide-loader";

/**
 * プレゼンテーション全体の状態を管理するカスタムフック
 */
export function usePresentationState(presentationId: number) {
  // 基本的なstate変数
  const [activeSlideId, setActiveSlideId] = useState<number | null>(null);
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // データ取得hooks
  const { data: presentation, isLoading: isLoadingPresentation } = usePresentation(presentationId);
  const { data: defaultBranch, isLoading: isLoadingBranch } = useBranch(presentationId, true);
  const { data: commits, isLoading: isLoadingCommits } = useCommits(defaultBranch?.id);
  
  const latestCommit = commits?.[0];
  const { data: slides, isLoading: isLoadingSlides } = useSlides(latestCommit?.id);

  // 1. スライドが読み込まれたら、最初のスライドをアクティブにする
  useEffect(() => {
    // activeSlideIdが既に設定されている場合は何もしない
    if (activeSlideId) return;
    
    if (slides && slides.length > 0) {
      setActiveSlideId(slides[0].id);
    }
  }, [slides, activeSlideId]);

  // 2. ブランチがない場合の処理
  useEffect(() => {
    // ブランチがない場合の処理
    if (isAutoRefreshEnabled && presentation && !defaultBranch && !activeSlideId && !isInitialized) {
      const checkAndCreateBranch = async () => {
        try {
          // キャッシュを回避して最新のブランチ情報を取得
          const branch = await findDefaultBranch(presentationId);
          
          // ブランチが見つかった場合は何もしない
          if (branch) return;
          
          // ブランチが本当に存在しない場合のみ、作成処理
          await fetch("/api/branches", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              name: "main",
              description: "Default branch",
              presentationId: presentation.id,
              isDefault: true
            })
          });
        } catch (error) {
          console.error("ブランチ確認/作成エラー:", error);
        } finally {
          setIsInitialized(true);
        }
      };
      
      checkAndCreateBranch();
    }
  }, [presentation, defaultBranch, isAutoRefreshEnabled, activeSlideId, presentationId, isInitialized]);

  // 3. コミットがあるのにスライドがない場合の対応
  useEffect(() => {
    if (isAutoRefreshEnabled && latestCommit && (!slides || slides.length === 0) && !activeSlideId) {
      const checkAndCreateSlides = async () => {
        try {
          // 最新のスライドデータを取得
          const slideData = await fetchSlides(latestCommit.id, true);
          
          // スライドが既に存在する場合
          if (slideData && slideData.length > 0) {
            setActiveSlideId(slideData[0].id);
            return;
          }
          
          // スライド作成APIを試す
          const newSlides = await createSlidesFromAPI(latestCommit.id);
          
          if (newSlides && newSlides.length > 0) {
            setActiveSlideId(newSlides[0].id);
            return;
          }
          
          // 通常のスライド作成を試す
          const newSlide = await createDefaultSlide(latestCommit.id);
          
          if (newSlide) {
            setActiveSlideId(newSlide.id);
          }
        } catch (error) {
          console.error("スライド確認/作成エラー:", error);
        }
      };
      
      const timer = setTimeout(checkAndCreateSlides, 1000);
      return () => clearTimeout(timer);
    }
  }, [latestCommit, slides, isAutoRefreshEnabled, activeSlideId]);

  // スライド操作ロジック
  const activeSlide = slides?.find(slide => slide.id === activeSlideId);
  const activeSlideIndex = slides?.findIndex(slide => slide.id === activeSlideId) ?? 0;

  const handleSelectSlide = (slideId: number) => {
    setActiveSlideId(slideId);
  };

  const handlePrevSlide = () => {
    if (slides && activeSlideIndex > 0) {
      setActiveSlideId(slides[activeSlideIndex - 1].id);
    }
  };

  const handleNextSlide = () => {
    if (slides && activeSlideIndex < slides.length - 1) {
      setActiveSlideId(slides[activeSlideIndex + 1].id);
    }
  };

  // ローディング状態
  const isLoading = isLoadingPresentation || isLoadingBranch || isLoadingCommits || isLoadingSlides;

  return {
    // 状態
    presentation,
    defaultBranch,
    commits,
    latestCommit,
    slides,
    activeSlideId,
    activeSlide,
    activeSlideIndex,
    isAutoRefreshEnabled,
    
    // ローディング状態
    isLoading,
    
    // アクション
    setActiveSlideId,
    handleSelectSlide,
    handlePrevSlide,
    handleNextSlide,
    setIsAutoRefreshEnabled
  };
}