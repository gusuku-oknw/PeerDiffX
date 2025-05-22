import { Paper, Box, Typography, Chip, Avatar, TextField, Button, Divider } from '@mui/material';
import { FaComment, FaStar, FaUser, FaCalendarAlt, FaHome } from 'react-icons/fa';
import { useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';

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
  const { isAdmin } = useAdmin();
  const [slideComment, setSlideComment] = useState('');
  const [overallComment, setOverallComment] = useState('');
  const [rating, setRating] = useState(0);

  const handleSlideCommentSubmit = () => {
    if (slideComment.trim()) {
      // TODO: API呼び出しでスライドコメントを保存
      console.log('スライドコメント:', slideComment);
      setSlideComment('');
    }
  };

  const handleOverallCommentSubmit = () => {
    if (overallComment.trim()) {
      // TODO: API呼び出しで全体コメントを保存
      console.log('全体コメント:', overallComment, '評価:', rating);
      setOverallComment('');
      setRating(0);
    }
  };

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
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* 学生ホーム情報 */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FaHome className="text-blue-500" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              学生ダッシュボード
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
              田
            </Avatar>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                田中太郎
              </Typography>
              <Typography variant="body2" color="text.secondary">
                学生ID: S2024001
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
            <Paper elevation={0} sx={{ p: 2, textAlign: 'center', border: 1, borderColor: 'divider', borderRadius: 2 }}>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                5
              </Typography>
              <Typography variant="caption" color="text.secondary">
                完了プロジェクト
              </Typography>
            </Paper>
            <Paper elevation={0} sx={{ p: 2, textAlign: 'center', border: 1, borderColor: 'divider', borderRadius: 2 }}>
              <Typography variant="h6" color="secondary" sx={{ fontWeight: 700 }}>
                ゴールド
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ランク
              </Typography>
            </Paper>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* 現在のスライドコメント */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <FaComment className="text-green-500" />
            スライド {currentSlideNumber} へのコメント
          </Typography>
          
          <TextField
            multiline
            rows={3}
            fullWidth
            size="small"
            placeholder="このスライドについてコメントを入力..."
            value={slideComment}
            onChange={(e) => setSlideComment(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <Button 
            variant="contained" 
            size="small" 
            fullWidth
            onClick={handleSlideCommentSubmit}
            disabled={!slideComment.trim()}
            sx={{ textTransform: 'none' }}
          >
            スライドコメントを投稿
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* 全体評価とコメント */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <FaStar className="text-yellow-500" />
            プレゼンテーション全体の評価
          </Typography>
          
          {/* 星評価 */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2, justifyContent: 'center' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                className={`cursor-pointer text-xl ${
                  star <= rating ? 'text-yellow-400' : 'text-gray-300'
                }`}
                onClick={() => setRating(star)}
              />
            ))}
          </Box>
          
          <TextField
            multiline
            rows={3}
            fullWidth
            size="small"
            placeholder="プレゼンテーション全体についてコメント..."
            value={overallComment}
            onChange={(e) => setOverallComment(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <Button 
            variant="outlined" 
            size="small" 
            fullWidth
            onClick={handleOverallCommentSubmit}
            disabled={!overallComment.trim() || rating === 0}
            sx={{ textTransform: 'none' }}
          >
            評価とコメントを投稿
          </Button>
        </Box>

        {/* プレゼンテーション基本情報 */}
        <Divider sx={{ my: 3 }} />
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            プレゼンテーション情報
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            {presentationName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {totalSlides} スライド • {author} • {lastModified}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}