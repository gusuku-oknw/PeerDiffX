import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button } from '@mui/material';
import { FaTrophy, FaMedal, FaAward, FaDollarSign, FaUsers } from 'react-icons/fa';

interface IncentiveData {
  tier: 'gold' | 'silver' | 'bronze';
  studentCount: number;
  bonusPerStudent: number;
  totalBonus: number;
  paidAmount: number;
  unpaidAmount: number;
}

const incentiveData: IncentiveData[] = [
  {
    tier: 'gold',
    studentCount: 5,
    bonusPerStudent: 10000,
    totalBonus: 50000,
    paidAmount: 30000,
    unpaidAmount: 20000
  },
  {
    tier: 'silver',
    studentCount: 12,
    bonusPerStudent: 5000,
    totalBonus: 60000,
    paidAmount: 45000,
    unpaidAmount: 15000
  },
  {
    tier: 'bronze',
    studentCount: 23,
    bonusPerStudent: 2000,
    totalBonus: 46000,
    paidAmount: 46000,
    unpaidAmount: 0
  }
];

export function IncentiveManagementPanel() {
  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'gold': return <FaTrophy className="text-yellow-500" />;
      case 'silver': return <FaMedal className="text-gray-400" />;
      case 'bronze': return <FaAward className="text-orange-600" />;
      default: return null;
    }
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'gold': return 'ゴールド';
      case 'silver': return 'シルバー';
      case 'bronze': return 'ブロンズ';
      default: return tier;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'gold': return 'warning';
      case 'silver': return 'default';
      case 'bronze': return 'secondary';
      default: return 'default';
    }
  };

  const totalStudents = incentiveData.reduce((sum, data) => sum + data.studentCount, 0);
  const totalBonusAmount = incentiveData.reduce((sum, data) => sum + data.totalBonus, 0);
  const totalUnpaidAmount = incentiveData.reduce((sum, data) => sum + data.unpaidAmount, 0);

  return (
    <Box>
      {/* ヘッダー */}
      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
        <FaTrophy className="text-yellow-500" />
        インセンティブ管理
      </Typography>

      {/* 概要統計 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
        <Paper elevation={0} sx={{ p: 1.5, textAlign: 'center', border: 1, borderColor: 'divider' }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <FaUsers />
            {totalStudents}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            対象学生
          </Typography>
        </Paper>
        <Paper elevation={0} sx={{ p: 1.5, textAlign: 'center', border: 1, borderColor: 'divider' }}>
          <Typography variant="h6" color="error" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <FaDollarSign />
            {totalUnpaidAmount.toLocaleString()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            未支給額
          </Typography>
        </Paper>
      </Box>

      {/* 詳細テーブル */}
      <TableContainer component={Paper} elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ランク</TableCell>
              <TableCell align="center">学生数</TableCell>
              <TableCell align="right">単価</TableCell>
              <TableCell align="right">未支給額</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {incentiveData.map((data) => (
              <TableRow key={data.tier}>
                <TableCell>
                  <Chip
                    icon={getTierIcon(data.tier)}
                    label={getTierLabel(data.tier)}
                    size="small"
                    color={getTierColor(data.tier) as any}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {data.studentCount}人
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">
                    ¥{data.bonusPerStudent.toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600,
                      color: data.unpaidAmount > 0 ? 'error.main' : 'success.main'
                    }}
                  >
                    ¥{data.unpaidAmount.toLocaleString()}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* アクションボタン */}
      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
        <Button
          variant="contained"
          size="small"
          fullWidth
          disabled={totalUnpaidAmount === 0}
          sx={{ textTransform: 'none' }}
        >
          一括支払い処理
        </Button>
        <Button
          variant="outlined"
          size="small"
          fullWidth
          sx={{ textTransform: 'none' }}
        >
          詳細レポート
        </Button>
      </Box>
    </Box>
  );
}