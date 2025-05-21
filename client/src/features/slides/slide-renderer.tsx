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
      {(!slide.content || Object.keys(slide.content).length === 0) && !slide.title && (
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
        <div className="slide-structured-content relative" style={{ background: content.background || 'transparent' }}>
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
                <div>{element.content}</div>
              )}
              {element.type === 'image' && element.src && (
                <img src={element.src} alt={element.alt || ''} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              )}
            </div>
          ))}
        </div>
      );
    } 
    
    // Fallback for other formats
    return <pre className="text-sm overflow-auto max-h-60">{JSON.stringify(content, null, 2)}</pre>;
  } catch (error: any) {
    console.error('Error rendering structured content:', error);
    return <div className="text-red-500">Error rendering slide content: {error.message}</div>;
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
    // For PowerPoint XML, look for text within a:t tags
    let displayContent = sanitizedContent;
    
    // Try to extract text from PowerPoint XML format
    const textMatches = sanitizedContent.match(/<a:t>(.*?)<\/a:t>/g);
    if (textMatches && textMatches.length > 0) {
      const extractedText = textMatches.map(match => {
        return match.replace(/<a:t>(.*?)<\/a:t>/g, '$1');
      }).join('<br>');
      
      displayContent = `<div class="pptx-text">${extractedText}</div>`;
    }
    
    // Add wrapper with styling
    return `
      <div class="slide-content">
        <style>
          .slide-content p { margin-bottom: 0.5em; }
          .slide-content [style*="font-size"] { line-height: 1.4; }
          .pptx-text { font-size: 1.2rem; line-height: 1.6; margin: 1rem 0; }
        </style>
        ${displayContent}
      </div>
    `;
  } catch (error: any) {
    console.error('Error processing XML content:', error);
    return `<div class="text-red-500">Error processing slide content: ${error.message}</div>`;
  }
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