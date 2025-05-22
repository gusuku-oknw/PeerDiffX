import { useState } from 'react';
import { Box, Tabs, Tab, Checkbox, FormControlLabel, Typography, Button, Divider } from '@mui/material';
import { FaClipboardList, FaLightbulb, FaChartLine, FaPalette, FaUsers } from 'react-icons/fa';

interface CommentTemplate {
  id: string;
  category: string;
  items: string[];
  icon: React.ReactNode;
}

interface CommentTemplatesProps {
  onTemplateSelect: (text: string) => void;
  onChecklistUpdate: (completedItems: string[]) => void;
}

const templates: CommentTemplate[] = [
  {
    id: 'content',
    category: 'コンテンツ',
    icon: <FaClipboardList className="text-blue-500" />,
    items: [
      'メッセージが明確で理解しやすい',
      '論理的な流れになっている',
      '重要なポイントが強調されている',
      '具体例やデータが適切に使用されている',
      '結論が明確に示されている'
    ]
  },
  {
    id: 'design',
    category: 'デザイン',
    icon: <FaPalette className="text-purple-500" />,
    items: [
      'レイアウトが整理されている',
      'フォントサイズが適切である',
      '色使いが効果的である',
      '画像やグラフが見やすい',
      'ブランドイメージと一致している'
    ]
  },
  {
    id: 'delivery',
    category: '伝達力',
    icon: <FaUsers className="text-green-500" />,
    items: [
      'ターゲット層に適した内容である',
      '専門用語の説明が十分である',
      'ストーリー性がある',
      '感情に訴える要素がある',
      'アクションを促す内容である'
    ]
  },
  {
    id: 'data',
    category: 'データ・分析',
    icon: <FaChartLine className="text-orange-500" />,
    items: [
      'データの信頼性が高い',
      'グラフが分かりやすい',
      '比較が適切である',
      'トレンドが明確に示されている',
      '数値の根拠が明記されている'
    ]
  }
];

export function CommentTemplates({ onTemplateSelect, onChecklistUpdate }: CommentTemplatesProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [checkedItems, setCheckedItems] = useState<Record<string, string[]>>({});

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleCheckboxChange = (categoryId: string, item: string, checked: boolean) => {
    setCheckedItems(prev => {
      const categoryItems = prev[categoryId] || [];
      const updatedItems = checked 
        ? [...categoryItems, item]
        : categoryItems.filter(i => i !== item);
      
      const newCheckedItems = { ...prev, [categoryId]: updatedItems };
      
      // 全体のチェック済みアイテムを更新
      const allCheckedItems = Object.values(newCheckedItems).flat();
      onChecklistUpdate(allCheckedItems);
      
      return newCheckedItems;
    });
  };

  const generateComment = (categoryId: string) => {
    const template = templates.find(t => t.id === categoryId);
    const checkedInCategory = checkedItems[categoryId] || [];
    
    if (!template || checkedInCategory.length === 0) return;

    const positiveItems = checkedInCategory;
    const uncheckedItems = template.items.filter(item => !checkedInCategory.includes(item));
    
    let comment = `【${template.category}について】\n\n`;
    
    if (positiveItems.length > 0) {
      comment += `✅ 良い点:\n${positiveItems.map(item => `• ${item}`).join('\n')}\n\n`;
    }
    
    if (uncheckedItems.length > 0) {
      comment += `📝 改善提案:\n${uncheckedItems.slice(0, 2).map(item => `• ${item}をより強化できると良いでしょう`).join('\n')}`;
    }
    
    onTemplateSelect(comment);
  };

  const currentTemplate = templates[activeTab];
  const currentChecked = checkedItems[currentTemplate?.id] || [];

  return (
    <Box sx={{ width: '100%' }}>
      {/* タブヘッダー */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
      >
        {templates.map((template, index) => (
          <Tab
            key={template.id}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {template.icon}
                <Typography variant="body2">{template.category}</Typography>
              </Box>
            }
            sx={{ textTransform: 'none', minHeight: 48 }}
          />
        ))}
      </Tabs>

      {/* タブコンテンツ */}
      {currentTemplate && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            {currentTemplate.category}の評価項目
          </Typography>
          
          {currentTemplate.items.map((item, index) => (
            <FormControlLabel
              key={index}
              control={
                <Checkbox
                  checked={currentChecked.includes(item)}
                  onChange={(e) => handleCheckboxChange(currentTemplate.id, item, e.target.checked)}
                  size="small"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                  {item}
                </Typography>
              }
              sx={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                mb: 1,
                '& .MuiFormControlLabel-label': {
                  lineHeight: 1.4,
                  mt: 0.25
                }
              }}
            />
          ))}
          
          <Divider sx={{ my: 2 }} />
          
          {/* アクションボタン */}
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Typography variant="caption" color="text.secondary" sx={{ flex: 1, alignSelf: 'center' }}>
              チェックした項目からコメントを生成
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => generateComment(currentTemplate.id)}
              disabled={currentChecked.length === 0}
              sx={{ textTransform: 'none' }}
            >
              コメント生成
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}