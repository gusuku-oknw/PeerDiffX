import { DOMParser } from '@xmldom/xmldom';
import * as diff from 'diff';
import { SlideElement, DiffContent } from '@shared/schema';

/**
 * PowerPoint XMLの高度な差分解析ツール
 * スライド要素レベルの意味のある変更を抽出します
 */

interface XMLDiffOptions {
  ignoreWhitespace?: boolean;
  ignoreAttributes?: string[];
  ignoreNamespaces?: boolean;
  semanticGrouping?: boolean;
}

/**
 * 2つのXML文字列の間の意味のある差分を抽出します
 */
export function generateAdvancedXMLDiff(oldXml: string, newXml: string, options: XMLDiffOptions = {}): string {
  const { 
    ignoreWhitespace = true, 
    ignoreAttributes = ['xml:space', 'xml:id', 'modId'],
    ignoreNamespaces = false,
    semanticGrouping = true
  } = options;

  try {
    // XMLをDOMにパース
    const oldDoc = new DOMParser().parseFromString(oldXml, 'text/xml');
    const newDoc = new DOMParser().parseFromString(newXml, 'text/xml');

    // 前処理：XML形式の正規化、無視する内容の削除
    const normalizedOldXml = normalizeXml(oldDoc, { ignoreWhitespace, ignoreAttributes, ignoreNamespaces });
    const normalizedNewXml = normalizeXml(newDoc, { ignoreWhitespace, ignoreAttributes, ignoreNamespaces });

    // 行ベースの差分生成
    const changes = diff.createPatch(
      'slide.xml',
      normalizedOldXml,
      normalizedNewXml,
      '前バージョン',
      '現バージョン'
    );

    // オプション：関連する変更の意味的なグループ化
    return semanticGrouping ? enhanceDiffWithSemanticGrouping(changes) : changes;
  } catch (error) {
    console.error('高度なXML差分の生成中にエラーが発生しました:', error);
    return `差分の生成中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`;
  }
}

/**
 * より意味のある比較のためのXMLの正規化
 */
function normalizeXml(doc: Document, options: XMLDiffOptions): string {
  // XMLSerializerがなければシミュレート
  const serializer = new XMLSerializer();
  
  // 深いクローンを作成して元のドキュメントを変更しないようにする
  const clonedDoc = doc.cloneNode(true) as Document;
  
  // ノードを再帰的に処理する関数
  function processNode(node: Node): void {
    // テキストノードの場合は空白を処理
    if (node.nodeType === Node.TEXT_NODE && options.ignoreWhitespace) {
      const textNode = node as Text;
      if (textNode.nodeValue) {
        textNode.nodeValue = textNode.nodeValue.trim().replace(/\s+/g, ' ');
        if (textNode.nodeValue === '') {
          textNode.nodeValue = null;
        }
      }
    }
    
    // 要素ノードの場合
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      
      // 属性の処理
      if (options.ignoreAttributes && options.ignoreAttributes.length > 0) {
        for (const attr of options.ignoreAttributes) {
          element.removeAttribute(attr);
        }
      }
      
      // 名前空間の処理（無視する場合）
      if (options.ignoreNamespaces) {
        // ここでは単純化のため、詳細な名前空間処理は省略
        // 実際の実装では適切なXML名前空間ライブラリを使用する必要がある
      }
      
      // 子ノードを再帰的に処理
      for (let i = 0; i < node.childNodes.length; i++) {
        processNode(node.childNodes[i]);
      }
    }
  }
  
  // ルートから処理を開始
  if (clonedDoc.documentElement) {
    processNode(clonedDoc.documentElement);
  }
  
  // 文字列にシリアライズして返す
  return serializer.serializeToString(clonedDoc);
}

/**
 * 関連する変更の意味的なグループ化による差分出力の強化
 */
