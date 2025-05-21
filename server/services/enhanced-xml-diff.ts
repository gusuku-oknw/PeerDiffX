import { DOMParser, XMLSerializer } from 'xmldom';
import * as diff from 'diff';
import { DiffContent, SlideElement } from '@shared/schema';

/**
 * Enhanced XML diffing tool for PowerPoint presentations
 * Provides semantic-aware diffing for PPTX XML content
 */

interface XMLDiffOptions {
  ignoreWhitespace?: boolean;
  ignoreAttributes?: string[];
  ignoreNamespaces?: boolean;
  semanticGrouping?: boolean;
}

/**
 * Extract meaningful differences between two XML strings with PPTX-specific intelligence
 */
export function generateEnhancedXMLDiff(oldXml: string, newXml: string, options: XMLDiffOptions = {}): string {
  const { 
    ignoreWhitespace = true, 
    ignoreAttributes = ['xml:space', 'xml:id', 'modId'],
    ignoreNamespaces = false,
    semanticGrouping = true
  } = options;

  try {
    // Parse XML to DOM
    const oldDoc = new DOMParser().parseFromString(oldXml, 'text/xml');
    const newDoc = new DOMParser().parseFromString(newXml, 'text/xml');

    // Pre-process XML to normalize format, remove ignorable content
    const normalizedOldXml = normalizeXml(oldDoc, { ignoreWhitespace, ignoreAttributes, ignoreNamespaces });
    const normalizedNewXml = normalizeXml(newDoc, { ignoreWhitespace, ignoreAttributes, ignoreNamespaces });

    // Generate line-based diff
    const changes = diff.createPatch(
      'slide.xml',
      normalizedOldXml,
      normalizedNewXml,
      'Previous Version',
      'Current Version'
    );

    // Optional: Enhance with semantic grouping of related changes
    return semanticGrouping ? enhanceDiffWithSemanticGrouping(changes) : changes;
  } catch (error) {
    console.error('Error generating enhanced XML diff:', error);
    return `Error generating diff: ${error instanceof Error ? error.message : String(error)}`;
  }
}

/**
 * Normalize XML for more meaningful comparison
 */
function normalizeXml(doc: Document, options: XMLDiffOptions): string {
  const { ignoreWhitespace, ignoreAttributes, ignoreNamespaces } = options;
  
  // Deep clone to avoid modifying original
  const clonedDoc = doc.cloneNode(true) as Document;
  
  // Recursive function to process nodes
  function processNode(node: Node): void {
    // Skip text nodes if we're ignoring whitespace
    if (node.nodeType === Node.TEXT_NODE && ignoreWhitespace) {
      const textNode = node as Text;
      if (textNode.nodeValue) {
        textNode.nodeValue = textNode.nodeValue.trim().replace(/\s+/g, ' ');
        if (textNode.nodeValue === '') {
          textNode.nodeValue = null;
        }
      }
    }
    
    // Process element nodes
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      
      // Handle attributes
      if (ignoreAttributes && ignoreAttributes.length > 0) {
        for (const attr of ignoreAttributes) {
          element.removeAttribute(attr);
        }
      }
      
      // Handle namespaces if ignoring
      if (ignoreNamespaces) {
        // This is a simplification - in a real implementation we'd need
        // more complex namespace handling
        const nodeName = element.nodeName;
        if (nodeName.includes(':')) {
          // This is a placeholder for proper namespace handling
          // In a production environment, you'd use a proper XML namespace library
        }
      }
      
      // Process children recursively
      const childNodes = Array.from(node.childNodes);
      for (const child of childNodes) {
        processNode(child);
      }
    }
  }
  
  // Start processing from root
  processNode(clonedDoc.documentElement);
  
  // Serialize back to string
  return new XMLSerializer().serializeToString(clonedDoc);
}

/**
 * Enhance diff output with semantic grouping for related changes
 */
