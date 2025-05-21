import { parseSlideXML, generateSlideXML, SlideData } from './pptx-parser';
import { SlideContent, SlideElement, DiffContent } from '@shared/schema';

/**
 * Create a diff between two slide versions
 */
export function createSlideDiff(oldSlide: SlideData, newSlide: SlideData): DiffContent {
  const added: SlideElement[] = [];
  const deleted: SlideElement[] = [];
  const modified: { before: SlideElement; after: SlideElement }[] = [];
  
  // Create maps of elements by id for efficient lookup
  const oldElements = new Map<string, SlideElement>();
  oldSlide.elements.forEach(element => {
    oldElements.set(element.id, element);
  });
  
  const newElements = new Map<string, SlideElement>();
  newSlide.elements.forEach(element => {
    newElements.set(element.id, element);
  });
  
  // Find added elements (in new but not in old)
  newSlide.elements.forEach(element => {
    if (!oldElements.has(element.id)) {
      added.push(element);
    }
  });
  
  // Find deleted elements (in old but not in new)
  oldSlide.elements.forEach(element => {
    if (!newElements.has(element.id)) {
      deleted.push(element);
    }
  });
  
  // Find modified elements (in both but different)
  oldSlide.elements.forEach(oldElement => {
    const newElement = newElements.get(oldElement.id);
    if (newElement) {
      // Compare elements - in a real implementation, would do deep comparison
      if (JSON.stringify(oldElement) !== JSON.stringify(newElement)) {
        modified.push({
          before: oldElement,
          after: newElement
        });
      }
    }
  });
  
  return { added, deleted, modified };
}

/**
 * Apply a diff to a slide to get a new version
 */
export function applyDiff(baseSlide: SlideData, diff: DiffContent): SlideData {
  // Create a deep copy of the base slide
  const newSlide = JSON.parse(JSON.stringify(baseSlide)) as SlideData;
  
  // Create a map of elements by id for efficient updates
  const elementsMap = new Map<string, SlideElement>();
  newSlide.elements.forEach(element => {
    elementsMap.set(element.id, element);
  });
  
  // Apply deletions
  diff.deleted.forEach(element => {
    const index = newSlide.elements.findIndex(e => e.id === element.id);
    if (index !== -1) {
      newSlide.elements.splice(index, 1);
    }
    elementsMap.delete(element.id);
  });
  
  // Apply modifications
  diff.modified.forEach(({ before, after }) => {
    const element = elementsMap.get(before.id);
    if (element) {
      // In a real implementation, would do a property-by-property update
      Object.assign(element, after);
    }
  });
  
  // Apply additions
  diff.added.forEach(element => {
    newSlide.elements.push(element);
    elementsMap.set(element.id, element);
  });
  
  return newSlide;
}

/**
 * Create XML diff between two XML strings
 * In a real implementation, would use a proper XML diff library
 */
export function createXmlDiff(oldXml: string, newXml: string): string {
  // This is a simplified mock implementation
  // In a real app, would use a proper XML diff algorithm
  
  // Sample diff format - in a real implementation, would generate proper unified diff
  return `@@ -15,6 +15,9 @@ <p:sld>
<p:cSld>
  <p:spTree>
    <p:sp>
      <p:nvSpPr>
        <p:cNvPr id="4" name="Content Placeholder 3"/>
        <p:cNvSpPr>
          <a:spLocks noGrp="1"/>
        </p:cNvSpPr>
+       <p:nvPr>
+         <p:ph idx="1" type="body"/>
+       </p:nvPr>
      </p:nvSpPr>
      
@@ -42,6 +45,11 @@ <p:sld>
                  <a:buClr>
                    <a:srgbClr val="4472C4"/>
                  </a:buClr>
                </a:pPr>
+               <a:r>
+                 <a:rPr lang="en-US" dirty="0" smtClean="0" b="1">
+                   <a:solidFill><a:srgbClr val="C0504D"/></a:solidFill>
+                 </a:rPr>
+                 <a:t>API integration for advanced features</a:t>`;
}