function enhanceDiffWithSemanticGrouping(diffOutput: string): string {
  // 差分を行に分割
  const lines = diffOutput.split('\n');
  const enhancedLines: string[] = [];
  
  // 意味的なグループ（スライド要素、テキストランなど）を識別
  let inGroup = false;
  let currentGroup: string[] = [];
  let groupType = '';
  
  for (const line of lines) {
    // PPTXのXML構造に基づいて意味的なグループの開始を検出
    const isSlideElementStart = line.includes('<p:sp') || line.includes('<p:pic') || line.includes('<p:graphicFrame');
    const isTextRunStart = line.includes('<a:r>');
    const isShapePropsStart = line.includes('<p:spPr>');
    
    if ((line.startsWith('+') || line.startsWith('-')) && 
        (isSlideElementStart || isTextRunStart || isShapePropsStart)) {
      
      // すでにグループ内にいる場合は、まずそれをフラッシュ
      if (inGroup) {
        enhancedLines.push(`--- ${groupType}の変更開始 ---`);
        enhancedLines.push(...currentGroup);
        enhancedLines.push(`--- ${groupType}の変更終了 ---`);
        enhancedLines.push('');
      }
      
      // 新しいグループを開始
      inGroup = true;
      currentGroup = [line];
      
      if (isSlideElementStart) groupType = 'スライド要素';
      else if (isTextRunStart) groupType = 'テキスト';
      else if (isShapePropsStart) groupType = '図形プロパティ';
      
      continue;
    }
    
    if (inGroup && (line.startsWith('+') || line.startsWith('-') || line.startsWith(' '))) {
      // 現在のグループに追加
      currentGroup.push(line);
    } else {
      // グループの終了または差分以外の行
      if (inGroup) {
        enhancedLines.push(`--- ${groupType}の変更開始 ---`);
        enhancedLines.push(...currentGroup);
        enhancedLines.push(`--- ${groupType}の変更終了 ---`);
        enhancedLines.push('');
        
        inGroup = false;
        currentGroup = [];
      }
      
      enhancedLines.push(line);
    }
  }
  
  // 残りのグループがあれば処理
  if (inGroup) {
    enhancedLines.push(`--- ${groupType}の変更開始 ---`);
    enhancedLines.push(...currentGroup);
    enhancedLines.push(`--- ${groupType}の変更終了 ---`);
  }
  
  return enhancedLines.join('\n');
}

/**
 * スライドコンテンツの構造化された意味的な差分を生成
 */
export function generateStructuredDiff(oldXml: string, newXml: string): DiffContent {
  try {
    // XMLをDOMにパース
    const oldDoc = new DOMParser().parseFromString(oldXml, 'text/xml');
    const newDoc = new DOMParser().parseFromString(newXml, 'text/xml');
    
    // 両方のバージョンからスライド要素を抽出
    const oldElements = extractSlideElements(oldDoc);
    const newElements = extractSlideElements(newDoc);
    
    // 比較して構造化された差分を生成
    return compareSlideElements(oldElements, newElements);
  } catch (error) {
    console.error('構造化差分の生成中にエラーが発生しました:', error);
    return { added: [], deleted: [], modified: [] };
  }
}

/**
 * XMLドキュメントからスライド要素を抽出
 */
