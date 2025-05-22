import React, { useState, useEffect, useRef } from 'react';
import { useRoute, Link } from 'wouter';
import { usePresentation, useSlides } from '@/hooks/use-pptx';
import { decodeId, encodeId } from '@/lib/hash-utils';
import { useToast } from '@/hooks/use-toast';

// Material-UI imports
import {
  Box,
  Typography,
  Button,
  Paper,
  Skeleton,
  AppBar,
  Toolbar,
  IconButton,
  Divider,
  Tabs,
  Tab,
  Stack,
  Avatar,
  Fade,
  Slide,
  Chip,
  useTheme,
  alpha,
  Container,
  Grid,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Home,
  Settings,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Fullscreen,
  Comment,
  History,
  Lock,
  Close,
  AccountTree,
  MergeType as GitCompare,
  Layers,
  PlayArrow,
  Share,
  Download,
  Edit,
  Visibility,
  CheckCircle,
} from '@mui/icons-material';

import SlideThumbnails from '@/components/slides/slide-thumbnails';

export default function PublicPreview() {
  const theme = useTheme();
  const [, params] = useRoute<{ presentationId: string; commitId?: string }>('/public-preview/:presentationId/:commitId?');

  const presentationId = params?.presentationId
    ? decodeId(params.presentationId) || 12
    : 12;
  const commitId = params?.commitId ? parseInt(params.commitId, 10) : 35;

  const { toast } = useToast();
  const { data: presentation, isLoading: isLoadingPresentation } = usePresentation(presentationId);
  const { data: slides = [], isLoading: isLoadingSlides } = useSlides(commitId);

  const [currentSlideId, setCurrentSlideId] = useState<number | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showBottomPanel, setShowBottomPanel] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [panelHeight, setPanelHeight] = useState(300);
  const [zoomLevel, setZoomLevel] = useState(100);

  const sampleSlide = {
    id: 9999,
    title: 'Q4 Presentation',
    slideNumber: 1,
    content: {
      elements: [
        {
          type: 'text',
          x: 50,
          y: 200,
          content: 'Q4 Presentation',
          style: { fontSize: 42, fontWeight: 'bold', color: '#000000' },
        },
        {
          type: 'text',
          x: 50,
          y: 280,
          content: 'Company Overview and Results',
          style: { fontSize: 24, color: '#444444' },
        },
        {
          type: 'text',
          x: 50,
          y: 400,
          content: new Date().toLocaleDateString('ja-JP'),
          style: { fontSize: 16, color: '#666666' },
        },
      ],
    },
  };

  // initialize current slide
  useEffect(() => {
    if (!isLoadingSlides) {
      if (slides.length > 0) {
        setCurrentSlideId(slides[0].id);
        setCurrentSlideIndex(0);
      } else {
        setCurrentSlideId(sampleSlide.id);
        setCurrentSlideIndex(0);
      }
    }
  }, [slides, isLoadingSlides]);

  // update index when slide id changes
  useEffect(() => {
    if (currentSlideId !== sampleSlide.id && slides.length > 0) {
      const idx = slides.findIndex(s => s.id === currentSlideId);
      if (idx !== -1) setCurrentSlideIndex(idx);
    }
  }, [currentSlideId, slides]);

  const goToPreviousSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideId(slides[currentSlideIndex - 1].id);
    }
  };
  const goToNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideId(slides[currentSlideIndex + 1].id);
    }
  };
  const handleSelectSlide = (id: number) => setCurrentSlideId(id);
  const handleTabChange = (_: any, v: number) => setActiveTab(v);
  const handleViewHistory = () => {
    setActiveTab(1);
    setShowBottomPanel(true);
  };
  const handleViewXmlDiff = () => {
    setActiveTab(1);
    setShowBottomPanel(true);
  };
  const handleZoomIn = () => setZoomLevel(z => Math.min(200, z + 25));
  const handleZoomOut = () => setZoomLevel(z => Math.max(50, z - 25));

  // resize bottom panel
  const startYRef = useRef(0);
  const startHRef = useRef(panelHeight);
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    startYRef.current = e.clientY;
    startHRef.current = panelHeight;
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };
  const handleResizeMove = (e: MouseEvent) => {
    const delta = startYRef.current - e.clientY;
    const nh = Math.max(150, Math.min(window.innerHeight * 0.7, startHRef.current + delta));
    setPanelHeight(nh);
  };
  const handleResizeEnd = () => {
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPreviousSlide();
      if (e.key === 'ArrowRight') goToNextSlide();
      if (e.key === 'Escape') setShowBottomPanel(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentSlideIndex, slides]);

  if (isLoadingPresentation || !presentation) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(
            theme.palette.secondary.main,
            0.05
          )})`,
        }}
      >
        <Container maxWidth="sm">
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            <Skeleton variant="text" width="60%" height={40} />
            <Skeleton variant="rectangular" width="100%" height={200} sx={{ mt: 3, borderRadius: 2 }} />
            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Skeleton variant="circular" width={40} height={40} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="60%" />
              </Box>
            </Stack>
          </Paper>
        </Container>
      </Box>
    );
  }

  const TabPanel = ({ children, value, index, ...other }: any) => (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <>
      {/* 固定ヘッダー */}
      <AppBar position="fixed" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', backdropFilter: 'blur(10px)' }}>
        <Toolbar sx={{ px: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
                <Avatar sx={{ width: 40, height: 40, background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, mr: 1.5 }}>
                  <Layers sx={{ fontSize: 20 }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  PeerDiffX
                </Typography>
              </Box>
            </Link>
            <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ mr: 2, color: 'text.primary' }}>
                {presentation.name}
              </Typography>
              <Chip label="公開中" color="success" size="small" icon={<Visibility />} sx={{ mr: 2 }} />
              <Badge badgeContent="3" color="primary">
                <Comment sx={{ color: 'text.secondary' }} />
              </Badge>
            </Box>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="プレゼン開始">
              <Button startIcon={<PlayArrow />} variant="contained" sx={{ borderRadius: 2, background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})` }}>
                プレゼン開始
              </Button>
            </Tooltip>
            <Tooltip title="共有">
              <IconButton color="primary">
                <Share />
              </IconButton>
            </Tooltip>
            <Tooltip title="ダウンロード">
              <IconButton color="primary">
                <Download />
              </IconButton>
            </Tooltip>
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            <Button component={Link} href="/" startIcon={<Home />} color="inherit" sx={{ color: 'text.primary' }}>
              ホーム
            </Button>
            <Button component={Link} href="/settings" startIcon={<Settings />} color="inherit" sx={{ color: 'text.primary' }}>
              設定
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* ヘッダー分のオフセット */}
      <Box sx={{ height: theme.mixins.toolbar.minHeight }} />

      {/* メイン領域 */}
      <Box sx={{ display: 'flex', height: `calc(100vh - ${theme.mixins.toolbar.minHeight}px)`, overflow: 'hidden', bgcolor: 'background.default' }}>
        {/* サイドバー */}
        <Paper elevation={0} sx={{ width: 280, borderRight: 1, borderColor: 'divider', overflow: 'auto', bgcolor: alpha(theme.palette.background.paper, 0.7), backdropFilter: 'blur(10px)' }}>
          <Box sx={{ p: 3 }}>
            {/* プレゼン情報 */}
            <Paper elevation={0} sx={{ mb: 3, border: 1, borderColor: 'divider', borderRadius: 2, background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                  {presentation.name}
                </Typography>
                {presentation.description && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {presentation.description}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary">
                  最終更新: {new Date(presentation.updatedAt).toLocaleDateString('ja-JP')}
                </Typography>
              </Box>
            </Paper>

            {/* ブランチ＆コミット */}
            <Typography variant="overline" sx={{ fontWeight: 600, color: 'text.secondary', mb: 2, display: 'block' }}>
              ブランチ & コミット
            </Typography>
            <Stack spacing={2}>
              <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircle sx={{ color: 'success.main', mr: 1.5, fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    main
                  </Typography>
                </Box>
              </Paper>
              <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2, borderLeft: 3, borderLeftColor: 'primary.main' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Initial commit
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date().toLocaleDateString('ja-JP')} • コミット #{commitId}
                </Typography>
              </Paper>
            </Stack>

            {/* 統計 */}
            <Typography variant="overline" sx={{ fontWeight: 600, color: 'text.secondary', mt: 3, mb: 2, display: 'block' }}>
              統計情報
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Paper elevation={0} sx={{ p: 2, textAlign: 'center', border: 1, borderColor: 'divider', borderRadius: 2, flex: 1 }}>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                  {slides.length || 1}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  スライド
                </Typography>
              </Paper>
              <Paper elevation={0} sx={{ p: 2, textAlign: 'center', border: 1, borderColor: 'divider', borderRadius: 2, flex: 1 }}>
                <Typography variant="h6" color="secondary" sx={{ fontWeight: 700 }}>
                  3
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  コメント
                </Typography>
              </Paper>
            </Box>
          </Box>
        </Paper>

        {/* 共通ツールバー - サムネイルとスライド表示の上に配置 */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* スライドナビツールバー */}
          <Paper elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', p: 2, bgcolor: alpha(theme.palette.background.paper, 0.8), backdropFilter: 'blur(10px)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Stack direction="row" spacing={1}>
                  <Tooltip title="前のスライド">
                    <span>
                      <IconButton onClick={goToPreviousSlide} disabled={currentSlideIndex <= 0} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) } }}>
                        <ChevronLeft />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Paper elevation={0} sx={{ px: 2, py: 1, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {currentSlideIndex + 1} / {slides.length || 1}
                    </Typography>
                  </Paper>
                  <Tooltip title="次のスライド">
                    <span>
                      <IconButton onClick={goToNextSlide} disabled={currentSlideIndex >= slides.length - 1} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) } }}>
                        <ChevronRight />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
                <Divider orientation="vertical" flexItem />
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" size="small" startIcon={<History />} onClick={handleViewHistory} sx={{ borderRadius: 2 }}>
                    履歴
                  </Button>
                  <Button variant="outlined" size="small" startIcon={<GitCompare />} onClick={handleViewXmlDiff} sx={{ borderRadius: 2 }}>
                    差分
                  </Button>
                </Stack>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <IconButton size="small" onClick={handleZoomOut}>
                  <ZoomOut />
                </IconButton>
                <Paper elevation={0} sx={{ px: 2, py: 0.5, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {zoomLevel}%
                  </Typography>
                </Paper>
                <IconButton size="small" onClick={handleZoomIn}>
                  <ZoomIn />
                </IconButton>
                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                <IconButton size="small">
                  <Fullscreen />
                </IconButton>
                <Button variant="contained" size="small" startIcon={<AccountTree />} sx={{ ml: 1, borderRadius: 2, background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})` }}>
                  Commit
                </Button>
              </Stack>
            </Box>
          </Paper>

          {/* サムネイルとスライド表示の水平レイアウト */}
          <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* サムネイル */}
            <SlideThumbnails commitId={commitId} activeSlideId={currentSlideId || undefined} onSelectSlide={handleSelectSlide} slides={slides} />

            {/* スライド表示 - 100%サイズに調整 */}
            <Box sx={{ flex: 1, overflow: 'auto', bgcolor: alpha(theme.palette.grey[50], 0.5), display: 'flex', flexDirection: 'column' }}>
              {/* スライド本体 - 100%幅で表示 */}
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, overflow: 'auto' }}>
                <Fade in timeout={300}>
                  <Paper sx={{ 
                    width: '100%', 
                    height: '100%',
                    maxHeight: 'calc(100vh - 200px)', // ヘッダーとツールバー分を引く
                    aspectRatio: '16/9', 
                    borderRadius: 3, 
                    overflow: 'hidden', 
                    position: 'relative', 
                    transform: `scale(${zoomLevel / 100})`, 
                    transition: 'transform 0.3s ease', 
                    boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.1)}` 
                  }} elevation={8}>
                {currentSlideId === sampleSlide.id ? (
                  <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 6, background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
                    <Typography variant="h2" sx={{ fontWeight: 800, mb: 3, textAlign: 'center' }}>
                      {sampleSlide.title}
                    </Typography>
                    <Box sx={{ width: 100, height: 4, bgcolor: 'primary.main', borderRadius: 2, mb: 4 }} />
                    <Typography variant="h5" color="text.secondary" sx={{ textAlign: 'center', mb: 8 }}>
                      Company Overview and Results
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ position: 'absolute', bottom: 24 }}>
                      {new Date().toLocaleDateString('ja-JP')}
                    </Typography>
                  </Box>
                ) : slides[currentSlideIndex] ? (
                  <Box sx={{ p: 4, height: '100%', position: 'relative', bgcolor: 'background.paper' }}>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 3 }}>
                      {slides[currentSlideIndex].title || 'タイトルなし'}
                    </Typography>
                    {slides[currentSlideIndex].content?.elements?.map((el: any, i: number) =>
                      el.type === 'text' ? (
                        <Typography
                          key={i}
                          sx={{
                            position: 'absolute',
                            left: `${el.x}px`,
                            top: `${el.y}px`,
                            color: el.style?.color || '#000',
                            fontSize: `${el.style?.fontSize || 16}px`,
                            fontWeight: el.style?.fontWeight || 'normal',
                          }}
                        >
                          {el.content}
                        </Typography>
                      ) : null
                    )}
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Typography color="text.secondary">スライドデータを読み込み中...</Typography>
                  </Box>
                )}
                  </Paper>
                </Fade>
              </Box>
            </Box>
          </Box>

          {/* ボトムパネル */}
          {showBottomPanel && (
            <Slide direction="up" in mountOnEnter unmountOnExit>
              <Paper sx={{ position: 'absolute', bottom: 0, width: '100%', height: panelHeight, borderTop: 1, borderColor: 'divider', borderTopLeftRadius: 12, borderTopRightRadius: 12, bgcolor: alpha(theme.palette.background.paper, 0.95), backdropFilter: 'blur(10px)' }} elevation={8}>
                <Box sx={{ height: 8, cursor: 'ns-resize', display: 'flex', justifyContent: 'center', alignItems: 'center', '&:hover .resize-handle': { bgcolor: 'primary.main', transform: 'scaleY(1.5)' } }} onMouseDown={handleResizeStart}>
                  <Box className="resize-handle" sx={{ width: 40, height: 4, bgcolor: 'divider', borderRadius: 2, transition: 'all 0.2s ease' }} />
                </Box>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2 }}>
                  <Tabs value={activeTab} onChange={handleTabChange} sx={{ '& .MuiTab-root': { minHeight: 48, textTransform: 'none', fontWeight: 500 } }}>
                    <Tab icon={<Comment />} label="コメント" iconPosition="start" />
                    <Tab icon={<History />} label="履歴" iconPosition="start" />
                    <Tab icon={<Lock />} label="ロック状況" iconPosition="start" />
                  </Tabs>
                  <Tooltip title="パネルを閉じる">
                    <IconButton onClick={() => setShowBottomPanel(false)} sx={{ color: 'text.secondary' }}>
                      <Close />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box sx={{ flex: 1, overflow: 'auto' }}>
                  <TabPanel value={activeTab} index={0}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        スライド {currentSlideIndex + 1} のコメント
                      </Typography>
                      <Button variant="contained" size="small" startIcon={<Comment />} sx={{ borderRadius: 2 }}>
                        新規コメント
                      </Button>
                    </Box>
                    <Stack spacing={2}>
                      <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                          このスライドにはまだコメントがありません。
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
                          右上のボタンから新しいコメントを追加できます。
                        </Typography>
                      </Paper>
                    </Stack>
                  </TabPanel>
                  <TabPanel value={activeTab} index={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        バージョン履歴
                      </Typography>
                      <Chip label={`最終更新: ${new Date().toLocaleDateString('ja-JP')}`} size="small" variant="outlined" />
                    </Box>
                    <Stack spacing={2}>
                      <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 2, borderLeft: 4, borderLeftColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            初期バージョン
                          </Typography>
                          <Chip label={new Date().toLocaleDateString('ja-JP')} size="small" color="primary" variant="outlined" />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          プレゼンテーションを作成しました。
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <Chip label={`コミット #${commitId}`} size="small" />
                          <Chip label="main" size="small" color="success" />
                        </Stack>
                      </Paper>
                      <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 2, bgcolor: alpha(theme.palette.grey[100], 0.5) }}>
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                          これ以前の履歴はありません
                        </Typography>
                      </Paper>
                    </Stack>
                  </TabPanel>
                  <TabPanel value={activeTab} index={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        ファイルロック状況
                      </Typography>
                      <Button variant="outlined" size="small" startIcon={<Lock />} sx={{ borderRadius: 2 }}>
                        現在のスライドをロック
                      </Button>
                    </Box>
                    <Stack spacing={2}>
                      <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <CheckCircle sx={{ color: 'success.main', mr: 2 }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            すべてのスライドが利用可能
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          現在ロックされているスライドはありません。他のユーザーが編集中の場合、ここに表示されます。
                        </Typography>
                      </Paper>
                      <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                          ロック機能について
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          • スライドをロックすると、他のユーザーは編集できなくなります<br />
                          • ロックは編集終了時に自動的に解除されます<br />
                          • 管理者はすべてのロックを解除できます
                        </Typography>
                      </Paper>
                    </Stack>
                  </TabPanel>
                </Box>
              </Paper>
            </Slide>
          )}
        </Box>
      </Box>
    </>
  );
}
