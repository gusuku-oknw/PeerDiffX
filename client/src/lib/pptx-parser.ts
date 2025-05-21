export interface SlideElement {
  id: string;
  type: 'text' | 'shape' | 'image' | 'chart';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  style?: Record<string, any>;
  children?: SlideElement[];
}

export interface SlideData {
  id: number;
  slideNumber: number;
  title: string;
  elements: SlideElement[];
  thumbnail?: string;
}

/**
 * Parse XML string from a PPTX slide into a structured SlideData object
 * In a real application, this would use a proper XML parser library
 */
export function parseSlideXML(slideXml: string): SlideData {
  // This is a simplified mock parser for demo purposes
  // In a real app, this would parse the XML properly and extract slide elements
  
  // Extract slide number from XML (mock)
  const slideNumberMatch = slideXml.match(/slide(\d+)\.xml/);
  const slideNumber = slideNumberMatch ? parseInt(slideNumberMatch[1]) : 1;
  
  // Extract title (mock)
  const titleMatch = slideXml.match(/<a:t>(.*?)<\/a:t>/);
  const title = titleMatch ? titleMatch[1] : `Slide ${slideNumber}`;
  
  // Extract elements (mock)
  const elements: SlideElement[] = [];
  
  // In a real parser, would extract all elements and their properties
  // For demo, just create some mock elements based on slide number
  
  if (slideNumber === 1) {
    // Title slide
    elements.push({
      id: 'title-1',
      type: 'text',
      x: 50,
      y: 50,
      width: 600,
      height: 80,
      content: 'Presentation Title',
      style: {
        fontSize: 44,
        fontWeight: 'bold',
        textAlign: 'center'
      }
    });
  } else if (slideNumber === 2) {
    // Content slide with bullet points
    elements.push({
      id: 'title-2',
      type: 'text',
      x: 50,
      y: 30,
      width: 600,
      height: 50,
      content: 'Project Overview',
      style: {
        fontSize: 32,
        fontWeight: 'bold'
      }
    });
    
    // Bullet points
    elements.push({
      id: 'bullets-1',
      type: 'text',
      x: 70,
      y: 100,
      width: 600,
      height: 300,
      content: '• XML-level diff extraction from PPTX files\n• Git-like branch and merge management\n• Browser-based instant preview\n• API integration for advanced features',
      style: {
        fontSize: 24,
        lineHeight: 1.5
      }
    });
  }
  
  return {
    id: slideNumber,
    slideNumber,
    title,
    elements
  };
}

/**
 * Generate a new XML string from structured slide data
 * In a real application, this would generate proper PPTX XML
 */
export function generateSlideXML(slideData: SlideData): string {
  // This is a simplified mock XML generator for demo purposes
  // In a real app, this would generate valid PPTX XML structure
  
  // Simple XML template with placeholders
  const xmlTemplate = `
    <p:sld xmlns:p="..." xmlns:a="...">
      <p:cSld>
        <p:spTree>
          ${slideData.elements.map(element => generateElementXML(element)).join('\n')}
        </p:spTree>
      </p:cSld>
    </p:sld>
  `;
  
  return xmlTemplate;
}

/**
 * Generate XML for a slide element (simplified mock)
 */
function generateElementXML(element: SlideElement): string {
  if (element.type === 'text') {
    return `
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="${element.id}" name="TextBox ${element.id}"/>
          <p:cNvSpPr>
            <a:spLocks noGrp="1"/>
          </p:cNvSpPr>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="${element.x * 9525}" y="${element.y * 9525}"/>
            <a:ext cx="${element.width * 9525}" cy="${element.height * 9525}"/>
          </a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:p>
            <a:r>
              <a:t>${element.content}</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
    `;
  } else {
    // Handle other element types (shape, image, chart)
    return `<!-- ${element.type} element ${element.id} -->`;
  }
}