function extractSlideElements(doc: Document): SlideElement[] {
  const elements: SlideElement[] = [];
  
  // シンプル実装のため、一般的なケースのみ処理
  // 実際のアプリでは、PPTXの構造に特化したより複雑な解析ロジックが必要
  
  // 図形要素（p:sp）の抽出
  const shapes = doc.getElementsByTagName('p:sp');
  for (let i = 0; i < shapes.length; i++) {
    const shape = shapes[i];
    
    // 要素IDの抽出
    const nvSpPr = shape.getElementsByTagName('p:nvSpPr')[0];
    const cNvPr = nvSpPr?.getElementsByTagName('p:cNvPr')[0];
    const id = cNvPr?.getAttribute('id') || `generated-${i}`;
    
    // 位置とサイズの抽出
    const spPr = shape.getElementsByTagName('p:spPr')[0];
    const xfrm = spPr?.getElementsByTagName('a:xfrm')[0];
    const off = xfrm?.getElementsByTagName('a:off')[0];
    const ext = xfrm?.getElementsByTagName('a:ext')[0];
    
    const x = parseInt(off?.getAttribute('x') || '0', 10);
    const y = parseInt(off?.getAttribute('y') || '0', 10);
    const width = parseInt(ext?.getAttribute('cx') || '0', 10);
    const height = parseInt(ext?.getAttribute('cy') || '0', 10);
    
    // テキスト内容の抽出
    const txBody = shape.getElementsByTagName('p:txBody')[0];
    let content = '';
    if (txBody) {
      const paragraphs = txBody.getElementsByTagName('a:p');
      for (let j = 0; j < paragraphs.length; j++) {
        const paragraph = paragraphs[j];
        const runs = paragraph.getElementsByTagName('a:r');
        for (let k = 0; k < runs.length; k++) {
          const run = runs[k];
          const textElements = run.getElementsByTagName('a:t');
          for (let l = 0; l < textElements.length; l++) {
            content += textElements[l].textContent || '';
          }
        }
        if (j < paragraphs.length - 1) {
          content += '\n';
        }
      }
    }
    
    elements.push({
      id,
      type: 'text',
      x,
      y,
      width,
      height,
      content
    });
  }
  
  // 画像要素（p:pic）の抽出
  const pictures = doc.getElementsByTagName('p:pic');
  for (let i = 0; i < pictures.length; i++) {
    const picture = pictures[i];
    
    // 要素IDの抽出
    const nvPicPr = picture.getElementsByTagName('p:nvPicPr')[0];
    const cNvPr = nvPicPr?.getElementsByTagName('p:cNvPr')[0];
    const id = cNvPr?.getAttribute('id') || `pic-${i}`;
    
    // 位置とサイズの抽出
    const spPr = picture.getElementsByTagName('p:spPr')[0];
    const xfrm = spPr?.getElementsByTagName('a:xfrm')[0];
    const off = xfrm?.getElementsByTagName('a:off')[0];
    const ext = xfrm?.getElementsByTagName('a:ext')[0];
    
    const x = parseInt(off?.getAttribute('x') || '0', 10);
    const y = parseInt(off?.getAttribute('y') || '0', 10);
    const width = parseInt(ext?.getAttribute('cx') || '0', 10);
    const height = parseInt(ext?.getAttribute('cy') || '0', 10);
    
    // 画像名/説明の抽出
    const name = cNvPr?.getAttribute('name') || '';
    
    elements.push({
      id,
      type: 'image',
      x,
      y,
      width,
      height,
      content: name
    });
  }
  
  // 表やグラフなど、他の要素タイプも同様に抽出が可能
  
  return elements;
}

/**
 * スライド要素を比較して構造化された差分を生成
 */
function compareSlideElements(oldElements: SlideElement[], newElements: SlideElement[]): DiffContent {
  const result: DiffContent = {
    added: [],
    deleted: [],
    modified: []
  };
  
  // より高速な検索のためのマップを作成
  const oldElementMap = new Map<string, SlideElement>();
  const newElementMap = new Map<string, SlideElement>();
  
  oldElements.forEach(element => oldElementMap.set(element.id, element));
  newElements.forEach(element => newElementMap.set(element.id, element));
  
  // 削除された要素を見つける
  oldElements.forEach(oldElement => {
    if (!newElementMap.has(oldElement.id)) {
      result.deleted.push(oldElement);
    }
  });
  
  // 追加および変更された要素を見つける
  newElements.forEach(newElement => {
    if (!oldElementMap.has(newElement.id)) {
      result.added.push(newElement);
    } else {
      const oldElement = oldElementMap.get(newElement.id)!;
      
      // 変更の確認
      if (
        oldElement.x !== newElement.x ||
        oldElement.y !== newElement.y ||
        oldElement.width !== newElement.width ||
        oldElement.height !== newElement.height ||
        oldElement.content !== newElement.content ||
        oldElement.type !== newElement.type
      ) {
        result.modified.push({
          before: oldElement,
          after: newElement
        });
      }
    }
  });
  
  return result;
}

/**
 * XMLの差分をMarkdownに変換して、より読みやすい形式で表示
 */
