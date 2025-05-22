import { Box, LinearProgress, Typography, Chip } from '@mui/material';
import { FaCheckCircle, FaCircle, FaClock } from 'react-icons/fa';

interface TaskProgressBarProps {
  totalSlides: number;
  completedSlides: number;
  currentSlide: number;
  projectName: string;
  dueDate?: string;
}

export function TaskProgressBar({
  totalSlides,
  completedSlides,
  currentSlide,
  projectName,
  dueDate = "2024年12月25日"
}: TaskProgressBarProps) {
  const progressPercentage = (completedSlides / totalSlides) * 100;
  const isCompleted = completedSlides === totalSlides;
  
  return (
    <Box sx={{ 
      bgcolor: 'background.paper', 
      borderBottom: 1, 
      borderColor: 'divider',
      p: 2,
      boxShadow: 1
    }}>
      {/* プロジェクト情報 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {projectName}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FaClock className="text-orange-500" />
          <Typography variant="body2" color="text.secondary">
            期限: {dueDate}
          </Typography>
        </Box>
      </Box>

      {/* 進捗バー */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            レビュー進捗
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {completedSlides}/{totalSlides} スライド完了 ({Math.round(progressPercentage)}%)
          </Typography>
        </Box>
        
        <LinearProgress 
          variant="determinate" 
          value={progressPercentage}
          sx={{ 
            height: 8, 
            borderRadius: 1,
            bgcolor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              bgcolor: isCompleted ? 'success.main' : 'primary.main',
              borderRadius: 1
            }
          }}
        />
      </Box>

      {/* ステータスとアクション */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {isCompleted ? (
            <Chip 
              icon={<FaCheckCircle />}
              label="レビュー完了" 
              color="success" 
              size="small"
            />
          ) : (
            <Chip 
              icon={<FaCircle />}
              label={`現在 ${currentSlide}/${totalSlides}`}
              color="primary" 
              size="small"
            />
          )}
          
          <Typography variant="caption" color="text.secondary">
            残り {totalSlides - completedSlides} スライド
          </Typography>
        </Box>

        {/* 進捗詳細 */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              コメント済み
            </Typography>
            <Typography variant="h6" color="primary">
              {completedSlides}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              残り
            </Typography>
            <Typography variant="h6" color="warning.main">
              {totalSlides - completedSlides}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}