import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 言語タイプ
export type LanguageType = 'ja' | 'en';

// 翻訳データ型
export type TranslationType = {
  [key: string]: {
    [key in LanguageType]: string;
  };
};

// 翻訳データ
export const translations: TranslationType = {
  slides: {
    en: 'Slides',
    ja: 'スライド'
  },
  nextSlide: {
    en: 'Next Slide',
    ja: '次のスライド'
  },
  prevSlide: {
    en: 'Previous Slide',
    ja: '前のスライド'
  },
  slide: {
    en: 'Slide',
    ja: 'スライド'
  },
  xmlDiff: {
    en: 'XML Diff',
    ja: 'XMLの差分'
  },
  history: {
    en: 'History',
    ja: '履歴'
  },
  save: {
    en: 'Save',
    ja: '保存'
  },
  aspectRatio: {
    en: 'Aspect Ratio',
    ja: 'アスペクト比'
  },
  fullscreen: {
    en: 'Fullscreen',
    ja: '全画面表示'
  },
  language: {
    en: 'Language',
    ja: '言語'
  },
  untitledSlide: {
    en: 'Untitled Slide',
    ja: '無題のスライド'
  },
  resizePanel: {
    en: 'Resize panel',
    ja: 'パネルサイズを変更'
  },
  changeAspectRatio: {
    en: 'Change to',
    ja: 'アスペクト比を変更:'
  },
  branches: {
    en: 'Branches',
    ja: 'ブランチ'
  },
  commits: {
    en: 'Commits',
    ja: 'コミット'
  },
  backToEditor: {
    en: 'Back to Editor',
    ja: 'エディタに戻る'
  },
  uploadPPTX: {
    en: 'Upload PPTX',
    ja: 'PPTXをアップロード'
  },
  lightMode: {
    en: 'Light Mode',
    ja: 'ライトモード'
  },
  darkMode: {
    en: 'Dark Mode',
    ja: 'ダークモード'
  },
  share: {
    en: 'Share',
    ja: '共有'
  },
  sharePresentation: {
    en: 'Share Presentation',
    ja: 'プレゼンテーションを共有'
  },
  expiryDays: {
    en: 'Expiry',
    ja: '有効期限'
  },
  day: {
    en: 'Day',
    ja: '日'
  },
  days: {
    en: 'Days',
    ja: '日'
  },
  generating: {
    en: 'Generating link...',
    ja: 'リンクを生成中...'
  },
  copied: {
    en: 'Copied!',
    ja: 'コピーしました！'
  },
  urlCopied: {
    en: 'URL copied to clipboard',
    ja: 'URLをクリップボードにコピーしました'
  },
  shareError: {
    en: 'Sharing Failed',
    ja: '共有に失敗しました'
  },
  shareErrorDesc: {
    en: 'Could not generate a shareable link. Please try again.',
    ja: '共有リンクを生成できませんでした。もう一度お試しください。'
  },
  checkOutPresentation: {
    en: 'Check out this presentation',
    ja: 'このプレゼンテーションをご覧ください'
  }
};

// 言語コンテキストタイプ
interface LanguageContextType {
  language: LanguageType;
  setLanguage: (lang: LanguageType) => void;
  t: (key: string) => string;
}

// 言語コンテキスト
const LanguageContext = createContext<LanguageContextType | null>(null);

interface LanguageProviderProps {
  children: ReactNode;
}

// 言語プロバイダーコンポーネント
export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<LanguageType>('ja'); // デフォルトは日本語

  // ローカルストレージから言語設定を読み込む
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as LanguageType;
    if (savedLanguage && (savedLanguage === 'ja' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
    }
  }, []);

  // 言語設定を変更したときにローカルストレージに保存
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // 翻訳関数
  const t = (key: string): string => {
    if (translations[key] && translations[key][language]) {
      return translations[key][language];
    }
    
    // キーが見つからない場合は英語のキーを返すか、キー自体を返す
    return translations[key]?.['en'] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// 言語コンテキストを使用するためのフック
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};