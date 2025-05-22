import { useState } from 'react';
import { Popover, Paper, Box, TextField, Button, Typography, IconButton } from '@mui/material';
import { FaComment, FaTimes, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';

interface PopoverCommentProps {
  x: number;
  y: number;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (comment: string, reaction: 'like' | 'dislike' | null) => void;
  slideNumber: number;
}

export function PopoverComment({ 
  x, 
  y, 
  isOpen, 
  onClose, 
  onSubmit, 
  slideNumber 
}: PopoverCommentProps) {
  const [comment, setComment] = useState('');
  const [reaction, setReaction] = useState<'like' | 'dislike' | null>(null);

  const handleSubmit = () => {
    if (comment.trim()) {
      onSubmit(comment.trim(), reaction);
      setComment('');
      setReaction(null);
      onClose();
    }
  };

  const handleReactionClick = (newReaction: 'like' | 'dislike') => {
    setReaction(reaction === newReaction ? null : newReaction);
  };

  // ポップオーバーのanchorEl用の仮想要素を作成
  const anchorEl = isOpen ? {
    getBoundingClientRect: () => ({
      top: y,
      left: x,
      right: x,
      bottom: y,
      width: 0,
      height: 0,
      x: x,
      y: y,
      toJSON: () => {}
    })
  } : null;

  return (
    <Popover
      open={isOpen}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      sx={{
        '& .MuiPopover-paper': {
          boxShadow: 3,
          borderRadius: 2
        }
      }}
    >
      <Paper sx={{ p: 3, width: 320, maxWidth: '90vw' }}>
        {/* ヘッダー */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <FaComment className="text-blue-500" />
            スライド {slideNumber} にコメント
          </Typography>
          <IconButton onClick={onClose} size="small">
            <FaTimes />
          </IconButton>
        </Box>

        {/* コメント入力 */}
        <TextField
          multiline
          rows={3}
          fullWidth
          size="small"
          placeholder="このスライドについてコメントを入力..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          sx={{ mb: 2 }}
          autoFocus
        />

        {/* 反応ボタン */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button
            variant={reaction === 'like' ? 'contained' : 'outlined'}
            size="small"
            startIcon={<FaThumbsUp />}
            onClick={() => handleReactionClick('like')}
            color="success"
            sx={{ textTransform: 'none' }}
          >
            Good
          </Button>
          <Button
            variant={reaction === 'dislike' ? 'contained' : 'outlined'}
            size="small"
            startIcon={<FaThumbsDown />}
            onClick={() => handleReactionClick('dislike')}
            color="warning"
            sx={{ textTransform: 'none' }}
          >
            Needs Work
          </Button>
        </Box>

        {/* アクションボタン */}
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={onClose}
            sx={{ textTransform: 'none' }}
          >
            キャンセル
          </Button>
          <Button 
            variant="contained" 
            size="small" 
            onClick={handleSubmit}
            disabled={!comment.trim()}
            sx={{ textTransform: 'none' }}
          >
            コメント投稿
          </Button>
        </Box>
      </Paper>
    </Popover>
  );
}