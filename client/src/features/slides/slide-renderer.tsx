import React from 'react';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card } from "@/components/ui/card";

/**
 * Type definition for a slide
 */
export interface Slide {
  id: number;
  commitId: number;
  slideNumber: number;
  title: string | null;
  content: any; // This is a JSON object in the database
  xmlContent: string | null;
  thumbnail: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Renders the content of a slide
 * @param slide The slide object to render
 * @returns JSX element with rendered slide content
 */
// This component will be our main export for rendering slide content
export function SlideContent({ slide }: { slide: Slide }): JSX.Element {
  // Safety check - make sure slide is defined
  if (!slide) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="text-muted-foreground">スライドが読み込めませんでした</div>
      </div>
    );
  }

  // First try to render using XML content if available
  if (slide.xmlContent) {
    return <XmlSlideRenderer slide={slide} />;
  }

  // Fallback to structured content
  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <h2 className="text-2xl font-bold mb-4">{slide.title || `スライド ${slide.slideNumber}`}</h2>
      {slide.content && (
        <div className="text-base max-w-full overflow-hidden">
          {typeof slide.content === 'string' 
            ? slide.content 
            : renderStructuredContent(slide.content)}
        </div>
      )}
      {(!slide.content || (typeof slide.content === 'object' && Object.keys(slide.content).length === 0)) && !slide.title && (
        <div className="text-muted-foreground">No content available</div>
      )}
    </div>
  );
}

