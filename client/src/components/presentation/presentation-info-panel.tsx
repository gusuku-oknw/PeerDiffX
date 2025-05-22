import { Paper, Box, Typography, Chip, Avatar, TextField, Button, Divider, Tabs, Tab } from '@mui/material';
import { FaComment, FaStar, FaUser, FaCalendarAlt, FaHome, FaBuilding } from 'react-icons/fa';
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
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

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

  const renderStudentView = () => (
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

      {/* シンプルな全体フィードバック */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
          プレゼンテーション全体のフィードバック
        </Typography>
        
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
        
        {/* シンプルな反応ボタン */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button 
            variant={rating === 1 ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setRating(rating === 1 ? 0 : 1)}
            sx={{ 
              textTransform: 'none',
              fontSize: '1.2rem',
              minWidth: '60px'
            }}
          >
            👍
          </Button>
          <Button 
            variant={rating === -1 ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setRating(rating === -1 ? 0 : -1)}
            sx={{ 
              textTransform: 'none',
              fontSize: '1.2rem',
              minWidth: '60px'
            }}
          >
            👎
          </Button>
        </Box>
        
        <Button 
          variant="contained" 
          size="small" 
          fullWidth
          onClick={handleOverallCommentSubmit}
          disabled={!overallComment.trim()}
          sx={{ textTransform: 'none' }}
        >
          フィードバック送信
        </Button>
      </Box>
    </Box>
  );

  const renderCorporateView = () => (
    <Box sx={{ p: 3 }}>
      {/* 企業ダッシュボード情報 */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <FaBuilding className="text-purple-500" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            企業ダッシュボード
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar sx={{ width: 40, height: 40, bgcolor: 'secondary.main' }}>
            企
          </Avatar>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              田中企業株式会社
            </Typography>
            <Typography variant="body2" color="text.secondary">
              企業ID: C2024001
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
          <Paper elevation={0} sx={{ p: 2, textAlign: 'center', border: 1, borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
              12
            </Typography>
            <Typography variant="caption" color="text.secondary">
              進行中プロジェクト
            </Typography>
          </Paper>
          <Paper elevation={0} sx={{ p: 2, textAlign: 'center', border: 1, borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="h6" color="secondary" sx={{ fontWeight: 700 }}>
              85%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              満足度
            </Typography>
          </Paper>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* プロジェクト管理 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
          プロジェクト管理
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button 
            variant="contained" 
            size="small" 
            fullWidth
            sx={{ textTransform: 'none' }}
          >
            新しいプロジェクト作成
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            fullWidth
            sx={{ textTransform: 'none' }}
          >
            フィードバック分析表示
          </Button>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* 現在のプロジェクト情報 */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
          現在のプロジェクト
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          {presentationName}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
          {totalSlides} スライド • 更新: {lastModified}
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Chip 
            label="レビュー中" 
            color="warning" 
            variant="outlined" 
            size="small"
          />
          <Chip 
            label="コメント: 8件" 
            color="info" 
            variant="outlined" 
            size="small"
          />
        </Box>
      </Box>
    </Box>
  );

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
      {isAdmin ? (
        <>
          {/* 管理者用タブ */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              variant="fullWidth"
            >
              <Tab label="学生" sx={{ fontSize: '0.8rem', minHeight: 40 }} />
              <Tab label="企業" sx={{ fontSize: '0.8rem', minHeight: 40 }} />
            </Tabs>
          </Box>

          {/* タブコンテンツ */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {tabValue === 0 ? renderStudentView() : renderCorporateView()}
          </Box>
        </>
      ) : (
        /* 一般ユーザー用（学生ビュー） */
        renderStudentView()
      )}
    </Paper>
  );
}