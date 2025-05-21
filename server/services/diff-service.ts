import fs from 'fs';
import path from 'path';
import { DOMParser } from 'xmldom';
import * as diff from 'diff';
import { DiffContent, SlideContent, SlideElement } from '@shared/schema';
import { generateEnhancedXMLDiff, generateSemanticDiff } from './enhanced-xml-diff';

// Track file locks to prevent simultaneous edits
interface FileLock {
  userId: number;
  presentationId: number;
  acquired: Date;
  expiresAt: Date;
}

const activeLocks = new Map<string, FileLock>();

/**
 * Extract differences between two PPTX files at the XML level
 * using our enhanced XML diff implementation
 */
export async function extractDiffFromPPTX(oldFilePath: string, newFilePath: string): Promise<string> {
  try {
    // Read XML content from PPTX files (in a real implementation, we would unzip and extract)
    const oldXmlContent = await extractXmlFromPPTX(oldFilePath);
    const newXmlContent = await extractXmlFromPPTX(newFilePath);
    
    // Use our enhanced XML diff for structured comparison
    return generateEnhancedXMLDiff(oldXmlContent, newXmlContent, {
      ignoreWhitespace: true,
      ignoreAttributes: ['xml:space', 'xml:id', 'modId'],
      semanticGrouping: true
    });
  } catch (error) {
    console.error("Error extracting diff from PPTX:", error);
    throw new Error("Failed to extract diff from PPTX files");
  }
}

/**
 * Compare two PPTX files and generate a semantic diff
 * using our structured element comparison
 */
export async function comparePPTXFiles(oldFilePath: string, newFilePath: string): Promise<DiffContent[]> {
  try {
    // Read XML content from PPTX files (in a real implementation, we would unzip and extract)
    const oldXmlContent = await extractXmlFromPPTX(oldFilePath);
    const newXmlContent = await extractXmlFromPPTX(newFilePath);
    
    // Use our semantic diff generator to produce structured differences
    const slideDiff = generateSemanticDiff(oldXmlContent, newXmlContent);
    
    return [slideDiff];
  } catch (error) {
    console.error("Error comparing PPTX files:", error);
    throw new Error("Failed to compare PPTX files");
  }
}

/**
 * Generate a unified XML diff between two XML strings
 * with improved formatting and semantic context
 */
export function generateXMLDiff(oldXml: string, newXml: string): string {
  try {
    // Use the diff library to generate a unified diff
    const changes = diff.createPatch(
      'slide.xml',
      oldXml,
      newXml,
      'Previous Version',
      'Current Version'
    );
    
    return changes;
  } catch (error) {
    console.error("Error generating XML diff:", error);
    throw new Error("Failed to generate XML diff");
  }
}

/**
 * Lock a presentation file to prevent simultaneous edits
 * Returns true if lock was acquired, false if already locked
 */
export function lockFile(presentationId: number, userId: number, durationMinutes: number = 30): boolean {
  const lockKey = `presentation-${presentationId}`;
  const now = new Date();
  
  // Check if file is already locked
  if (activeLocks.has(lockKey)) {
    const lock = activeLocks.get(lockKey)!;
    
    // If lock is expired, release it
    if (lock.expiresAt < now) {
      activeLocks.delete(lockKey);
    } 
    // If lock is held by someone else, deny the request
    else if (lock.userId !== userId) {
      return false;
    }
    // Otherwise, it's the same user, extend the lock
  }
  
  // Acquire new lock
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + durationMinutes);
  
  activeLocks.set(lockKey, {
    userId,
    presentationId,
    acquired: now,
    expiresAt
  });
  
  return true;
}

/**
 * Unlock a presentation file
 * Returns true if unlock was successful, false if not locked by this user
 */
