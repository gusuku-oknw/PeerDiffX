import { Slide } from "@shared/schema";

// スライドをフェッチする関数
export async function fetchSlides(commitId: number): Promise<Slide[]> {
  if (!commitId) return [];
  
  try {
    const response = await fetch(`/api/commits/${commitId}/slides`);
    
    if (!response.ok) {
      throw new Error(`Error fetching slides for commit ${commitId}`);
    }
    
    const slides = await response.json();
    return slides;
  } catch (error) {
    console.error(`Failed to fetch slides for commit ${commitId}:`, error);
    return [];
  }
}

// APIからスライドを作成する関数
export async function createSlidesFromAPI(
  commitId: number, 
  slideData: any[]
): Promise<Slide[]> {
  try {
    const response = await fetch(`/api/commits/${commitId}/create-slides`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ slides: slideData }),
    });
    
    if (!response.ok) {
      throw new Error(`Error creating slides for commit ${commitId}`);
    }
    
    const slides = await response.json();
    return slides;
  } catch (error) {
    console.error(`Failed to create slides for commit ${commitId}:`, error);
    return [];
  }
}

// デフォルトのスライドを作成する関数
export function createDefaultSlide(commitId: number, slideNumber: number): any {
  return {
    commitId,
    slideNumber,
    title: `Slide ${slideNumber}`,
    content: {
      elements: [
        {
          id: `title${slideNumber}`,
          type: 'text',
          x: 100,
          y: 100,
          width: 600,
          height: 100,
          content: 'Add Your Title Here',
          style: {
            fontSize: 32,
            fontWeight: 'bold',
            color: '#333333'
          }
        },
        {
          id: `subtitle${slideNumber}`,
          type: 'text',
          x: 100,
          y: 220,
          width: 600,
          height: 50,
          content: 'Your Subtitle',
          style: {
            fontSize: 24,
            color: '#666666'
          }
        }
      ],
      background: '#ffffff'
    },
    xmlContent: `<p:sld><p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>Add Your Title Here</a:t></a:r></a:p></p:txBody></p:sp><p:sp><p:txBody><a:p><a:r><a:t>Your Subtitle</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:sld>`
  };
}