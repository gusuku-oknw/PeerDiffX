import { Box, Paper, CircularProgress, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

interface Slide {
  id: number;
  slideNumber: number;
  title: string;
  content: string;
}

interface PPTXSlideViewerProps {
  slide: Slide | null;
  pptxFile?: File | string;
  isLoading?: boolean;
  zoomLevel?: number;
}

export function PPTXSlideViewer({ 
  slide, 
  pptxFile,
  isLoading = false,
  zoomLevel = 100
}: PPTXSlideViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [slideHtml, setSlideHtml] = useState<string>('');
  const [loadingPptx, setLoadingPptx] = useState(false);

  useEffect(() => {
    if (pptxFile && slide && containerRef.current) {
      loadPPTXSlide();
    } else if (slide && !pptxFile) {
      // フォールバック：仮データ表示
      renderMockSlide();
    }
  }, [pptxFile, slide]);

  const loadPPTXSlide = async () => {
    if (!pptxFile || !slide || !containerRef.current) return;
    
    setLoadingPptx(true);
    try {
      // 現在は美しい仮データでプレビューを表示
      // 実際のPPTXファイル処理は今後実装予定
      console.log('PPTX file processing:', pptxFile ? 'File provided' : 'No file');
      renderMockSlide();
    } catch (error) {
      console.error('Error loading PPTX slide:', error);
      // エラー時は美しい仮データでフォールバック
      renderMockSlide();
    } finally {
      setLoadingPptx(false);
    }
  };

  const renderMockSlide = () => {
    if (!slide) return;
    
    // 仮データでの美しいスライド表示
    const mockHtml = `
      <div style="
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 40px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        text-align: center;
      ">
        <h1 style="
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 20px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">${slide.title}</h1>
        <p style="
          font-size: 1.5rem;
          margin-bottom: 30px;
          opacity: 0.9;
          max-width: 800px;
          line-height: 1.6;
        ">${slide.content}</p>
        <div style="
          font-size: 1.2rem;
          opacity: 0.7;
          margin-top: 20px;
        ">
          スライド ${slide.slideNumber}
        </div>
      </div>
    `;
    setSlideHtml(mockHtml);
  };

  if (isLoading || loadingPptx) {
    return (
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        bgcolor: 'background.default'
      }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  if (!slide) {
    return (
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        bgcolor: 'background.default'
      }}>
        <Typography variant="h6" color="text.secondary">
          スライドが選択されていません
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      flex: 1, 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      p: { xs: 2, sm: 3, md: 4 },
      bgcolor: 'background.default',
      overflow: 'auto',
      minHeight: 0
    }}>
      <Paper 
        elevation={4}
        sx={{ 
          width: '100%',
          maxWidth: { xs: '95%', sm: '90%', md: '85%', lg: '80%' },
          aspectRatio: '16/9',
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: 'center',
          transition: 'transform 0.2s ease-in-out',
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <div 
          ref={containerRef}
          style={{ 
            width: '100%', 
            height: '100%',
            overflow: 'hidden'
          }}
          dangerouslySetInnerHTML={{ __html: slideHtml }}
        />
      </Paper>
    </Box>
  );
}