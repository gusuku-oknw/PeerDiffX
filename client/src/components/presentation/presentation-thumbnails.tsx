import { Paper, Box, Typography, Card, CardContent } from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import { FaGripLinesVertical } from 'react-icons/fa';

interface Slide {
  id: number;
  slideNumber: number;
  title: string;
  content: string;
}

interface PresentationThumbnailsProps {
  slides: Slide[];
  activeSlideId: number;
  onSelectSlide: (slideId: number) => void;
  width?: number;
}

export function PresentationThumbnails({ 
  slides, 
  activeSlideId, 
  onSelectSlide,
  width: initialWidth = 280
}: PresentationThumbnailsProps) {
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);
  const minWidth = 200;
  const maxWidth = 400;

  // リサイズ処理
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const panelRect = resizeRef.current?.getBoundingClientRect();
      if (!panelRect) return;
      
      const panelLeft = panelRect.left - (width - panelRect.width);
      const newWidth = Math.max(minWidth, Math.min(maxWidth, e.clientX - panelLeft));
      
      setWidth(newWidth);
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };
    
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, width]);

  const startResize = () => {
    setIsResizing(true);
  };

  // スライドプレビューコンテンツの取得
  const getSlidePreview = (slide: Slide) => {
    try {
      const content = JSON.parse(slide.content);
      const elements = content.elements || [];
      
      // スライドタイプに基づいてプレビューを生成
      if (slide.slideNumber === 1) {
        // タイトルスライド
        return (
          <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center', 
            p: 2,
            bgcolor: 'background.paper'
          }}>
            <Box sx={{ width: 60, height: 12, bgcolor: 'primary.main', mb: 1, borderRadius: 0.5 }} />
            <Box sx={{ width: 80, height: 8, bgcolor: 'text.secondary', mb: 1, borderRadius: 0.5, opacity: 0.6 }} />
            <Box sx={{ width: 64, height: 6, bgcolor: 'text.secondary', borderRadius: 0.5, opacity: 0.4 }} />
          </Box>
        );
      } else if (slide.slideNumber === 2) {
        // 箇条書きスライド
        return (
          <Box sx={{ height: '100%', p: 2, bgcolor: 'background.paper' }}>
            <Box sx={{ width: 80, height: 10, bgcolor: 'text.primary', mb: 2, borderRadius: 0.5 }} />
            {[0, 1, 2].map((i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main', mr: 1.5 }} />
                <Box sx={{ width: 60 + i * 8, height: 4, bgcolor: 'text.secondary', borderRadius: 0.5, opacity: 0.7 }} />
              </Box>
            ))}
          </Box>
        );
      } else if (slide.slideNumber === 3) {
        // チャート/展望スライド
        return (
          <Box sx={{ height: '100%', p: 2, bgcolor: 'background.paper' }}>
            <Box sx={{ width: 64, height: 10, bgcolor: 'text.primary', mb: 2, borderRadius: 0.5 }} />
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'end', flexGrow: 1, py: 1 }}>
              {[24, 40, 32, 48].map((height, i) => (
                <Box 
                  key={i}
                  sx={{ 
                    width: 12, 
                    height: height, 
                    bgcolor: `primary.${['light', 'main', 'main', 'dark'][i]}`, 
                    mr: i < 3 ? 0.5 : 0,
                    borderRadius: '2px 2px 0 0'
                  }} 
                />
              ))}
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
            p: 2,
            bgcolor: 'background.paper'
          }}>
            <Box sx={{ width: 56, height: 16, bgcolor: 'primary.main', mb: 2, borderRadius: 0.5 }} />
            <Box sx={{ width: 120, height: 8, bgcolor: 'text.secondary', mb: 1, borderRadius: 0.5, opacity: 0.6 }} />
            <Box sx={{ width: 100, height: 6, bgcolor: 'text.secondary', borderRadius: 0.5, opacity: 0.4 }} />
          </Box>
        );
      }
    } catch (error) {
      // エラー時のフォールバック
      return (
        <Box sx={{ 
          height: '100%', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          bgcolor: 'background.paper'
        }}>
          <Typography variant="caption" color="text.secondary">
            スライド {slide.slideNumber}
          </Typography>
        </Box>
      );
    }
  };

  return (
    <Paper 
      ref={resizeRef}
      elevation={0} 
      sx={{ 
        width: `${width}px`,
        flexShrink: 0,
        borderRight: 1, 
        borderColor: 'divider',
        bgcolor: 'background.default',
        height: '100%',
        overflow: 'auto',
        position: 'relative'
      }}
    >
      {/* リサイズハンドル */}
      <Box 
        sx={{ 
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: 4,
          bgcolor: 'transparent',
          cursor: 'ew-resize',
          zIndex: 10,
          '&:hover .resize-indicator': {
            bgcolor: 'primary.main'
          }
        }}
        onMouseDown={startResize}
        title="パネルのサイズを変更"
      >
        <Box 
          className="resize-indicator"
          sx={{ 
            position: 'absolute',
            top: '50%',
            right: 0,
            transform: 'translateY(-50%)',
            bgcolor: 'divider',
            borderRadius: '4px 0 0 4px',
            px: 0.5,
            py: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 1,
            transition: 'background-color 0.2s'
          }}
        >
          <FaGripLinesVertical size={12} style={{ color: 'inherit', opacity: 0.6 }} />
        </Box>
      </Box>

      <Box sx={{ p: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3, color: 'text.primary' }}>
          スライド一覧
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {slides.map((slide) => (
            <Card 
              key={slide.id}
              elevation={slide.id === activeSlideId ? 3 : 1}
              sx={{ 
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                transform: slide.id === activeSlideId ? 'scale(1.02)' : 'scale(1)',
                border: slide.id === activeSlideId ? 2 : 1,
                borderColor: slide.id === activeSlideId ? 'primary.main' : 'divider',
                '&:hover': {
                  elevation: 4,
                  transform: 'scale(1.02)',
                  borderColor: 'primary.light'
                }
              }}
              onClick={() => onSelectSlide(slide.id)}
            >
              {/* スライドプレビュー */}
              <Box sx={{ 
                position: 'relative',
                width: '100%',
                paddingBottom: '56.25%', // 16:9 aspect ratio
                overflow: 'hidden'
              }}>
                <Box sx={{ position: 'absolute', inset: 0 }}>
                  {getSlidePreview(slide)}
                </Box>
              </Box>
              
              {/* スライド情報 */}
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  スライド {slide.slideNumber}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {slide.title || 'タイトルなし'}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}