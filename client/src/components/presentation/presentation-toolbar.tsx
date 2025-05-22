import { Paper, Box, IconButton, Typography, Tooltip, Stack, Button } from '@mui/material';
import { 
  FaChevronLeft, 
  FaChevronRight, 
  FaExpand, 
  FaSearchPlus, 
  FaSearchMinus, 
  FaHistory, 
  FaCodeBranch,
  FaShare,
  FaDownload
} from 'react-icons/fa';

interface PresentationToolbarProps {
  currentSlideNumber: number;
  totalSlides: number;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onToggleFullscreen?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onViewHistory?: () => void;
  onViewBranches?: () => void;
  onShare?: () => void;
  onDownload?: () => void;
  zoomLevel?: number;
}

export function PresentationToolbar({
  currentSlideNumber,
  totalSlides,
  onPrevSlide,
  onNextSlide,
  onToggleFullscreen,
  onZoomIn,
  onZoomOut,
  onViewHistory,
  onViewBranches,
  onShare,
  onDownload,
  zoomLevel = 100
}: PresentationToolbarProps) {
  return (
    <Paper elevation={0} sx={{ 
      borderBottom: 1, 
      borderColor: 'divider', 
      p: 2, 
      bgcolor: 'background.paper',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* 左側：スライドナビゲーション */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Stack direction="row" spacing={1}>
            <Tooltip title="前のスライド">
              <span>
                <IconButton 
                  onClick={onPrevSlide} 
                  disabled={currentSlideNumber <= 1}
                  sx={{ 
                    bgcolor: 'action.hover',
                    '&:hover': { bgcolor: 'action.selected' },
                    '&:disabled': { bgcolor: 'action.disabledBackground' }
                  }}
                >
                  <FaChevronLeft size={16} />
                </IconButton>
              </span>
            </Tooltip>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              px: 2, 
              py: 1, 
              bgcolor: 'primary.main', 
              color: 'primary.contrastText',
              borderRadius: 1,
              minWidth: 80,
              justifyContent: 'center'
            }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {currentSlideNumber} / {totalSlides}
              </Typography>
            </Box>
            
            <Tooltip title="次のスライド">
              <span>
                <IconButton 
                  onClick={onNextSlide} 
                  disabled={currentSlideNumber >= totalSlides}
                  sx={{ 
                    bgcolor: 'action.hover',
                    '&:hover': { bgcolor: 'action.selected' },
                    '&:disabled': { bgcolor: 'action.disabledBackground' }
                  }}
                >
                  <FaChevronRight size={16} />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Stack>

        {/* 中央：ズームコントロール */}
        <Stack direction="row" spacing={1} alignItems="center">
          {onZoomOut && (
            <Tooltip title="縮小">
              <IconButton onClick={onZoomOut} size="small">
                <FaSearchMinus size={14} />
              </IconButton>
            </Tooltip>
          )}
          
          <Typography variant="body2" sx={{ 
            minWidth: 50, 
            textAlign: 'center',
            fontSize: '0.875rem',
            color: 'text.secondary'
          }}>
            {zoomLevel}%
          </Typography>
          
          {onZoomIn && (
            <Tooltip title="拡大">
              <IconButton onClick={onZoomIn} size="small">
                <FaSearchPlus size={14} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>

        {/* 右側：操作ボタン */}
        <Stack direction="row" spacing={1}>
          {onViewHistory && (
            <Tooltip title="履歴表示">
              <Button 
                variant="outlined" 
                size="small" 
                startIcon={<FaHistory size={14} />}
                onClick={onViewHistory}
                sx={{ minWidth: 'auto' }}
              >
                履歴
              </Button>
            </Tooltip>
          )}
          
          {onViewBranches && (
            <Tooltip title="ブランチ表示">
              <Button 
                variant="outlined" 
                size="small" 
                startIcon={<FaCodeBranch size={14} />}
                onClick={onViewBranches}
                sx={{ minWidth: 'auto' }}
              >
                ブランチ
              </Button>
            </Tooltip>
          )}
          
          {onShare && (
            <Tooltip title="共有">
              <IconButton onClick={onShare} size="small" color="primary">
                <FaShare size={14} />
              </IconButton>
            </Tooltip>
          )}
          
          {onDownload && (
            <Tooltip title="ダウンロード">
              <IconButton onClick={onDownload} size="small" color="primary">
                <FaDownload size={14} />
              </IconButton>
            </Tooltip>
          )}
          
          {onToggleFullscreen && (
            <Tooltip title="フルスクリーン">
              <IconButton onClick={onToggleFullscreen} size="small" color="primary">
                <FaExpand size={14} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Box>
    </Paper>
  );
}