export function unlockFile(presentationId: number, userId: number): boolean {
  const lockKey = `presentation-${presentationId}`;
  
  // Check if file is locked
  if (activeLocks.has(lockKey)) {
    const lock = activeLocks.get(lockKey)!;
    
    // If locked by someone else, deny the request
    if (lock.userId !== userId) {
      return false;
    }
    
    // Release the lock
    activeLocks.delete(lockKey);
    return true;
  }
  
  // File wasn't locked
  return false;
}

/**
 * Check if a presentation is locked and by whom
 * Returns the lock info or null if not locked
 */
export function checkLockStatus(presentationId: number): { 
  isLocked: boolean; 
  lockedBy?: number; 
  expiresAt?: Date;
} {
  const lockKey = `presentation-${presentationId}`;
  const now = new Date();
  
  // Check if file is locked
  if (activeLocks.has(lockKey)) {
    const lock = activeLocks.get(lockKey)!;
    
    // If lock is expired, release it
    if (lock.expiresAt < now) {
      activeLocks.delete(lockKey);
      return { isLocked: false };
    }
    
    return {
      isLocked: true,
      lockedBy: lock.userId,
      expiresAt: lock.expiresAt
    };
  }
  
  return { isLocked: false };
}

/**
 * Extract XML content from a PPTX file
 * In a real implementation, this would unzip and extract the relevant XML files
 */
async function extractXmlFromPPTX(filePath: string): Promise<string> {
  // For demonstration, just return sample XML content
  // In a production environment, this would extract real XML from the PPTX
  
  // Sample slide XML content for demo purposes
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="2" name="Title 1"/>
          <p:cNvSpPr>
            <a:spLocks noGrp="1"/>
          </p:cNvSpPr>
          <p:nvPr>
            <p:ph type="ctrTitle"/>
          </p:nvPr>
        </p:nvSpPr>
        <p:spPr/>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p>
            <a:r>
              <a:rPr lang="en-US" dirty="0" smtClean="0">
                <a:latin typeface="Arial"/>
              </a:rPr>
              <a:t>Project Overview</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="3" name="Content Placeholder 2"/>
          <p:cNvSpPr>
            <a:spLocks noGrp="1"/>
          </p:cNvSpPr>
          <p:nvPr>
            <p:ph idx="1" type="body"/>
          </p:nvPr>
        </p:nvSpPr>
        <p:spPr/>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p>
            <a:pPr lvl="0">
              <a:buChar char="•"/>
              <a:buFont typeface="Arial"/>
              <a:buClr>
                <a:srgbClr val="4472C4"/>
              </a:buClr>
            </a:pPr>
            <a:r>
              <a:rPr lang="en-US" dirty="0" smtClean="0">
                <a:solidFill><a:srgbClr val="4472C4"/></a:solidFill>
              </a:rPr>
              <a:t>XML-level diff extraction from PPTX files</a:t>
            </a:r>
          </a:p>
          <a:p>
            <a:pPr lvl="0">
              <a:buChar char="•"/>
              <a:buFont typeface="Arial"/>
              <a:buClr>
                <a:srgbClr val="4472C4"/>
              </a:buClr>
            </a:pPr>
            <a:r>
              <a:rPr lang="en-US" dirty="0" smtClean="0">
                <a:solidFill><a:srgbClr val="4472C4"/></a:solidFill>
              </a:rPr>
              <a:t>Git-like branch and merge management</a:t>
            </a:r>
          </a:p>
          <a:p>
            <a:pPr lvl="0">
              <a:buChar char="•"/>
              <a:buFont typeface="Arial"/>
              <a:buClr>
                <a:srgbClr val="4472C4"/>
              </a:buClr>
            </a:pPr>
            <a:r>
              <a:rPr lang="en-US" dirty="0" smtClean="0">
                <a:solidFill><a:srgbClr val="4472C4"/></a:solidFill>
              </a:rPr>
              <a:t>Browser-based preview</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr>
    <a:masterClrMapping/>
  </p:clrMapOvr>
</p:sld>`;
}