// Helper function to render structured content from our database format
function renderStructuredContent(content: any): JSX.Element {
  try {
    // Check if it's our expected slide content format with elements
    if (content.elements && Array.isArray(content.elements)) {
      return (
        <div 
          className="slide-structured-content relative w-full h-full" 
          style={{ 
            background: content.background || '#ffffff',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {content.elements.map((element: any, index: number) => (
            <div 
              key={element.id || index}
              className="slide-element"
              style={{
                position: 'absolute',
                top: `${element.y}px`,
                left: `${element.x}px`,
                width: `${element.width}px`,
                height: `${element.height}px`,
                ...(element.style || {})
              }}
            >
              {element.type === 'text' && (
                <div style={{ 
                  overflow: 'hidden', 
                  width: '100%', 
                  height: '100%',
                  fontSize: element.style?.fontSize || 'inherit',
                  fontWeight: element.style?.fontWeight || 'inherit',
                  color: element.style?.color || 'inherit',
                  textAlign: element.style?.textAlign || 'inherit',
                }}>
                  {element.content}
                </div>
              )}
              {element.type === 'image' && element.src && (
                <img 
                  src={element.src} 
                  alt={element.alt || ''} 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'contain' 
                  }} 
                />
              )}
              {element.type === 'shape' && (
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: element.style?.backgroundColor || 'transparent',
                  borderRadius: element.style?.borderRadius || '0',
                  border: element.style?.border,
                  opacity: element.style?.opacity,
                  transform: element.style?.transform
                }}>
                  {element.content && (
                    <div style={{ 
                      padding: '8px',
                      color: element.style?.color || 'inherit'
                    }}>
                      {element.content}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    } 
    
    // Fallback for other formats
    return (
      <div className="p-4">
        <div className="p-3 rounded bg-muted/50 overflow-auto max-h-[400px]">
          <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(content, null, 2)}</pre>
        </div>
      </div>
    );
  } catch (error: any) {
    console.error('Error rendering structured content:', error);
    return (
      <div className="p-4">
        <div className="p-3 rounded bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300">
          Error rendering slide content: {error.message}
        </div>
      </div>
    );
  }
}

/**
 * Component that renders XML content of a slide
 */
interface XmlSlideRendererProps {
  slide: Slide;
}

export function XmlSlideRenderer({ slide }: XmlSlideRendererProps): JSX.Element {
  // Improved renderer for XML content with better handling
  return (
    <div className="p-4 h-full overflow-hidden">
      {slide.title && <h2 className="text-xl font-bold mb-4">{slide.title}</h2>}
      
      {slide.xmlContent ? (
        <div 
          className="slide-xml-content overflow-hidden h-full"
          dangerouslySetInnerHTML={{ 
            __html: createSlideSafely(slide.xmlContent) 
          }} 
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-muted-foreground text-center">
            <p className="mb-2">スライド {slide.slideNumber}</p>
            <p className="text-sm">XMLコンテンツが利用できません</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Creates a safe HTML representation of the XML content
 */
/**
 * Creates a safe HTML representation of the XML content from PowerPoint slides
 */
function createSlideSafely(xmlContent: string): string {
  try {
    if (!xmlContent || xmlContent.trim().length === 0) {
      return '<div class="text-muted-foreground text-center">XMLコンテンツが空です</div>';
    }
    
    // Replace potentially dangerous tags with safe versions
    const sanitizedContent = xmlContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<link\b[^<]*>/gi, '')
      .replace(/<meta\b[^<]*>/gi, '');
    
    // Extract text content from XML for simple display
    let displayContent = '';
    
    // Try to extract text from PowerPoint XML format - look for text within a:t tags
    const textMatches = sanitizedContent.match(/<a:t>(.*?)<\/a:t>/g);
    
    if (textMatches && textMatches.length > 0) {
      // Extract and format text content
      const extractedTexts = extractTextFromPowerPoint(textMatches);
      displayContent = extractedTexts;
    } else {
      // Fallback to raw XML content with formatting
      displayContent = `<pre class="text-sm overflow-auto max-h-full whitespace-pre-wrap">${sanitizedContent}</pre>`;
    }
    
    // Add wrapper with styling
    return `
      <div class="slide-content h-full overflow-y-auto p-4">
        <style>
          .slide-content { font-family: system-ui, -apple-system, sans-serif; color: inherit; }
          .slide-content p { margin-bottom: 0.8em; line-height: 1.6; }
          .slide-content h3 { margin-top: 1em; margin-bottom: 0.5em; }
          .slide-content pre { font-size: 0.8rem; line-height: 1.4; }
        </style>
        <div class="max-w-3xl mx-auto">
          ${displayContent}
        </div>
      </div>
    `;
  } catch (error: any) {
    console.error('Error processing XML content:', error);
    return `<div class="text-red-500 p-4">Error processing slide content: ${error.message}</div>`;
  }
}

/**
 * Extracts and formats text from PowerPoint XML matches
 */
function extractTextFromPowerPoint(textMatches: RegExpMatchArray): string {
  const currentParagraph: string[] = [];
  const paragraphs: string[] = [];
  
  // Process each text match
  textMatches.forEach(match => {
    const text = match.replace(/<a:t>(.*?)<\/a:t>/g, '$1');
    
    // If text contains Japanese characters, it might be a title
    const hasJapanese = /[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\uFF00-\uFFEF\u4E00-\u9FAF\u3400-\u4DBF]/.test(text);
    
    if (text.trim().length > 0) {
      if (hasJapanese && text.length < 30) {
        // Finish current paragraph if any
        if (currentParagraph.length > 0) {
          paragraphs.push(currentParagraph.join(' '));
          currentParagraph.length = 0; // Clear array
        }
        // Add this as a heading
        paragraphs.push(`<h3 class="text-xl font-semibold my-3">${text}</h3>`);
      } else {
        currentParagraph.push(text);
      }
    } else if (currentParagraph.length > 0) {
      // Empty text might be a paragraph break
      paragraphs.push(currentParagraph.join(' '));
      currentParagraph.length = 0; // Clear array
    }
  });
  
  // Add any remaining paragraph
  if (currentParagraph.length > 0) {
    paragraphs.push(currentParagraph.join(' '));
  }
  
  // Format paragraphs as HTML
  return paragraphs.map(p => {
    return p.startsWith('<h3') ? p : `<p class="mb-3">${p}</p>`;
  }).join('\n');
}

/**
 * A component for displaying a slide in the presentation UI
 */
interface SlideViewerProps {
  slide: Slide;
  aspectRatio?: '16:9' | '4:3';
  className?: string;
}

export function SlideViewer({ 
  slide,
  aspectRatio = '16:9',
  className = ''
}: SlideViewerProps): JSX.Element {
  return (
    <Card className={`overflow-hidden shadow-md ${className}`}>
      <AspectRatio ratio={aspectRatio === '16:9' ? 16/9 : 4/3}>
        <div className="bg-white text-black dark:bg-zinc-900 dark:text-white h-full">
          <SlideContent slide={slide} />
        </div>
      </AspectRatio>
    </Card>
  );
}

/**
 * A thumbnail component for showing slide previews in navigation
 */
interface SlideThumbnailProps {
  slide: Slide;
  isActive?: boolean;
  onClick?: () => void;
}

export function SlideThumbnail({ 
  slide, 
  isActive = false,
  onClick
}: SlideThumbnailProps): JSX.Element {
  return (
    <div 
      onClick={onClick}
      className={`
        cursor-pointer rounded-md overflow-hidden border-2 transition-all
        ${isActive ? 'border-primary' : 'border-transparent hover:border-primary/50'}
      `}
    >
      <AspectRatio ratio={16/9}>
        <div className="bg-white dark:bg-zinc-900 p-2 text-xs h-full overflow-hidden">
          {slide.thumbnail ? (
            <img 
              src={slide.thumbnail} 
              alt={`Slide ${slide.slideNumber}`} 
              className="object-contain h-full w-full" 
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-muted-foreground">
                スライド {slide.slideNumber}
              </span>
            </div>
          )}
        </div>
      </AspectRatio>
    </div>
  );
}