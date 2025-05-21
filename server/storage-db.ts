import { 
  users, 
  presentations, 
  branches, 
  commits, 
  slides, 
  diffs, 
  snapshots,
  comments,
  type User,
  type InsertUser,
  type Presentation,
  type InsertPresentation,
  type Branch,
  type InsertBranch,
  type Commit,
  type InsertCommit,
  type Slide,
  type InsertSlide,
  type Diff,
  type InsertDiff,
  type Snapshot,
  type InsertSnapshot,
  type Comment,
  type InsertComment
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, lt, isNull } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }
  
  // Presentation operations
  async getPresentations(): Promise<Presentation[]> {
    return await db.select().from(presentations);
  }

  async getPresentationsByUserId(userId: number): Promise<Presentation[]> {
    return await db.select().from(presentations).where(eq(presentations.userId, userId));
  }

  async getPresentation(id: number): Promise<Presentation | undefined> {
    const [presentation] = await db.select().from(presentations).where(eq(presentations.id, id));
    return presentation;
  }

  async createPresentation(presentationData: InsertPresentation): Promise<Presentation> {
    const [presentation] = await db.insert(presentations).values(presentationData).returning();
    return presentation;
  }

  async updatePresentation(id: number, updates: Partial<InsertPresentation>): Promise<Presentation | undefined> {
    const [presentation] = await db
      .update(presentations)
      .set(updates)
      .where(eq(presentations.id, id))
      .returning();
    return presentation;
  }

  async deletePresentation(id: number): Promise<void> {
    await db.delete(presentations).where(eq(presentations.id, id));
  }
  
  // Branch operations
  async getBranchesByPresentationId(presentationId: number): Promise<Branch[]> {
    return await db
      .select()
      .from(branches)
      .where(eq(branches.presentationId, presentationId));
  }

  async getBranch(id: number): Promise<Branch | undefined> {
    const [branch] = await db.select().from(branches).where(eq(branches.id, id));
    return branch;
  }

  async getDefaultBranch(presentationId: number): Promise<Branch | undefined> {
    const [branch] = await db
      .select()
      .from(branches)
      .where(
        and(
          eq(branches.presentationId, presentationId),
          eq(branches.isDefault, true)
        )
      );
    return branch;
  }

  async createBranch(branchData: InsertBranch): Promise<Branch> {
    const [branch] = await db.insert(branches).values(branchData).returning();
    return branch;
  }

  async updateBranch(id: number, updates: Partial<InsertBranch>): Promise<Branch | undefined> {
    const [branch] = await db
      .update(branches)
      .set(updates)
      .where(eq(branches.id, id))
      .returning();
    return branch;
  }

  async deleteBranch(id: number): Promise<void> {
    await db.delete(branches).where(eq(branches.id, id));
  }
  
  // Commit operations
  async getCommitsByBranchId(branchId: number): Promise<Commit[]> {
    return await db
      .select()
      .from(commits)
      .where(eq(commits.branchId, branchId))
      .orderBy(desc(commits.createdAt));
  }

  async getCommit(id: number): Promise<Commit | undefined> {
    const [commit] = await db.select().from(commits).where(eq(commits.id, id));
    return commit;
  }

  async getLatestCommit(branchId: number): Promise<Commit | undefined> {
    const [commit] = await db
      .select()
      .from(commits)
      .where(eq(commits.branchId, branchId))
      .orderBy(desc(commits.createdAt))
      .limit(1);
    return commit;
  }

  async createCommit(commitData: InsertCommit): Promise<Commit> {
    const [commit] = await db.insert(commits).values(commitData).returning();
    return commit;
  }
  
  // Slide operations
  async getSlidesByCommitId(commitId: number): Promise<Slide[]> {
    return await db
      .select()
      .from(slides)
      .where(eq(slides.commitId, commitId))
      .orderBy(slides.slideNumber);
  }

  async getSlide(id: number): Promise<Slide | undefined> {
    const [slide] = await db.select().from(slides).where(eq(slides.id, id));
    return slide;
  }

  async createSlide(slideData: InsertSlide): Promise<Slide> {
    const [slide] = await db.insert(slides).values(slideData).returning();
    return slide;
  }

  async updateSlide(id: number, updates: Partial<InsertSlide>): Promise<Slide | undefined> {
    const [slide] = await db
      .update(slides)
      .set(updates)
      .where(eq(slides.id, id))
      .returning();
    return slide;
  }

  async deleteSlide(id: number): Promise<void> {
    await db.delete(slides).where(eq(slides.id, id));
  }
  
  // Diff operations
  async getDiffsByCommitId(commitId: number): Promise<Diff[]> {
    return await db
      .select()
      .from(diffs)
      .where(eq(diffs.commitId, commitId));
  }

  async getDiff(id: number): Promise<Diff | undefined> {
    const [diff] = await db.select().from(diffs).where(eq(diffs.id, id));
    return diff;
  }

  async createDiff(diffData: InsertDiff): Promise<Diff> {
    const [diff] = await db.insert(diffs).values(diffData).returning();
    return diff;
  }
  
  // Snapshot operations
  async getSnapshot(id: string): Promise<Snapshot | undefined> {
    const [snapshot] = await db.select().from(snapshots).where(eq(snapshots.id, id));
    return snapshot;
  }

  async createSnapshot(snapshotData: InsertSnapshot): Promise<Snapshot> {
    const [snapshot] = await db.insert(snapshots).values({
      ...snapshotData,
      data: snapshotData.data || {}
    }).returning();
    return snapshot;
  }

  async updateSnapshotAccessCount(id: string): Promise<Snapshot | undefined> {
    const [snapshot] = await db
      .update(snapshots)
      .set({
        accessCount: sql`${snapshots.accessCount} + 1`
      })
      .where(eq(snapshots.id, id))
      .returning();
    return snapshot;
  }

  async deleteExpiredSnapshots(): Promise<number> {
    const now = new Date();
    const result = await db
      .delete(snapshots)
      .where(lt(snapshots.expiresAt, now));
    
    // For PostgreSQL, deletedCount is available in the result
    return Number(result.count) || 0;
  }
  
  // Comment operations
  async getComments(slideId: number): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(
        and(
          eq(comments.slideId, slideId),
          isNull(comments.parentId)
        )
      )
      .orderBy(comments.createdAt);
  }

  async getComment(id: number): Promise<Comment | undefined> {
    const [comment] = await db.select().from(comments).where(eq(comments.id, id));
    return comment;
  }

  async createComment(commentData: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(commentData).returning();
    return comment;
  }

  async updateComment(id: number, updates: Partial<InsertComment>): Promise<Comment | undefined> {
    const [comment] = await db
      .update(comments)
      .set(updates)
      .where(eq(comments.id, id))
      .returning();
    return comment;
  }

  async deleteComment(id: number): Promise<void> {
    await db.delete(comments).where(eq(comments.id, id));
  }

  async getReplies(commentId: number): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.parentId, commentId))
      .orderBy(comments.createdAt);
  }
}