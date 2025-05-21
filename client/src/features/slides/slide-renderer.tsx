import React from 'react';
import type { Slide } from '@shared/schema';
import { useEffect, useRef } from 'react';

/**
 * Renders the content of a slide
 * @param slide The slide object to render
 * @returns JSX element with rendered slide content
 */
export function renderSlideContent(slide: Slide): JSX.Element {
  if (!slide) {
    return <div className="w-full h-full flex items-center justify-center text-gray-400">スライドが見つかりません</div>;
  }

  // If we have a thumbnail, display it
  if (slide.thumbnail) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <img 
          src={slide.thumbnail} 
          alt={`Slide ${slide.slideNumber}`} 
          className="max-w-full max-h-full object-contain"
        />
      </div>
    );
  }

  // Attempt to render XML content
  return <XmlSlideRenderer slide={slide} />;
}

/**
 * Component that renders XML content of a slide
 */
interface XmlSlideRendererProps {
  slide: Slide;
}

export function XmlSlideRenderer({ slide }: XmlSlideRendererProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !slide.xmlContent) return;

    try {
      // Create a parser
      const parser = new DOMParser();
      // Parse XML content
      const xmlDoc = parser.parseFromString(slide.xmlContent, "text/xml");
      
      // Extract slide dimensions and content
      const slideElement = xmlDoc.querySelector('p:sld');
      
      if (!slideElement) {
        throw new Error("Invalid slide XML structure");
      }

      // Handle fallback rendering if parsing fails
      containerRef.current.innerHTML = `
        <div class="relative w-full h-full bg-white flex flex-col items-center justify-center p-8">
          <h3 class="text-2xl font-bold mb-4">${slide.title || `スライド ${slide.slideNumber}`}</h3>
          <div class="text-sm text-gray-500 mb-4">XML コンテンツを表示できません。サムネイルモードで表示します。</div>
        </div>
      `;
    } catch (error) {
      console.error("Failed to render slide XML:", error);
      
      // Fallback content
      if (containerRef.current) {
        containerRef.current.innerHTML = `
          <div class="relative w-full h-full bg-white flex flex-col items-center justify-center p-8">
            <h3 class="text-2xl font-bold mb-4">${slide.title || `スライド ${slide.slideNumber}`}</h3>
            <div class="text-sm text-gray-500">XML コンテンツの解析に失敗しました</div>
          </div>
        `;
      }
    }
  }, [slide]);

  return <div ref={containerRef} className="w-full h-full bg-white" />;
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
    <div 
      className={`bg-white dark:bg-gray-800 shadow-lg rounded-sm ${
        aspectRatio === '16:9' ? 'aspect-[16/9]' : 'aspect-[4/3]'
      } ${className}`}
    >
      {renderSlideContent(slide)}
    </div>
  );
}