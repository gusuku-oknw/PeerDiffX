import { Box, Typography, LinearProgress, Paper, Chip } from '@mui/material';
import { FaUsers, FaExclamationTriangle } from 'react-icons/fa';

interface ReviewQuotaPanelProps {
  quotaLimit: number;
  quotaUsed: number;
  currentMonth: string;
}

export function ReviewQuotaPanel({
  quotaLimit,
  quotaUsed,
  currentMonth = "12月"
}: ReviewQuotaPanelProps) {
  const quotaRemaining = quotaLimit - quotaUsed;
  const usagePercentage = (quotaUsed / quotaLimit) * 100;
  const isNearLimit = usagePercentage >= 80;
  const isOverLimit = usagePercentage >= 100;

  const getProgressColor = () => {
    if (isOverLimit) return 'error.main';
    if (isNearLimit) return 'warning.main';
    return 'primary.main';
  };

  const getStatusChip = () => {
    if (isOverLimit) {
      return (
        <Chip 
          icon={<FaExclamationTriangle />}
          label="上限超過" 
          color="error" 
          size="small"
        />
      );
    }
    if (isNearLimit) {
      return (
        <Chip 
          icon={<FaExclamationTriangle />}
          label="上限間近" 
          color="warning" 
          size="small"
        />
      );
    }
    return (
      <Chip 
        label="正常" 
        color="success" 
        size="small"
      />
    );
  };

  return (
    <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FaUsers className="text-blue-500" />
          {currentMonth} レビュー枠
        </Typography>
        {getStatusChip()}
      </Box>

      {/* 数値表示 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, mb: 2 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 700 }}>
            {quotaLimit}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            上限
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" color={getProgressColor()} sx={{ fontWeight: 700 }}>
            {quotaUsed}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            使用済み
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" color={quotaRemaining > 0 ? 'success.main' : 'error.main'} sx={{ fontWeight: 700 }}>
            {Math.max(0, quotaRemaining)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            残数
          </Typography>
        </Box>
      </Box>

      {/* 進捗バー */}
      <Box sx={{ mb: 1 }}>
        <LinearProgress 
          variant="determinate" 
          value={Math.min(usagePercentage, 100)}
          sx={{ 
            height: 8, 
            borderRadius: 1,
            bgcolor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              bgcolor: getProgressColor(),
              borderRadius: 1
            }
          }}
        />
      </Box>

      {/* パーセンテージ表示 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          使用率: {Math.round(usagePercentage)}%
        </Typography>
        {isNearLimit && (
          <Typography variant="caption" color={isOverLimit ? 'error.main' : 'warning.main'} sx={{ fontWeight: 600 }}>
            {isOverLimit ? '追加枠が必要です' : '上限に近づいています'}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}