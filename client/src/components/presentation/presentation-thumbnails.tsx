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

  // PPTXファイル構造に基づくスライドプレビュー生成
  const getSlidePreview = (slide: Slide) => {
    // PPTX XML構造に準拠したスライドテーマ
    const slideThemes = [
      { 
        bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        layout: 'title'
      },
      { 
        bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        layout: 'content'
      },
      { 
        bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        layout: 'chart'
      },
      { 
        bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        layout: 'bullets'
      },
      { 
        bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        layout: 'summary'
      }
    ];

    const theme = slideThemes[(slide.slideNumber - 1) % slideThemes.length];
    
    return (
      <Box sx={{ 
        width: '100%',
        height: '100%',
        background: theme.bg,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: 1
      }}>
        {/* PPTXスライド番号表示 */}
        <Box sx={{
          position: 'absolute',
          top: 4,
          right: 6,
          bgcolor: 'rgba(255,255,255,0.9)',
          color: 'rgba(0,0,0,0.7)',
          fontSize: '8px',
          fontWeight: 600,
          px: 0.5,
          py: 0.25,
          borderRadius: 0.5,
          lineHeight: 1
        }}>
          {slide.slideNumber}
        </Box>

        {/* スライドコンテンツプレビュー */}
        {theme.layout === 'title' && (
          <Box sx={{ textAlign: 'center', color: 'white' }}>
            <Box sx={{ 
              width: 40, 
              height: 3, 
              bgcolor: 'rgba(255,255,255,0.9)', 
              mb: 0.5, 
              mx: 'auto',
              borderRadius: 0.25
            }} />
            <Box sx={{ 
              width: 30, 
              height: 2, 
              bgcolor: 'rgba(255,255,255,0.7)', 
              mx: 'auto',
              borderRadius: 0.25
            }} />
          </Box>
        )}

        {theme.layout === 'content' && (
          <Box sx={{ width: '100%', color: 'white', px: 1 }}>
            <Box sx={{ 
              width: 32, 
              height: 2.5, 
              bgcolor: 'rgba(255,255,255,0.9)', 
              mb: 1,
              borderRadius: 0.25
            }} />
            {[0, 1, 2].map((i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <Box sx={{ 
                  width: 2, 
                  height: 2, 
                  borderRadius: '50%', 
                  bgcolor: 'rgba(255,255,255,0.8)', 
                  mr: 0.5 
                }} />
                <Box sx={{ 
                  width: 20 + i * 3, 
                  height: 1.5, 
                  bgcolor: 'rgba(255,255,255,0.7)', 
                  borderRadius: 0.25
                }} />
              </Box>
            ))}
          </Box>
        )}

        {theme.layout === 'chart' && (
          <Box sx={{ width: '100%', color: 'white', px: 1 }}>
            <Box sx={{ 
              width: 28, 
              height: 2, 
              bgcolor: 'rgba(255,255,255,0.9)', 
              mb: 1,
              borderRadius: 0.25
            }} />
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'end', gap: 0.5 }}>
              {[8, 12, 10, 14].map((height, i) => (
                <Box 
                  key={i}
                  sx={{ 
                    width: 3, 
                    height: height, 
                    bgcolor: 'rgba(255,255,255,0.8)',
                    borderRadius: '1px 1px 0 0'
                  }} 
                />
              ))}
            </Box>
          </Box>
        )}

        {(theme.layout === 'bullets' || theme.layout === 'summary') && (
          <Box sx={{ width: '100%', color: 'white', px: 1, textAlign: 'center' }}>
            <Box sx={{ 
              width: 24, 
              height: 2.5, 
              bgcolor: 'rgba(255,255,255,0.9)', 
              mb: 1,
              mx: 'auto',
              borderRadius: 0.25
            }} />
            <Box sx={{ 
              width: 36, 
              height: 1.5, 
              bgcolor: 'rgba(255,255,255,0.7)', 
              mb: 0.5,
              mx: 'auto',
              borderRadius: 0.25
            }} />
            <Box sx={{ 
              width: 32, 
              height: 1.5, 
              bgcolor: 'rgba(255,255,255,0.6)', 
              mx: 'auto',
              borderRadius: 0.25
            }} />
          </Box>
        )}

        {/* PowerPoint風の装飾 */}
        <Box sx={{
          position: 'absolute',
          bottom: -5,
          right: -5,
          width: 15,
          height: 15,
          borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.2)'
        }} />
      </Box>
    );
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
              {/* PPTXスライドプレビュー - 正確な16:9比率 */}
              <Box sx={{ 
                position: 'relative',
                width: '100%',
                aspectRatio: '16/9', // PPTXファイル標準のアスペクト比
                overflow: 'hidden',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider'
              }}>
                <Box sx={{ 
                  position: 'absolute', 
                  inset: 0,
                  width: '100%',
                  height: '100%'
                }}>
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