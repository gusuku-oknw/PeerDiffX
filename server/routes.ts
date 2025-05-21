import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertPresentationSchema, insertBranchSchema, insertCommitSchema, insertSlideSchema, insertDiffSchema } from "@shared/schema";
import { extractDiffFromPPTX, comparePPTXFiles } from "./services/diff-service";
import multer from "multer";
import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";

// Set up multer for file uploads
const upload = multer({ dest: os.tmpdir() });

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes (prefix with /api)
  const apiRouter = app;

  // Presentations endpoints
  apiRouter.get("/api/presentations", async (req: Request, res: Response) => {
    // In a real app, get from authenticated user
    const userId = 1;
    const presentations = await storage.getPresentations(userId);
    res.json(presentations);
  });

  apiRouter.get("/api/presentations/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const presentation = await storage.getPresentation(id);
    
    if (!presentation) {
      return res.status(404).json({ message: "Presentation not found" });
    }
    
    res.json(presentation);
  });

  apiRouter.post("/api/presentations", async (req: Request, res: Response) => {
    try {
      // In a real app, get from authenticated user
      const userId = 1;
      const presentationData = insertPresentationSchema.parse({
        ...req.body,
        userId
      });
      
      const presentation = await storage.createPresentation(presentationData);
      res.status(201).json(presentation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid presentation data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create presentation" });
    }
  });

  // Upload PPTX file
  apiRouter.post("/api/presentations/upload", upload.single("file"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Validate file is a PPTX
      if (!req.file.originalname.endsWith(".pptx")) {
        return res.status(400).json({ message: "Uploaded file must be a PPTX file" });
      }
      
      // Save presentation metadata
      const userId = 1; // In a real app, get from authenticated user
      const presentation = await storage.createPresentation({
        name: req.file.originalname,
        userId
      });
      
      // Get default branch
      const branch = await storage.getDefaultBranch(presentation.id);
      if (!branch) {
        return res.status(500).json({ message: "Failed to create default branch" });
      }
      
      // Create initial commit
      const commit = await storage.createCommit({
        message: "Initial upload",
        branchId: branch.id,
        userId,
        parentId: null
      });
      
      // Extract slides from PPTX and save them
      // In a real app, would use a proper PPTX parser library
      // For now, just report success
      
      res.status(201).json({
        presentation,
        branch,
        commit
      });
    } catch (error) {
      console.error("Error uploading PPTX:", error);
      res.status(500).json({ message: "Failed to process PPTX file" });
    } finally {
      // Clean up the uploaded file
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (err) {
          console.error("Error cleaning up temporary file:", err);
        }
      }
    }
  });

  // Branches endpoints
  apiRouter.get("/api/presentations/:presentationId/branches", async (req: Request, res: Response) => {
    const presentationId = parseInt(req.params.presentationId);
    const branches = await storage.getBranches(presentationId);
    res.json(branches);
  });

  apiRouter.get("/api/branches/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const branch = await storage.getBranch(id);
    
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }
    
    res.json(branch);
  });

  apiRouter.post("/api/branches", async (req: Request, res: Response) => {
    try {
      const branchData = insertBranchSchema.parse(req.body);
      const branch = await storage.createBranch(branchData);
      res.status(201).json(branch);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid branch data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create branch" });
    }
  });

  // Commits endpoints
  apiRouter.get("/api/branches/:branchId/commits", async (req: Request, res: Response) => {
    const branchId = parseInt(req.params.branchId);
    const commits = await storage.getCommits(branchId);
    res.json(commits);
  });

  apiRouter.get("/api/commits/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const commit = await storage.getCommit(id);
    
    if (!commit) {
      return res.status(404).json({ message: "Commit not found" });
    }
    
    res.json(commit);
  });

  apiRouter.post("/api/commits", async (req: Request, res: Response) => {
    try {
      // In a real app, get from authenticated user
      const userId = 1;
      const commitData = insertCommitSchema.parse({
        ...req.body,
        userId
      });
      
      const commit = await storage.createCommit(commitData);
      res.status(201).json(commit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid commit data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create commit" });
    }
  });

  // Slides endpoints
  apiRouter.get("/api/commits/:commitId/slides", async (req: Request, res: Response) => {
    const commitId = parseInt(req.params.commitId);
    const slides = await storage.getSlides(commitId);
    res.json(slides);
  });

  apiRouter.get("/api/slides/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const slide = await storage.getSlide(id);
    
    if (!slide) {
      return res.status(404).json({ message: "Slide not found" });
    }
    
    res.json(slide);
  });

  apiRouter.post("/api/slides", async (req: Request, res: Response) => {
    try {
      const slideData = insertSlideSchema.parse(req.body);
      const slide = await storage.createSlide(slideData);
      res.status(201).json(slide);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid slide data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create slide" });
    }
  });

  apiRouter.patch("/api/slides/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const slide = await storage.getSlide(id);
      
      if (!slide) {
        return res.status(404).json({ message: "Slide not found" });
      }
      
      const updatedSlide = await storage.updateSlide(id, req.body);
      res.json(updatedSlide);
    } catch (error) {
      res.status(500).json({ message: "Failed to update slide" });
    }
  });

  // Diffs endpoints
  apiRouter.get("/api/commits/:commitId/diffs", async (req: Request, res: Response) => {
    const commitId = parseInt(req.params.commitId);
    const diffs = await storage.getDiffs(commitId);
    res.json(diffs);
  });

  apiRouter.get("/api/diffs/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const diff = await storage.getDiff(id);
    
    if (!diff) {
      return res.status(404).json({ message: "Diff not found" });
    }
    
    res.json(diff);
  });

  apiRouter.post("/api/diffs", async (req: Request, res: Response) => {
    try {
      const diffData = insertDiffSchema.parse(req.body);
      const diff = await storage.createDiff(diffData);
      res.status(201).json(diff);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid diff data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create diff" });
    }
  });

  // Compare API for diff between two commits
  apiRouter.get("/api/compare/:baseCommitId/:compareCommitId", async (req: Request, res: Response) => {
    try {
      const baseCommitId = parseInt(req.params.baseCommitId);
      const compareCommitId = parseInt(req.params.compareCommitId);
      
      const baseCommit = await storage.getCommit(baseCommitId);
      const compareCommit = await storage.getCommit(compareCommitId);
      
      if (!baseCommit || !compareCommit) {
        return res.status(404).json({ message: "One or both commits not found" });
      }
      
      const baseSlides = await storage.getSlides(baseCommitId);
      const compareSlides = await storage.getSlides(compareCommitId);
      
      // Generate a comparison result
      const comparison = {
        baseCommit,
        compareCommit,
        slideDiffs: []
      };
      
      // In a real application, this would use a proper diff algorithm
      // For the demo, we'll just return mock data
      
      res.json(comparison);
    } catch (error) {
      console.error("Error comparing commits:", error);
      res.status(500).json({ message: "Failed to compare commits" });
    }
  });

  // スナップショット操作のエンドポイント
  apiRouter.post("/api/snapshots", async (req: Request, res: Response) => {
    try {
      const { presentationId, commitId, slideId, expiryDays } = req.body;
      
      if (!presentationId || !commitId || !expiryDays) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // 有効期限の計算
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiryDays));
      
      // UUIDを生成
      const id = crypto.randomUUID();
      
      // ベースとなるデータの取得
      const presentation = await storage.getPresentation(presentationId);
      const commit = await storage.getCommit(commitId);
      const slides = await storage.getSlides(commitId);
      
      if (!presentation || !commit || !slides.length) {
        return res.status(404).json({ error: "Presentation, commit, or slides not found" });
      }
      
      // 特定のスライドのみを表示する場合
      const filteredSlides = slideId 
        ? slides.filter(slide => slide.id === slideId)
        : slides;
      
      if (slideId && filteredSlides.length === 0) {
        return res.status(404).json({ error: "Slide not found" });
      }
      
      // スナップショットデータの作成
      const snapshotData = {
        presentation: {
          name: presentation.name,
        },
        commit: {
          message: commit.message,
          createdAt: commit.createdAt,
        },
        slides: filteredSlides.map(slide => ({
          slideNumber: slide.slideNumber,
          title: slide.title,
          content: slide.content,
          thumbnail: slide.thumbnail,
          xmlContent: slide.xmlContent,
        })),
      };
      
      // スナップショットの保存
      const snapshot = await storage.createSnapshot({
        id,
        presentationId,
        commitId,
        slideId: slideId || null,
        expiresAt,
        data: snapshotData,
      });
      
      res.status(201).json({ id: snapshot.id, expiresAt: snapshot.expiresAt });
    } catch (error) {
      console.error("Error creating snapshot:", error);
      res.status(500).json({ error: "Failed to create snapshot" });
    }
  });
  
  apiRouter.get("/api/snapshots/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const snapshot = await storage.getSnapshot(id);
      
      if (!snapshot) {
        return res.status(404).json({ error: "Snapshot not found" });
      }
      
      // 期限切れチェック
      if (snapshot.expiresAt < new Date()) {
        return res.status(410).json({ error: "Snapshot has expired" });
      }
      
      // アクセスカウントを更新
      await storage.updateSnapshotAccessCount(id);
      
      res.json(snapshot);
    } catch (error) {
      console.error("Error retrieving snapshot:", error);
      res.status(500).json({ error: "Failed to retrieve snapshot" });
    }
  });
  
  // 期限切れのスナップショットをクリーンアップ
  apiRouter.delete("/api/snapshots/cleanup", async (req: Request, res: Response) => {
    try {
      const deletedCount = await storage.deleteExpiredSnapshots();
      res.json({ deletedCount });
    } catch (error) {
      console.error("Error cleaning up snapshots:", error);
      res.status(500).json({ error: "Failed to clean up snapshots" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
