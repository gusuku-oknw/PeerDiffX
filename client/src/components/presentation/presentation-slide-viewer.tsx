import { Paper, Box, Typography, CircularProgress } from '@mui/material';
import { useState, useEffect } from 'react';

interface Slide {
  id: number;
  slideNumber: number;
  title: string;
  content: string;
}

interface PresentationSlideViewerProps {
  slide: Slide | null;
  isLoading?: boolean;
  aspectRatio?: '16:9' | '4:3';
  zoomLevel?: number;
}

export function PresentationSlideViewer({ 
  slide, 
  isLoading = false,
  aspectRatio = '16:9',
  zoomLevel = 100
}: PresentationSlideViewerProps) {
  const [slideContent, setSlideContent] = useState<any>(null);

  useEffect(() => {
    if (slide?.content) {
      try {
        const content = JSON.parse(slide.content);
        setSlideContent(content);
      } catch (error) {
        console.error('Error parsing slide content:', error);
        setSlideContent(null);
      }
    }
  }, [slide]);

  // スライドコンテンツのレンダリング
  const renderSlideContent = () => {
    if (!slide || !slideContent) {
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: '100%',
          color: 'text.secondary'
        }}>
          <Typography variant="h6">
            スライドが選択されていません
          </Typography>
        </Box>
      );
    }

    const elements = slideContent.elements || [];

    // スライドタイプに基づいてコンテンツを生成
    if (slide.slideNumber === 1) {
      // タイトルスライド
      return (
        <Box sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',
          p: 6,
          bgcolor: 'background.paper'
        }}>
          <Typography variant="h2" sx={{ 
            fontWeight: 700, 
            mb: 3, 
            textAlign: 'center',
            color: 'primary.main'
          }}>
            Q4 Presentation
          </Typography>
          <Typography variant="h4" sx={{ 
            mb: 4, 
            textAlign: 'center',
            color: 'text.secondary'
          }}>
            Company Overview and Results
          </Typography>
          <Typography variant="h6" sx={{ 
            textAlign: 'center',
            color: 'text.disabled'
          }}>
            {new Date().toLocaleDateString('ja-JP')}
          </Typography>
        </Box>
      );
    } else if (slide.slideNumber === 2) {
      // 売上概要スライド
      return (
        <Box sx={{ height: '100%', p: 6, bgcolor: 'background.paper' }}>
          <Typography variant="h3" sx={{ 
            fontWeight: 700, 
            mb: 4, 
            color: 'primary.main'
          }}>
            売上概要
          </Typography>
          <Box sx={{ ml: 2 }}>
            {[
              '2025年第4四半期の売上は前年同期比15%増',
              '主力製品の売上が好調に推移',
              '新規顧客獲得数が目標を上回る'
            ].map((text, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box sx={{ 
                  width: 12, 
                  height: 12, 
                  borderRadius: '50%', 
                  bgcolor: 'primary.main', 
                  mr: 3,
                  flexShrink: 0
                }} />
                <Typography variant="h5" sx={{ color: 'text.primary' }}>
                  {text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      );
    } else if (slide.slideNumber === 3) {
      // 今後の展望スライド
      return (
        <Box sx={{ height: '100%', p: 6, bgcolor: 'background.paper' }}>
          <Typography variant="h3" sx={{ 
            fontWeight: 700, 
            mb: 4, 
            color: 'primary.main'
          }}>
            今後の展望
          </Typography>
          <Box sx={{ ml: 2 }}>
            <Typography variant="h4" sx={{ 
              fontWeight: 600, 
              mb: 3, 
              color: 'secondary.main'
            }}>
              1. デジタル化の推進
            </Typography>
            <Box sx={{ ml: 4 }}>
              {[
                'AI技術の活用による業務効率化',
                'クラウドサービスの導入'
              ].map((text, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ mr: 2, color: 'text.secondary' }}>
                    -
                  </Typography>
                  <Typography variant="h5" sx={{ color: 'text.primary' }}>
                    {text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      );
    } else {
      // まとめスライド
      return (
        <Box sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',
          p: 6,
          bgcolor: 'background.paper'
        }}>
          <Typography variant="h2" sx={{ 
            fontWeight: 700, 
            mb: 4, 
            textAlign: 'center',
            color: 'primary.main'
          }}>
            まとめ
          </Typography>
          <Typography variant="h4" sx={{ 
            mb: 4, 
            textAlign: 'center',
            color: 'text.secondary'
          }}>
            ご清聴ありがとうございました
          </Typography>
          <Typography variant="h6" sx={{ 
            textAlign: 'center',
            color: 'text.disabled'
          }}>
            ご質問がございましたら、お気軽にお声かけください
          </Typography>
        </Box>
      );
    }
  };

  if (isLoading) {
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

  return (
    <Box sx={{ 
      flex: 1, 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      p: 4,
      bgcolor: 'background.default',
      overflow: 'auto'
    }}>
      <Paper 
        elevation={4}
        sx={{ 
          width: '100%',
          maxWidth: aspectRatio === '16:9' ? '80%' : '70%',
          aspectRatio: aspectRatio === '16:9' ? '16/9' : '4/3',
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: 'center',
          transition: 'transform 0.2s ease-in-out',
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          overflow: 'hidden'
        }}
      >
        {renderSlideContent()}
      </Paper>
    </Box>
  );
}