import { useState } from 'react';
import { Badge, IconButton, Popover, Box, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider, Button } from '@mui/material';
import { FaBell, FaComment, FaReply, FaThumbsUp, FaCheck } from 'react-icons/fa';

interface Notification {
  id: string;
  type: 'comment_reply' | 'feedback_received' | 'project_approved';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  projectName: string;
  slideNumber?: number;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'comment_reply',
    title: '企業からの返信',
    message: 'スライド3のコメントに対して返信がありました',
    timestamp: '5分前',
    isRead: false,
    projectName: 'デジタルマーケティング戦略 2025',
    slideNumber: 3
  },
  {
    id: '2', 
    type: 'feedback_received',
    title: 'フィードバック受信',
    message: 'プレゼンテーション全体に対する評価を受け取りました',
    timestamp: '1時間前',
    isRead: false,
    projectName: 'デジタルマーケティング戦略 2025'
  },
  {
    id: '3',
    type: 'project_approved',
    title: 'プロジェクト承認',
    message: 'レビューが完了し、プロジェクトが承認されました',
    timestamp: '昨日',
    isRead: true,
    projectName: 'Q4売上分析レポート'
  }
];

export function NotificationIcon() {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'comment_reply':
        return <FaReply className="text-blue-500" />;
      case 'feedback_received':
        return <FaThumbsUp className="text-green-500" />;
      case 'project_approved':
        return <FaCheck className="text-purple-500" />;
      default:
        return <FaComment className="text-gray-500" />;
    }
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton onClick={handleClick} color="inherit">
        <Badge badgeContent={unreadCount} color="error">
          <FaBell />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          '& .MuiPopover-paper': {
            width: 400,
            maxWidth: '90vw',
            maxHeight: 500,
            boxShadow: 3
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* ヘッダー */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              通知
            </Typography>
            {unreadCount > 0 && (
              <Button 
                size="small" 
                onClick={handleMarkAllAsRead}
                sx={{ textTransform: 'none' }}
              >
                すべて既読
              </Button>
            )}
          </Box>

          {/* 通知リスト */}
          {notifications.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <FaBell className="text-gray-300" style={{ fontSize: '3rem', marginBottom: '1rem' }} />
              <Typography variant="body2" color="text.secondary">
                新しい通知はありません
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.map((notification, index) => (
                <Box key={notification.id}>
                  <ListItem
                    sx={{
                      bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                      borderRadius: 1,
                      mb: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'action.selected'
                      }
                    }}
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
                        {getNotificationIcon(notification.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" sx={{ fontWeight: notification.isRead ? 400 : 600 }}>
                          {notification.title}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {notification.projectName} • {notification.timestamp}
                          </Typography>
                        </Box>
                      }
                    />
                    {!notification.isRead && (
                      <Box 
                        sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          bgcolor: 'primary.main',
                          ml: 1
                        }} 
                      />
                    )}
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          )}

          {/* フッター */}
          <Divider sx={{ my: 2 }} />
          <Box sx={{ textAlign: 'center' }}>
            <Button 
              size="small" 
              sx={{ textTransform: 'none' }}
              onClick={handleClose}
            >
              すべての通知を表示
            </Button>
          </Box>
        </Box>
      </Popover>
    </>
  );
}