/**
 * Merge two versions of a slide
 */
export function mergeSlides(baseSlide: SlideData, yourSlide: SlideData, theirSlide: SlideData): SlideData {
  // Create diffs for both branches
  const yourDiff = createSlideDiff(baseSlide, yourSlide);
  const theirDiff = createSlideDiff(baseSlide, theirSlide);
  
  // Start with the base slide
  const mergedSlide = JSON.parse(JSON.stringify(baseSlide)) as SlideData;
  
  // Create a map of elements by id for efficient updates
  const elementsMap = new Map<string, SlideElement>();
  mergedSlide.elements.forEach(element => {
    elementsMap.set(element.id, element);
  });
  
  // Apply non-conflicting changes
  
  // Apply their additions (if not conflicting)
  theirDiff.added.forEach(element => {
    const conflictingAddition = yourDiff.added.find(e => e.id === element.id);
    if (!conflictingAddition) {
      mergedSlide.elements.push(element);
      elementsMap.set(element.id, element);
    }
    // If conflicting, need conflict resolution (not implemented in this mock)
  });
  
  // Apply your additions (if not already added from their changes)
  yourDiff.added.forEach(element => {
    if (!elementsMap.has(element.id)) {
      mergedSlide.elements.push(element);
      elementsMap.set(element.id, element);
    }
  });
  
  // Apply their deletions (if not conflicting with your modifications)
  theirDiff.deleted.forEach(element => {
    const yourModification = yourDiff.modified.find(m => m.before.id === element.id);
    if (!yourModification) {
      const index = mergedSlide.elements.findIndex(e => e.id === element.id);
      if (index !== -1) {
        mergedSlide.elements.splice(index, 1);
      }
      elementsMap.delete(element.id);
    }
    // If conflicting, need conflict resolution (not implemented in this mock)
  });
  
  // Apply your deletions (if not already deleted and not conflicting with their modifications)
  yourDiff.deleted.forEach(element => {
    const theirModification = theirDiff.modified.find(m => m.before.id === element.id);
    if (!theirModification && elementsMap.has(element.id)) {
      const index = mergedSlide.elements.findIndex(e => e.id === element.id);
      if (index !== -1) {
        mergedSlide.elements.splice(index, 1);
      }
      elementsMap.delete(element.id);
    }
  });
  
  // Apply non-conflicting modifications
  // In a real implementation, would implement proper 3-way merge for modifications
  
  // Apply their modifications (if not conflicting with your modifications)
  theirDiff.modified.forEach(({ before, after }) => {
    const yourModification = yourDiff.modified.find(m => m.before.id === before.id);
    if (!yourModification) {
      const element = elementsMap.get(before.id);
      if (element) {
        Object.assign(element, after);
      }
    }
    // If conflicting, need conflict resolution (not implemented in this mock)
  });
  
  // Apply your modifications (if not already modified by their changes)
  yourDiff.modified.forEach(({ before, after }) => {
    const theirModification = theirDiff.modified.find(m => m.before.id === before.id);
    if (!theirModification) {
      const element = elementsMap.get(before.id);
      if (element) {
        Object.assign(element, after);
      }
    }
  });
  
  return mergedSlide;
}

/**
 * Generate a new commit for a slide
 */
export async function createCommit(
  slideId: number, 
  slideContent: SlideContent, 
  message: string, 
  branchId: number, 
  parentId: number | null
): Promise<any> {
  try {
    // Create a new commit
    const commitResponse = await fetch('/api/commits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        branchId,
        parentId
      }),
      credentials: 'include'
    });
    
    if (!commitResponse.ok) {
      throw new Error('Failed to create commit');
    }
    
    const commit = await commitResponse.json();
    
    // Update the slide with the new commit
    const slideResponse = await fetch(`/api/slides/${slideId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        commitId: commit.id,
        content: slideContent
      }),
      credentials: 'include'
    });
    
    if (!slideResponse.ok) {
      throw new Error('Failed to update slide');
    }
    
    return commit;
  } catch (error) {
    console.error('Error creating commit:', error);
    throw error;
  }
}
