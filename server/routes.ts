import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { 
  insertPresentationSchema, 
  insertBranchSchema, 
  insertCommitSchema, 
  insertSlideSchema, 
  insertDiffSchema, 
  insertCommentSchema,
  presentations,
  branches,
  commits,
  slides,
  diffs,
  presentationAccess
} from "@shared/schema";
import { extractDiffFromPPTX, comparePPTXFiles, lockFile, unlockFile, checkLockStatus } from "./services/diff-service";
import accessControlRouter from "./routes/access-control-routes";
import { isAuthenticated, canAccessPresentation } from "./middleware/auth-middleware";
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
  
  // 開発環境用の認証モック
  // ユーザー情報API (開発用モック)
  app.get('/api/auth/user', (req, res) => {
    res.json({
      id: 'dev-user',
      username: 'dev',
      email: 'dev@example.com',
      firstName: '開発',
      lastName: 'ユーザー',
      profileImageUrl: null,
      roleId: 5,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });
  
  // ログインAPI (開発用モック)
  app.get('/api/login', (req, res) => {
    res.redirect('/');
  });
  
  // ログアウトAPI (開発用モック)
  app.get('/api/logout', (req, res) => {
    res.redirect('/');
  });
  
  // Register the access control routes
  app.use(accessControlRouter);

  // Presentations endpoints
  apiRouter.get("/api/presentations", async (req: Request, res: Response) => {
    // ユーザーIDを取得（認証済みユーザーまたはモックユーザー）
    const userId = req.user?.id || '41964833';  // モックの場合のデフォルトユーザーID
    console.log("Fetching presentations for userId:", userId);
    const presentations = await storage.getPresentationsByUserId(userId);
    console.log("Found presentations:", presentations.length);
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
      // ユーザーIDを取得（認証済みユーザーまたはリクエストボディから）
      const userId = req.user?.id || req.body.userId || '41964833';
      const userIdStr = String(userId);
      
      console.log("Creating presentation with userId:", userIdStr);
      
      // ユーザーIDは常に文字列として保存
      const presentationData = insertPresentationSchema.parse({
        ...req.body,
        userId: userIdStr
      });
      
      // Create the presentation
      const presentation = await storage.createPresentation(presentationData);
      console.log("Created presentation:", presentation.id);
      
      // Create a default branch
      console.log("Creating branch for presentation:", presentation.id);
      const branch = await storage.createBranch({
        name: "main",
        presentationId: presentation.id,
        isDefault: true
      });
      console.log("Created branch:", branch.id);
      
      // Create an initial commit
      console.log("Creating commit for branch:", branch.id);
      const commit = await storage.createCommit({
        message: "Initial commit",
        branchId: branch.id,
        parentId: null, 
        userId: userId.toString() // Always use string for user ID
      });
      console.log("Created commit:", commit.id);
      
      // Create a welcome slide
      console.log("Creating slide for commit:", commit.id);
      const slide = await storage.createSlide({
        commitId: commit.id,
        slideNumber: 1,
        title: "Welcome",
        content: {
          elements: [
            {
              id: 'title1',
              type: 'text',
              x: 100,
              y: 100,
              width: 600,
              height: 100,
              content: presentation.name.replace('.pptx', ''),
              style: { fontSize: 32, fontWeight: 'bold', color: '#333333' }
            },
            {
              id: 'subtitle1',
              type: 'text',
              x: 100,
              y: 220,
              width: 600,
              height: 50,
              content: 'Created with PeerDiffX',
              style: { fontSize: 24, color: '#666666' }
            }
          ],
          background: '#ffffff'
        },
        xmlContent: `<p:sld><p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>${presentation.name.replace('.pptx', '')}</a:t></a:r></a:p></p:txBody></p:sp><p:sp><p:txBody><a:p><a:r><a:t>Created with PeerDiffX</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:sld>`
      });
      console.log("Created slide:", slide.id);
      
      res.status(201).json(presentation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid presentation data", errors: error.errors });
      }
      console.error("Failed to create presentation:", error);
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
      const userId = req.user?.id || '41964833'; // 認証済みユーザーまたはモックユーザー
      console.log("Creating presentation with userId:", userId);
      const presentation = await storage.createPresentation({
        name: req.file.originalname,
        userId: String(userId)
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
        userId: String(userId),
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
    const branches = await storage.getBranchesByPresentationId(presentationId);
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
      
      // ベース（派生元）ブランチから作成する場合の処理
      if (req.body.baseBranchId) {
        const baseBranchId = parseInt(req.body.baseBranchId);
        const baseBranch = await storage.getBranch(baseBranchId);
        
        if (!baseBranch) {
          return res.status(404).json({ message: "Base branch not found" });
        }
        
        // 新しいブランチを作成
        const branch = await storage.createBranch(branchData);
        
        // 派生元ブランチの最新コミットを取得
        const latestCommit = await storage.getLatestCommit(baseBranchId);
        
        if (latestCommit) {
          // 新しいブランチに初期コミットを作成
          const commit = await storage.createCommit({
            message: `Branch created from ${baseBranch.name}`,
            branchId: branch.id,
            parentId: latestCommit.id,
            userId: req.user?.id || "41964833" // 認証済みユーザーまたはモックユーザー
          });
          
          // 派生元のスライドをコピー
          const slides = await storage.getSlidesByCommitId(latestCommit.id);
          
          for (const slide of slides) {
            await storage.createSlide({
              commitId: commit.id,
              slideNumber: slide.slideNumber,
              title: slide.title,
              content: slide.content,
              thumbnail: slide.thumbnail,
              xmlContent: slide.xmlContent
            });
          }
          
          return res.status(201).json({ branch, commit, baseCommit: latestCommit });
        }
        
        return res.status(201).json(branch);
      }
      
      // 通常のブランチ作成
      const branch = await storage.createBranch(branchData);
      res.status(201).json(branch);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid branch data", errors: error.errors });
      }
      console.error("ブランチ作成エラー:", error);
      res.status(500).json({ message: "Failed to create branch" });
    }
  });
  
  // ブランチマージエンドポイント
  apiRouter.post("/api/branches/merge", async (req: Request, res: Response) => {
    try {
      const { sourceBranchId, targetBranchId, commitMessage = "Merge branch" } = req.body;
      
      if (!sourceBranchId || !targetBranchId) {
        return res.status(400).json({ message: "Source and target branch IDs are required" });
      }
      
      // ソースブランチとターゲットブランチを取得
      const sourceBranch = await storage.getBranch(sourceBranchId);
      const targetBranch = await storage.getBranch(targetBranchId);
      
      if (!sourceBranch || !targetBranch) {
        return res.status(404).json({ message: "One or both branches not found" });
      }
      
      // 最新コミットを取得
      const sourceCommit = await storage.getLatestCommit(sourceBranchId);
      const targetCommit = await storage.getLatestCommit(targetBranchId);
      
      if (!sourceCommit || !targetCommit) {
        return res.status(404).json({ message: "Latest commits not found" });
      }
      
      // マージコミットを作成
      const mergeCommit = await storage.createCommit({
        message: commitMessage,
        branchId: targetBranchId,
        parentId: targetCommit.id,
        userId: req.user?.id || "41964833" // 認証済みユーザーまたはモックユーザー
      });
      
      // ソースブランチのスライドを取得
      const sourceSlides = await storage.getSlidesByCommitId(sourceCommit.id);
      const targetSlides = await storage.getSlidesByCommitId(targetCommit.id);
      
      // マージしたスライドを作成
      const mergedSlides = [];
      const processedSlideNumbers = new Set();
      
      // ターゲットスライドを処理（保持または更新）
      for (const targetSlide of targetSlides) {
        const sourceSlide = sourceSlides.find(s => s.slideNumber === targetSlide.slideNumber);
        processedSlideNumbers.add(targetSlide.slideNumber);
        
        if (sourceSlide) {
          // 同じスライド番号が両方にある場合、ソースを優先（マージ）
          const mergedSlide = await storage.createSlide({
            commitId: mergeCommit.id,
            slideNumber: targetSlide.slideNumber,
            title: sourceSlide.title,
            content: sourceSlide.content,
            thumbnail: sourceSlide.thumbnail,
            xmlContent: sourceSlide.xmlContent
          });
          
          // 差分を記録
          await storage.createDiff({
            commitId: mergeCommit.id,
            slideId: mergedSlide.id,
            diffContent: {
              added: [],
              deleted: [],
              modified: [{
                before: targetSlide.content,
                after: sourceSlide.content
              }]
            },
            xmlDiff: `Merged from ${sourceBranch.name}`,
            changeType: "modified"
          });
          
          mergedSlides.push(mergedSlide);
        } else {
          // ターゲットブランチにのみ存在するスライドはそのまま保持
          const copiedSlide = await storage.createSlide({
            commitId: mergeCommit.id,
            slideNumber: targetSlide.slideNumber,
            title: targetSlide.title,
            content: targetSlide.content,
            thumbnail: targetSlide.thumbnail,
            xmlContent: targetSlide.xmlContent
          });
          
          mergedSlides.push(copiedSlide);
        }
      }
      
      // ソースブランチにのみ存在するスライドを追加
      for (const sourceSlide of sourceSlides) {
        if (!processedSlideNumbers.has(sourceSlide.slideNumber)) {
          const newSlide = await storage.createSlide({
            commitId: mergeCommit.id,
            slideNumber: sourceSlide.slideNumber,
            title: sourceSlide.title,
            content: sourceSlide.content,
            thumbnail: sourceSlide.thumbnail,
            xmlContent: sourceSlide.xmlContent
          });
          
          // 差分を記録（新規追加）
          await storage.createDiff({
            commitId: mergeCommit.id,
            slideId: newSlide.id,
            diffContent: {
              added: [sourceSlide.content],
              deleted: [],
              modified: []
            },
            xmlDiff: `Added from ${sourceBranch.name}`,
            changeType: "added"
          });
          
          mergedSlides.push(newSlide);
        }
      }
      
      res.status(200).json({
        mergeCommit,
        mergedSlides,
        message: `Branch ${sourceBranch.name} successfully merged into ${targetBranch.name}`
      });
    } catch (error) {
      console.error("ブランチマージエラー:", error);
      res.status(500).json({ message: "Failed to merge branches" });
    }
  });

  // Commits endpoints
  apiRouter.get("/api/branches/:branchId/commits", async (req: Request, res: Response) => {
    const branchId = parseInt(req.params.branchId);
    const commits = await storage.getCommitsByBranchId(branchId);
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
    const slides = await storage.getSlidesByCommitId(commitId);
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
      
      // コミットに対応するスライドが既に存在するか確認
      const existingSlides = await storage.getSlidesByCommitId(slideData.commitId);
      const existingSlide = existingSlides.find(s => s.slideNumber === slideData.slideNumber);
      
      if (existingSlide) {
        // 既存のスライドが見つかった場合は、それを返す
        console.log(`スライド (${slideData.slideNumber}) は既に存在します。ID: ${existingSlide.id}`);
        return res.status(200).json(existingSlide);
      }
      
      // 新しいスライドを作成
      console.log(`新しいスライド (${slideData.slideNumber}) を作成します。コミットID: ${slideData.commitId}`);
      const slide = await storage.createSlide(slideData);
      res.status(201).json(slide);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid slide data", errors: error.errors });
      }
      console.error("スライド作成エラー:", error);
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
  
  // Presentation deletion using storage interface
  apiRouter.delete("/api/presentations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // First check if the presentation exists
      const presentation = await storage.getPresentation(id);
      if (!presentation) {
        return res.status(404).json({ message: "Presentation not found" });
      }
      
      console.log(`Processing delete request for presentation ID: ${id}`);

      // ストレージインターフェースを使用して削除
      const success = await storage.deletePresentation(id);
      
      if (success) {
        console.log(`Successfully deleted presentation with ID: ${id}`);
        res.status(200).json({ message: "Presentation deleted successfully" });
      } else {
        console.error(`Failed to delete presentation with ID: ${id}`);
        res.status(500).json({ message: "Failed to delete presentation" });
      }
    } catch (error) {
      console.error("Error deleting presentation:", error);
      res.status(500).json({ message: "Failed to delete presentation" });
    }
  });

  // Diffs endpoints
  apiRouter.get("/api/commits/:commitId/diffs", async (req: Request, res: Response) => {
    const commitId = parseInt(req.params.commitId);
    const diffs = await storage.getDiffsByCommitId(commitId);
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

  // コミット用のスライド自動作成エンドポイント
  apiRouter.post("/api/commits/:commitId/create-slides", async (req: Request, res: Response) => {
    try {
      const commitId = parseInt(req.params.commitId);
      const { slideCount = 1, title = "Welcome" } = req.body;
      
      // コミットの存在確認
      const commit = await storage.getCommit(commitId);
      if (!commit) {
        return res.status(404).json({ message: "Commit not found" });
      }
      
      // 既存のスライドをチェック
      const existingSlides = await storage.getSlidesByCommitId(commitId);
      
      // 既存のスライドがある場合は、そのまま返す（重複作成を防止）
      if (existingSlides.length > 0) {
        console.log(`コミット ${commitId} には既に ${existingSlides.length} 件のスライドが存在します。`);
        return res.status(200).json(existingSlides);
      }
      
      // 新しいスライドを作成
      console.log(`コミット ${commitId} の新しいスライドを ${slideCount} 件作成します。`);
      const createdSlides = [];
      
      for (let i = 1; i <= slideCount; i++) {
        const slideData = {
          commitId,
          slideNumber: i,
          title: i === 1 ? title : `Slide ${i}`,
          content: {
            elements: [
              {
                id: `title${i}`,
                type: 'text',
                x: 100,
                y: 100,
                width: 600,
                height: 100,
                content: i === 1 ? title : `Slide ${i}`,
                style: { fontSize: 32, fontWeight: 'bold', color: '#333333' }
              },
              {
                id: `subtitle${i}`,
                type: 'text',
                x: 100,
                y: 220,
                width: 600,
                height: 50,
                content: 'Created with PeerDiffX',
                style: { fontSize: 24, color: '#666666' }
              }
            ],
            background: '#ffffff'
          },
          xmlContent: `<p:sld><p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>${i === 1 ? title : `Slide ${i}`}</a:t></a:r></a:p></p:txBody></p:sp><p:sp><p:txBody><a:p><a:r><a:t>Created with PeerDiffX</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:sld>`
        };
        
        const slide = await storage.createSlide(slideData);
        console.log(`スライド ${i} を作成しました。ID: ${slide.id}`);
        createdSlides.push(slide);
      }
      
      res.status(201).json(createdSlides);
    } catch (error) {
      console.error("スライド作成エラー:", error);
      res.status(500).json({ message: "Failed to create slides" });
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
      
      const baseSlides = await storage.getSlidesByCommitId(baseCommitId);
      const compareSlides = await storage.getSlidesByCommitId(compareCommitId);
      
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

  // スナップショット機能は削除されました

  // コメント関連のエンドポイント
  apiRouter.get("/api/slides/:slideId/comments", async (req: Request, res: Response) => {
    try {
      const slideId = parseInt(req.params.slideId);
      const comments = await storage.getComments(slideId);
      res.json(comments);
    } catch (error) {
      console.error("Error getting comments:", error);
      res.status(500).json({ error: "Failed to get comments" });
    }
  });

  apiRouter.post("/api/comments", async (req: Request, res: Response) => {
    try {
      const comment = await storage.createComment(req.body);
      res.json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ error: "Failed to create comment" });
    }
  });

  apiRouter.patch("/api/comments/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updatedComment = await storage.updateComment(id, req.body);
      if (updatedComment) {
        res.json(updatedComment);
      } else {
        res.status(404).json({ error: "Comment not found" });
      }
    } catch (error) {
      console.error("Error updating comment:", error);
      res.status(500).json({ error: "Failed to update comment" });
    }
  });

  apiRouter.delete("/api/comments/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteComment(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ error: "Failed to delete comment" });
    }
  });

  apiRouter.get("/api/comments/:commentId/replies", async (req: Request, res: Response) => {
    try {
      const commentId = parseInt(req.params.commentId);
      const replies = await storage.getReplies(commentId);
      res.json(replies);
    } catch (error) {
      console.error("Error getting replies:", error);
      res.status(500).json({ error: "Failed to get replies" });
    }
  });

  // File locking endpoints for collaborative editing
  apiRouter.post("/api/presentations/:presentationId/lock", async (req: Request, res: Response) => {
    try {
      const presentationId = parseInt(req.params.presentationId);
      const userId = req.body.userId;
      const durationMinutes = req.body.durationMinutes || 30;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const lockAcquired = lockFile(presentationId, userId, durationMinutes);
      
      if (lockAcquired) {
        res.json({ 
          success: true, 
          message: "Lock acquired successfully",
          expiresInMinutes: durationMinutes
        });
      } else {
        const lockStatus = checkLockStatus(presentationId);
        res.status(409).json({ 
          success: false, 
          message: "Presentation is already locked by another user",
          lockStatus
        });
      }
    } catch (error) {
      console.error("Error locking presentation:", error);
      res.status(500).json({ error: "Failed to lock presentation" });
    }
  });

  apiRouter.post("/api/presentations/:presentationId/unlock", async (req: Request, res: Response) => {
    try {
      const presentationId = parseInt(req.params.presentationId);
      const userId = req.body.userId;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const unlockResult = unlockFile(presentationId, userId);
      
      if (unlockResult) {
        res.json({ 
          success: true, 
          message: "Presentation unlocked successfully" 
        });
      } else {
        res.status(403).json({ 
          success: false, 
          message: "You don't have permission to unlock this presentation or it's not locked" 
        });
      }
    } catch (error) {
      console.error("Error unlocking presentation:", error);
      res.status(500).json({ error: "Failed to unlock presentation" });
    }
  });

  apiRouter.get("/api/presentations/:presentationId/lock-status", async (req: Request, res: Response) => {
    try {
      const presentationId = parseInt(req.params.presentationId);
      const lockStatus = checkLockStatus(presentationId);
      
      res.json(lockStatus);
    } catch (error) {
      console.error("Error checking lock status:", error);
      res.status(500).json({ error: "Failed to check lock status" });
    }
  });

  // ================== 学生向けAPIエンドポイント ==================
  
  // 学生のプロジェクト一覧を取得
  apiRouter.get("/api/student/projects", async (req: Request, res: Response) => {
    try {
      const userId = 41964833; // 開発用ユーザーID
      
      const query = `
        SELECT 
          p.id, p.name, p.company_name as "companyName", 
          p.due_date as "dueDate", sp.status, sp.comment_count as "commentCount"
        FROM projects p
        JOIN student_projects sp ON p.id = sp.project_id
        WHERE sp.student_id = $1
        ORDER BY p.created_at DESC
      `;
      
      const result = await db.execute(query, [userId]);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching student projects:", error);
      res.status(500).json({ error: "Failed to fetch student projects" });
    }
  });

  // 学生のプロフィール情報を取得
  apiRouter.get("/api/student/profile", async (req: Request, res: Response) => {
    try {
      const userId = 41964833; // 開発用ユーザーID
      
      const query = `
        SELECT rank, total_comments as "totalComments", 
               approved_comments as "approvedComments", 
               approval_rate as "approvalRate", 
               bonus_progress as "bonusProgress"
        FROM student_profiles 
        WHERE user_id = $1
      `;
      
      const result = await db.execute(query, [userId]);
      if (result.rows.length > 0) {
        res.json(result.rows[0]);
      } else {
        // デフォルトプロフィールを返す
        res.json({
          rank: "bronze",
          totalComments: 0,
          approvedComments: 0,
          approvalRate: 0,
          bonusProgress: 0
        });
      }
    } catch (error) {
      console.error("Error fetching student profile:", error);
      res.status(500).json({ error: "Failed to fetch student profile" });
    }
  });

  // ================== 企業向けAPIエンドポイント ==================
  
  // 企業のプロジェクト統計情報を取得
  apiRouter.get("/api/corporate/projects", async (req: Request, res: Response) => {
    try {
      const userId = 41964833; // 開発用ユーザーID
      
      const query = `
        SELECT 
          p.id, p.name, p.company_name as "companyName",
          p.due_date as "dueDate", p.status,
          75 as progress, -- 仮の進捗率
          3 as "unreadComments", -- 仮の未読コメント数
          5 as "totalStudents", -- 仮の学生数
          'プレゼンテーションの全体的な構成とデザインに関する建設的なフィードバックが多数寄せられています。' as "aiSummary"
        FROM projects p
        WHERE p.created_by = $1
        ORDER BY p.created_at DESC
      `;
      
      const result = await db.execute(query, [userId]);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching corporate projects:", error);
      res.status(500).json({ error: "Failed to fetch corporate projects" });
    }
  });

  // 企業のサブスクリプション情報を取得
  apiRouter.get("/api/corporate/subscription", async (req: Request, res: Response) => {
    try {
      const userId = 41964833; // 開発用ユーザーID
      
      const query = `
        SELECT 
          plan_type as "planType",
          review_quota_used as "reviewQuotaUsed",
          review_quota_limit as "reviewQuotaLimit",
          next_billing_date as "nextBillingDate",
          is_active as "isActive"
        FROM subscriptions 
        WHERE user_id = $1 AND is_active = true
      `;
      
      const result = await db.execute(query, [userId]);
      if (result.rows.length > 0) {
        res.json(result.rows[0]);
      } else {
        // デフォルトサブスクリプション情報を返す
        res.json({
          planType: "standard",
          reviewQuotaUsed: 3,
          reviewQuotaLimit: 50,
          nextBillingDate: "2025-02-22T00:00:00Z",
          isActive: true
        });
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ error: "Failed to fetch subscription" });
    }
  });

  // 学生プロジェクト詳細ページ用エンドポイント
  apiRouter.get("/api/student/project/:projectId", async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const userId = 41964833; // 開発用ユーザーID
      
      const query = `
        SELECT 
          p.id, p.name, p.description, p.company_name as "companyName",
          p.due_date as "dueDate", sp.status, sp.comment_count as "commentCount",
          pr.id as "presentationId"
        FROM projects p
        JOIN student_projects sp ON p.id = sp.project_id
        JOIN presentations pr ON p.presentation_id = pr.id
        WHERE p.id = $1 AND sp.student_id = $2
      `;
      
      const result = await db.execute(query, [projectId, userId]);
      if (result.rows.length > 0) {
        res.json(result.rows[0]);
      } else {
        res.status(404).json({ error: "Project not found" });
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
      res.status(500).json({ error: "Failed to fetch project details" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