function enhanceDiffWithSemanticGrouping(diffOutput: string): string {
  // Split diff into lines
  const lines = diffOutput.split('\n');
  const enhancedLines: string[] = [];
  
  // Identify semantic groups (like slide elements, text runs, etc.)
  let inGroup = false;
  let currentGroup: string[] = [];
  let groupType = '';
  
  for (const line of lines) {
    // Detect start of semantic groups based on PPTX XML structure
    const isSlideElementStart = line.includes('<p:sp') || line.includes('<p:pic') || line.includes('<p:graphicFrame');
    const isTextRunStart = line.includes('<a:r>');
    const isShapePropsStart = line.includes('<p:spPr>');
    
    if ((line.startsWith('+') || line.startsWith('-')) && 
        (isSlideElementStart || isTextRunStart || isShapePropsStart)) {
      
      // If we were already in a group, flush it first
      if (inGroup) {
        enhancedLines.push(`--- ${groupType} changes start ---`);
        enhancedLines.push(...currentGroup);
        enhancedLines.push(`--- ${groupType} changes end ---`);
        enhancedLines.push('');
      }
      
      // Start new group
      inGroup = true;
      currentGroup = [line];
      
      if (isSlideElementStart) groupType = 'Slide element';
      else if (isTextRunStart) groupType = 'Text run';
      else if (isShapePropsStart) groupType = 'Shape properties';
      
      continue;
    }
    
    if (inGroup && (line.startsWith('+') || line.startsWith('-') || line.startsWith(' '))) {
      // Continue adding to current group
      currentGroup.push(line);
    } else {
      // End of group or non-diff line
      if (inGroup) {
        enhancedLines.push(`--- ${groupType} changes start ---`);
        enhancedLines.push(...currentGroup);
        enhancedLines.push(`--- ${groupType} changes end ---`);
        enhancedLines.push('');
        
        inGroup = false;
        currentGroup = [];
      }
      
      enhancedLines.push(line);
    }
  }
  
  // Handle any remaining group
  if (inGroup) {
    enhancedLines.push(`--- ${groupType} changes start ---`);
    enhancedLines.push(...currentGroup);
    enhancedLines.push(`--- ${groupType} changes end ---`);
  }
  
  return enhancedLines.join('\n');
}

/**
 * Generate a structured semantic diff for slide content
 */
export function generateSemanticDiff(oldXml: string, newXml: string): DiffContent {
  try {
    // Parse XML to DOM
    const oldDoc = new DOMParser().parseFromString(oldXml, 'text/xml');
    const newDoc = new DOMParser().parseFromString(newXml, 'text/xml');
    
    // Extract slide elements from both versions
    const oldElements = extractSlideElements(oldDoc);
    const newElements = extractSlideElements(newDoc);
    
    // Compare and generate structured diff
    return compareSlideElements(oldElements, newElements);
  } catch (error) {
    console.error('Error generating semantic diff:', error);
    return { added: [], deleted: [], modified: [] };
  }
}

/**
 * Extract slide elements from XML document
 */
function extractSlideElements(doc: Document): SlideElement[] {
  const elements: SlideElement[] = [];
  
  // This is a simplified implementation
  // In a real-world scenario, this would have more complex parsing logic
  // specific to PPTX structure
  
  // Example: extract shape elements (p:sp)
  const shapes = doc.getElementsByTagName('p:sp');
  for (let i = 0; i < shapes.length; i++) {
    const shape = shapes[i];
    
    // Extract element ID
    const nvSpPr = shape.getElementsByTagName('p:nvSpPr')[0];
    const cNvPr = nvSpPr?.getElementsByTagName('p:cNvPr')[0];
    const id = cNvPr?.getAttribute('id') || `generated-${i}`;
    
    // Extract position and size
    const spPr = shape.getElementsByTagName('p:spPr')[0];
    const xfrm = spPr?.getElementsByTagName('a:xfrm')[0];
    const off = xfrm?.getElementsByTagName('a:off')[0];
    const ext = xfrm?.getElementsByTagName('a:ext')[0];
    
    const x = parseInt(off?.getAttribute('x') || '0', 10);
    const y = parseInt(off?.getAttribute('y') || '0', 10);
    const width = parseInt(ext?.getAttribute('cx') || '0', 10);
    const height = parseInt(ext?.getAttribute('cy') || '0', 10);
    
    // Extract text content
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
  
  // Similar logic would be implemented for other element types
  // (images, charts, etc.)
  
  return elements;
}

/**
 * Compare slide elements to generate structured diff
 */
function compareSlideElements(oldElements: SlideElement[], newElements: SlideElement[]): DiffContent {
  const result: DiffContent = {
    added: [],
    deleted: [],
    modified: []
  };
  
  // Create maps for faster lookup
  const oldElementMap = new Map<string, SlideElement>();
  const newElementMap = new Map<string, SlideElement>();
  
  oldElements.forEach(element => oldElementMap.set(element.id, element));
  newElements.forEach(element => newElementMap.set(element.id, element));
  
  // Find deleted elements
  oldElements.forEach(oldElement => {
    if (!newElementMap.has(oldElement.id)) {
      result.deleted.push(oldElement);
    }
  });
  
  // Find added and modified elements
  newElements.forEach(newElement => {
    if (!oldElementMap.has(newElement.id)) {
      result.added.push(newElement);
    } else {
      const oldElement = oldElementMap.get(newElement.id)!;
      
      // Check for modifications
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