export function xmlDiffToMarkdown(xmlDiff: string): string {
  // 差分の行を分割
  const lines = xmlDiff.split('\n');
  const markdownLines: string[] = [];
  
  let inHunk = false;
  let currentSection = '';
  
  // ヘッダー情報をスキップし、変更内容のみを処理
  for (const line of lines) {
    // 差分チャンクのヘッダー行を検出
    if (line.startsWith('@@')) {
      inHunk = true;
      // チャンク情報を簡略化して追加
      markdownLines.push('```diff');
      markdownLines.push(line);
      continue;
    }
    
    if (inHunk) {
      // 意味的なグループ化のマーカーを検出
      if (line.startsWith('--- ') && line.includes('の変更開始')) {
        currentSection = line.replace('--- ', '### ').replace(' ---', '');
        markdownLines.push('```');  // 前のコードブロックを閉じる
        markdownLines.push('');
        markdownLines.push(currentSection);
        markdownLines.push('');
        markdownLines.push('```diff');
        continue;
      }
      
      if (line.startsWith('--- ') && line.includes('の変更終了')) {
        currentSection = '';
        markdownLines.push('```');  // コードブロックを閉じる
        markdownLines.push('');
        continue;
      }
      
      // 通常の差分行
      if (line.startsWith('+')) {
        // 追加行
        markdownLines.push(line);
      } else if (line.startsWith('-')) {
        // 削除行
        markdownLines.push(line);
      } else if (line.startsWith(' ')) {
        // コンテキスト行（省略可能）
        markdownLines.push(line);
      } else if (line === '') {
        // 空行
        markdownLines.push(line);
      }
    }
  }
  
  // 最後のコードブロックが閉じられていない場合は閉じる
  if (inHunk && !markdownLines[markdownLines.length - 1].includes('```')) {
    markdownLines.push('```');
  }
  
  return markdownLines.join('\n');
}

/**
 * 構造化差分をMarkdownに変換
 */
export function structuredDiffToMarkdown(diffContent: DiffContent): string {
  const md: string[] = ['# スライド変更の概要'];
  
  // 追加された要素
  if (diffContent.added.length > 0) {
    md.push('\n## 追加された要素');
    diffContent.added.forEach((element, index) => {
      md.push(`\n### 追加 ${index + 1}: ${element.type} 要素`);
      md.push('```json');
      md.push(JSON.stringify(element, null, 2));
      md.push('```');
      
      if (element.type === 'text' && element.content) {
        md.push('\n**テキスト内容:**');
        md.push('```');
        md.push(element.content);
        md.push('```');
      }
    });
  }
  
  // 削除された要素
  if (diffContent.deleted.length > 0) {
    md.push('\n## 削除された要素');
    diffContent.deleted.forEach((element, index) => {
      md.push(`\n### 削除 ${index + 1}: ${element.type} 要素`);
      md.push('```json');
      md.push(JSON.stringify(element, null, 2));
      md.push('```');
      
      if (element.type === 'text' && element.content) {
        md.push('\n**テキスト内容:**');
        md.push('```');
        md.push(element.content);
        md.push('```');
      }
    });
  }
  
  // 変更された要素
  if (diffContent.modified.length > 0) {
    md.push('\n## 変更された要素');
    diffContent.modified.forEach((mod, index) => {
      md.push(`\n### 変更 ${index + 1}: ${mod.before.type} 要素`);
      md.push('**変更前:**');
      md.push('```json');
      md.push(JSON.stringify(mod.before, null, 2));
      md.push('```');
      
      md.push('**変更後:**');
      md.push('```json');
      md.push(JSON.stringify(mod.after, null, 2));
      md.push('```');
      
      if (mod.before.type === 'text' && mod.after.type === 'text') {
        md.push('\n**テキスト変更:**');
        if (mod.before.content !== mod.after.content) {
          md.push('```diff');
          md.push(`- ${mod.before.content}`);
          md.push(`+ ${mod.after.content}`);
          md.push('```');
        }
      }
    });
  }
  
  return md.join('\n');
}