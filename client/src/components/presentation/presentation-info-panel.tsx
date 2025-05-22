import { Paper, Box, Typography, Chip, Avatar } from '@mui/material';
import { FaCalendarAlt, FaUser, FaClock, FaSlash } from 'react-icons/fa';

interface PresentationInfoPanelProps {
  presentationName: string;
  totalSlides: number;
  currentSlideNumber: number;
  lastModified?: string;
  author?: string;
  width?: number;
}

export function PresentationInfoPanel({
  presentationName,
  totalSlides,
  currentSlideNumber,
  lastModified = "2024年12月15日",
  author = "田中太郎",
  width = 280
}: PresentationInfoPanelProps) {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        width: `${width}px`,
        flexShrink: 0,
        borderRight: 1, 
        borderColor: 'divider',
        bgcolor: 'background.paper',
        height: '100%',
        overflow: 'auto'
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* プレゼンテーション名 */}
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, lineHeight: 1.3 }}>
          {presentationName}
        </Typography>

        {/* 基本情報 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
            基本情報
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FaUser className="text-gray-500" style={{ marginRight: 8, fontSize: 14 }} />
            <Typography variant="body2" color="text.secondary">
              作成者: {author}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FaCalendarAlt className="text-gray-500" style={{ marginRight: 8, fontSize: 14 }} />
            <Typography variant="body2" color="text.secondary">
              更新日: {lastModified}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FaSlash className="text-gray-500" style={{ marginRight: 8, fontSize: 14 }} />
            <Typography variant="body2" color="text.secondary">
              スライド数: {totalSlides}枚
            </Typography>
          </Box>
        </Box>

        {/* 統計情報 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
            統計情報
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Paper elevation={0} sx={{ p: 2, textAlign: 'center', border: 1, borderColor: 'divider', borderRadius: 2 }}>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                {currentSlideNumber}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                現在
              </Typography>
            </Paper>
            <Paper elevation={0} sx={{ p: 2, textAlign: 'center', border: 1, borderColor: 'divider', borderRadius: 2 }}>
              <Typography variant="h6" color="secondary" sx={{ fontWeight: 700 }}>
                {totalSlides}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                スライド
              </Typography>
            </Paper>
          </Box>
        </Box>

        {/* ステータス */}
        <Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
            ステータス
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Chip 
              label="プレビューモード" 
              color="primary" 
              variant="outlined" 
              size="small"
            />
            <Chip 
              label="読み取り専用" 
              color="default" 
              variant="outlined" 
              size="small"
            />
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}