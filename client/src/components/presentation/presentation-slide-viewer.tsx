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