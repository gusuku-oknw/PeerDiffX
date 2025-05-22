import { Box, AppBar, Toolbar, Typography, Chip, Avatar, AvatarGroup, Button, IconButton, Tabs, Tab } from '@mui/material';
import { FaSave, FaShare, FaCog, FaUser } from 'react-icons/fa';
import { useState } from 'react';

interface ParticipantInfo {
  id: string;
  name: string;
  avatar?: string;
}

interface EnhancedHeaderProps {
  projectName: string;
  progress: {
    current: number;
    total: number;
  };
  participants: ParticipantInfo[];
  activeTab: number;
  onTabChange: (newTab: number) => void;
}

const tabLabels = [
  'プレゼン資料',
  'レビューボード', 
  'ビュー',
  '分析',
  '説明会資料',
  'オンラインコメント'
];

export function EnhancedHeader({
  projectName,
  progress,
  participants,
  activeTab,
  onTabChange
}: EnhancedHeaderProps) {
  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, #6B46C1 0%, #9333EA 50%, #A855F7 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}
    >
      <Toolbar sx={{ minHeight: '64px !important', px: 3 }}>
        {/* 左側：ロゴとサービス名 */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              color: 'white'
            }}
          >
            <svg
              width="28"
              height="28" 
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              <path d="m15 5 4 4" />
            </svg>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                fontSize: '1.25rem',
                color: 'white'
              }}
            >
              PeerDiffX
            </Typography>
          </Box>
        </Box>

        {/* 中央：タブメニュー */}
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => onTabChange(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                color: 'rgba(255,255,255,0.7)',
                fontWeight: 500,
                textTransform: 'none',
                fontSize: '0.875rem',
                minWidth: 'auto',
                px: 2,
                '&.Mui-selected': {
                  color: 'white',
                  fontWeight: 600
                },
                '&:hover': {
                  color: 'rgba(255,255,255,0.9)'
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'white',
                height: 3,
                borderRadius: '2px 2px 0 0'
              },
              '& .MuiTabs-scrollButtons': {
                color: 'rgba(255,255,255,0.7)'
              }
            }}
          >
            {tabLabels.map((label, index) => (
              <Tab key={index} label={label} />
            ))}
          </Tabs>
        </Box>

        {/* 右側：進捗、参加者、アクションボタン */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* 進捗インジケーター */}
          <Chip
            label={`${progress.current}/${progress.total}`}
            size="small"
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontWeight: 600,
              '& .MuiChip-label': {
                px: 1.5
              }
            }}
          />

          {/* 参加者アバター */}
          <AvatarGroup 
            max={3}
            sx={{
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                fontSize: '0.75rem',
                border: '2px solid rgba(255,255,255,0.3)',
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white'
              }
            }}
          >
            {participants.map((participant) => (
              <Avatar key={participant.id} src={participant.avatar}>
                {participant.name.charAt(0)}
              </Avatar>
            ))}
          </AvatarGroup>

          {/* アクションボタン */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton 
              size="small"
              sx={{ 
                color: 'rgba(255,255,255,0.8)',
                '&:hover': { 
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              <FaSave />
            </IconButton>
            <IconButton 
              size="small"
              sx={{ 
                color: 'rgba(255,255,255,0.8)',
                '&:hover': { 
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              <FaShare />
            </IconButton>
            <IconButton 
              size="small"
              sx={{ 
                color: 'rgba(255,255,255,0.8)',
                '&:hover': { 
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              <FaCog />
            </IconButton>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}