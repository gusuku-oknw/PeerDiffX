import JSZip from 'jszip';

/**
 * PPTXファイルからXMLコンテンツを抽出するためのユーティリティ
 */

/**
 * PPTXファイル内の特定のXMLファイルを抽出して返す
 * @param file PPTX ファイルのバイナリデータ
 * @param xmlPath 抽出するXMLのファイルパス (例: 'ppt/slides/slide1.xml')
 * @returns XML文字列またはnull（抽出に失敗した場合）
 */
export async function extractXmlFromPptx(file: ArrayBuffer, xmlPath: string): Promise<string | null> {
  try {
    const zip = new JSZip();
    await zip.loadAsync(file);
    
    // 指定されたXMLファイルをチェック
    const xmlFile = zip.file(xmlPath);
    if (!xmlFile) {
      console.error(`指定されたXMLファイルが見つかりません: ${xmlPath}`);
      return null;
    }
    
    // XMLファイルの内容を文字列として抽出
    const content = await xmlFile.async('string');
    return content;
  } catch (error) {
    console.error('PPTXからXMLの抽出中にエラーが発生しました:', error);
    return null;
  }
}

/**
 * PPTXファイル内のすべてのスライドのXMLを抽出
 * @param file PPTX ファイルのバイナリデータ
 * @returns スライド番号とXML内容のマップ
 */
export async function extractAllSlides(file: ArrayBuffer): Promise<Map<number, string>> {
  try {
    const zip = new JSZip();
    await zip.loadAsync(file);
    
    const slides = new Map<number, string>();
    const slideRegex = /ppt\/slides\/slide(\d+)\.xml/;
    
    // すべてのファイルをループして、スライドXMLを探す
    for (const filePath in zip.files) {
      const match = filePath.match(slideRegex);
      if (match) {
        const slideNumber = parseInt(match[1]);
        const slideFile = zip.file(filePath);
        if (slideFile) {
          const content = await slideFile.async('string');
          slides.set(slideNumber, content);
        }
      }
    }
    
    return slides;
  } catch (error) {
    console.error('PPTXからスライドの抽出中にエラーが発生しました:', error);
    return new Map();
  }
}

/**
 * PPTXファイル内のプレゼンテーション構造情報を抽出
 * @param file PPTX ファイルのバイナリデータ
 * @returns プレゼンテーション情報のオブジェクト
 */
export async function extractPresentationInfo(file: ArrayBuffer): Promise<{
  title: string;
  slidesCount: number;
  hasNotes: boolean;
  createdAt?: string;
  lastModifiedBy?: string;
}> {
  try {
    const zip = new JSZip();
    await zip.loadAsync(file);
    
    // presentation.xmlを抽出
    const presentationXml = zip.file('ppt/presentation.xml');
    let title = 'Untitled Presentation';
    let slidesCount = 0;
    let hasNotes = false;
    
    if (presentationXml) {
      const content = await presentationXml.async('string');
      
      // スライド数を抽出
      const slideCountMatch = content.match(/<p:sldId[^>]*>/g);
      slidesCount = slideCountMatch ? slideCountMatch.length : 0;
      
      // タイトルはcore.xmlから取得
      const coreXml = zip.file('docProps/core.xml');
      if (coreXml) {
        const coreContent = await coreXml.async('string');
        const titleMatch = coreContent.match(/<dc:title>(.*?)<\/dc:title>/);
        if (titleMatch && titleMatch[1]) {
          title = titleMatch[1];
        }
        
        // 作成日時
        const createdMatch = coreContent.match(/<dcterms:created>(.*?)<\/dcterms:created>/);
        const createdAt = createdMatch ? createdMatch[1] : undefined;
        
        // 最終更新者
        const lastModMatch = coreContent.match(/<cp:lastModifiedBy>(.*?)<\/cp:lastModifiedBy>/);
        const lastModifiedBy = lastModMatch ? lastModMatch[1] : undefined;
        
        return {
          title,
          slidesCount,
          hasNotes,
          createdAt,
          lastModifiedBy
        };
      }
    }
    
    // ノートスライドの存在確認
    const notesMasterXml = zip.file('ppt/notesMasters/notesMaster1.xml');
    hasNotes = !!notesMasterXml;
    
    return {
      title,
      slidesCount,
      hasNotes
    };
  } catch (error) {
    console.error('プレゼンテーション情報の抽出中にエラーが発生しました:', error);
    return {
      title: 'Error extracting presentation',
      slidesCount: 0,
      hasNotes: false
    };
  }
}

/**
 * PPTXファイル内のテーマとスタイル情報を抽出
 * @param file PPTX ファイルのバイナリデータ
 * @returns テーマ情報オブジェクト
 */
export async function extractThemeInfo(file: ArrayBuffer): Promise<{
  themeName?: string;
  colorScheme?: {[key: string]: string};
  fontScheme?: {[key: string]: string};
}> {
  try {
    const zip = new JSZip();
    await zip.loadAsync(file);
    
    // テーマXMLファイルを抽出
    const themeXml = zip.file('ppt/theme/theme1.xml');
    if (!themeXml) {
      return {};
    }
    
    const content = await themeXml.async('string');
    
    // テーマ名を抽出
    const themeNameMatch = content.match(/name="([^"]+)"/);
    const themeName = themeNameMatch ? themeNameMatch[1] : undefined;
    
    // カラースキームを抽出
    const colorScheme: {[key: string]: string} = {};
    const colorMatches = content.matchAll(/<a:([a-zA-Z0-9]+)>\s*<a:srgbClr\s+val="([^"]+)"/g);
    for (const match of colorMatches) {
      if (match[1] && match[2]) {
        colorScheme[match[1]] = `#${match[2]}`;
      }
    }
    
    // フォントスキームを抽出
    const fontScheme: {[key: string]: string} = {};
    const fontMatches = content.matchAll(/<a:([a-zA-Z]+)>\s*<a:latin\s+typeface="([^"]+)"/g);
    for (const match of fontMatches) {
      if (match[1] && match[2]) {
        fontScheme[match[1]] = match[2];
      }
    }
    
    return {
      themeName,
      colorScheme,
      fontScheme
    };
  } catch (error) {
    console.error('テーマ情報の抽出中にエラーが発生しました:', error);
    return {};
  }
}