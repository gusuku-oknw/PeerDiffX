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
  content: string | null;
  xmlContent: string | null;
  thumbnail: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Renders the content of a slide
 * @param slide The slide object to render
 * @returns JSX element with rendered slide content
 */
export function renderSlideContent(slide: Slide): JSX.Element {
  if (slide.xmlContent) {
    return <XmlSlideRenderer slide={slide} />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-2xl font-bold mb-4">{slide.title || `スライド ${slide.slideNumber}`}</h2>
      {slide.content && (
        <div className="text-base">{slide.content}</div>
      )}
      {!slide.content && !slide.title && (
        <div className="text-muted-foreground">No content available</div>
      )}
    </div>
  );
}

/**
 * Component that renders XML content of a slide
 */
interface XmlSlideRendererProps {
  slide: Slide;
}

export function XmlSlideRenderer({ slide }: XmlSlideRendererProps): JSX.Element {
  // This is a simple renderer for XML content
  // In a real implementation, this would parse the XML and render it properly
  return (
    <div className="p-4 h-full overflow-hidden">
      {slide.title && <h2 className="text-xl font-bold mb-4">{slide.title}</h2>}
      
      {slide.xmlContent ? (
        <div 
          className="text-sm overflow-hidden h-full"
          dangerouslySetInnerHTML={{ 
            __html: createSlideSafely(slide.xmlContent) 
          }} 
        />
      ) : (
        <div className="text-muted-foreground text-center mt-8">
          XML content not available
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
    // Replace potentially dangerous tags with safe versions
    const sanitizedContent = xmlContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<link\b[^<]*>/gi, '')
      .replace(/<meta\b[^<]*>/gi, '');
    
    // Add basic styling to improve appearance
    return `<div class="slide-content">${sanitizedContent}</div>`;
  } catch (error) {
    console.error('Error processing XML content:', error);
    return `<div class="text-red-500">Error processing slide content</div>`;
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
          {renderSlideContent(slide)}
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