import { useState } from 'react';
import { Box, Button, Typography, Chip, Divider, Collapse } from '@mui/material';
import { FaRobot, FaChevronDown, FaChevronUp, FaBrain, FaHeart, FaThumbsUp } from 'react-icons/fa';

interface AISummaryWidgetProps {
  projectName: string;
  commentCount: number;
  onViewFullAnalysis: () => void;
}

// 実際のデータ分析結果（本来はAPIから取得）
const mockSummaryData = {
  summary: "全体的に構成が明確で視覚的に分かりやすいプレゼンテーションです。データの活用が効果的で、特にマーケティング戦略の具体性が評価されています。",
  keywords: [
    { word: "データ活用", sentiment: "positive", count: 8 },
    { word: "視覚的", sentiment: "positive", count: 6 },
    { word: "具体性", sentiment: "positive", count: 5 },
    { word: "文字サイズ", sentiment: "negative", count: 3 }
  ],
  sentiment: {
    positive: 78,
    neutral: 15,
    negative: 7
  }
};

export function AISummaryWidget({ 
  projectName, 
  commentCount, 
  onViewFullAnalysis 
}: AISummaryWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'success.main';
      case 'negative': return 'error.main';
      default: return 'warning.main';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <FaThumbsUp className="text-green-500" />;
      case 'negative': return <FaHeart className="text-red-500" />;
      default: return <FaBrain className="text-orange-500" />;
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      {/* メインボタン */}
      <Button
        variant="outlined"
        size="small"
        fullWidth
        onClick={() => setIsExpanded(!isExpanded)}
        startIcon={<FaRobot />}
        endIcon={isExpanded ? <FaChevronUp /> : <FaChevronDown />}
        sx={{ 
          textTransform: 'none',
          justifyContent: 'space-between',
          mb: 1
        }}
      >
        AI要約を表示 ({commentCount}件分析済み)
      </Button>

      {/* 展開コンテンツ */}
      <Collapse in={isExpanded}>
        <Box sx={{ 
          border: 1, 
          borderColor: 'divider', 
          borderRadius: 1, 
          p: 2,
          bgcolor: 'background.paper'
        }}>
          {/* 3〜5文サマリ */}
          <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.5 }}>
            {mockSummaryData.summary}
          </Typography>

          <Divider sx={{ my: 2 }} />

          {/* キーワード分析 */}
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            主要キーワード
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {mockSummaryData.keywords.map((keyword, index) => (
              <Chip
                key={index}
                label={`${keyword.word} (${keyword.count})`}
                size="small"
                color={keyword.sentiment === 'positive' ? 'success' : keyword.sentiment === 'negative' ? 'error' : 'warning'}
                variant="outlined"
              />
            ))}
          </Box>

          {/* 感情分析 */}
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            感情分析
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, mb: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="success.main" sx={{ fontWeight: 700 }}>
                {mockSummaryData.sentiment.positive}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ポジティブ
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="warning.main" sx={{ fontWeight: 700 }}>
                {mockSummaryData.sentiment.neutral}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                中立
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="error.main" sx={{ fontWeight: 700 }}>
                {mockSummaryData.sentiment.negative}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                改善必要
              </Typography>
            </Box>
          </Box>

          {/* アクションボタン */}
          <Button
            variant="contained"
            size="small"
            fullWidth
            onClick={onViewFullAnalysis}
            sx={{ textTransform: 'none' }}
          >
            詳細分析を表示
          </Button>
        </Box>
      </Collapse>
    </Box>
  );
}