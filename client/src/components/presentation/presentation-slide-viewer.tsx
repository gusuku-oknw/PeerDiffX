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
  zoomLevel?: number;
}

export function PresentationSlideViewer({ 
  slide, 
  isLoading = false,
  zoomLevel = 100
}: PresentationSlideViewerProps) {
  // スライドコンテンツはテキスト形式として直接使用

  // スライドコンテンツのレンダリング
  const renderSlideContent = () => {
    if (!slide) {
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

    // スライドタイトルと内容に基づいてコンテンツを生成
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
            {slide.title}
          </Typography>
          <Typography variant="h4" sx={{ 
            mb: 4, 
            textAlign: 'center',
            color: 'text.secondary'
          }}>
            {slide.content}
          </Typography>
          <Typography variant="h6" sx={{ 
            textAlign: 'center',
            color: 'text.disabled'
          }}>
            {new Date().toLocaleDateString('ja-JP')}
          </Typography>
        </Box>
      );
    } else {
      // その他のスライド
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
          <Typography variant="h3" sx={{ 
            fontWeight: 700, 
            mb: 4, 
            textAlign: 'center',
            color: 'primary.main'
          }}>
            {slide.title}
          </Typography>
          <Typography variant="h5" sx={{ 
            mb: 4, 
            textAlign: 'center',
            color: 'text.secondary'
          }}>
            {slide.content}
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
      p: { xs: 2, sm: 3, md: 4 }, // レスポンシブパディング
      bgcolor: 'background.default',
      overflow: 'auto',
      minHeight: 0 // フレックス子要素の縮小を許可
    }}>
      <Paper 
        elevation={4}
        sx={{ 
          width: '100%',
          maxWidth: { xs: '95%', sm: '90%', md: '85%', lg: '80%' }, // レスポンシブ最大幅
          aspectRatio: '16/9', // 統一された16:9アスペクト比
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: 'center',
          transition: 'transform 0.2s ease-in-out',
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          overflow: 'hidden',
          // レスポンシブフォントサイズ調整
          '& .MuiTypography-h2': {
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem', lg: '3rem' }
          },
          '& .MuiTypography-h3': {
            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.875rem', lg: '2.25rem' }
          },
          '& .MuiTypography-h4': {
            fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem', lg: '1.875rem' }
          },
          '& .MuiTypography-h5': {
            fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem', lg: '1.5rem' }
          },
          '& .MuiTypography-h6': {
            fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem', lg: '1.25rem' }
          }
        }}
      >
        {renderSlideContent()}
      </Paper>
    </Box>
  );
}