import { users, type User, type InsertUser } from "@shared/schema";
import { presentations, type Presentation, type InsertPresentation } from "@shared/schema";
import { branches, type Branch, type InsertBranch } from "@shared/schema";
import { commits, type Commit, type InsertCommit } from "@shared/schema";
import { slides, type Slide, type InsertSlide } from "@shared/schema";
import { diffs, type Diff, type InsertDiff } from "@shared/schema";
import { snapshots, type Snapshot, type InsertSnapshot } from "@shared/schema";
import { comments, type Comment, type InsertComment } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, lt, isNull } from "drizzle-orm";

import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Presentation operations
  async getPresentations(userId: number): Promise<Presentation[]> {
    return await db.select().from(presentations).where(eq(presentations.userId, userId));
  }

  async getPresentation(id: number): Promise<Presentation | undefined> {
    const [presentation] = await db.select().from(presentations).where(eq(presentations.id, id));
    return presentation || undefined;
  }

  async createPresentation(presentation: InsertPresentation): Promise<Presentation> {
    const [newPresentation] = await db.insert(presentations).values(presentation).returning();
    return newPresentation;
  }

  async updatePresentation(id: number, presentation: Partial<Presentation>): Promise<Presentation | undefined> {
    const [updatedPresentation] = await db
      .update(presentations)
      .set(presentation)
      .where(eq(presentations.id, id))
      .returning();
    return updatedPresentation || undefined;
  }

  async deletePresentation(id: number): Promise<boolean> {
    const result = await db.delete(presentations).where(eq(presentations.id, id)).returning();
    return result.length > 0;
  }
  
  // Branch operations
  async getBranches(presentationId: number): Promise<Branch[]> {
    return await db.select().from(branches).where(eq(branches.presentationId, presentationId));
  }

  async getBranch(id: number): Promise<Branch | undefined> {
    const [branch] = await db.select().from(branches).where(eq(branches.id, id));
    return branch || undefined;
  }

  async getDefaultBranch(presentationId: number): Promise<Branch | undefined> {
    const [branch] = await db
      .select()
      .from(branches)
      .where(and(
        eq(branches.presentationId, presentationId),
        eq(branches.isDefault, true)
      ));
    return branch || undefined;
  }

  async createBranch(branch: InsertBranch): Promise<Branch> {
    const [newBranch] = await db.insert(branches).values(branch).returning();
    return newBranch;
  }

  async updateBranch(id: number, branch: Partial<Branch>): Promise<Branch | undefined> {
    const [updatedBranch] = await db
      .update(branches)
      .set(branch)
      .where(eq(branches.id, id))
      .returning();
    return updatedBranch || undefined;
  }

  async deleteBranch(id: number): Promise<boolean> {
    const result = await db.delete(branches).where(eq(branches.id, id)).returning();
    return result.length > 0;
  }
  
  // Commit operations
  async getCommits(branchId: number): Promise<Commit[]> {
    const results = await db
      .select()
      .from(commits)
      .where(eq(commits.branchId, branchId))
      .orderBy(desc(commits.createdAt));
    return results as Commit[];
  }

  async getCommit(id: number): Promise<Commit | undefined> {
    const result = await db.select().from(commits).where(eq(commits.id, id));
    return result[0] as Commit | undefined;
  }

  async createCommit(commit: InsertCommit): Promise<Commit> {
    const [newCommit] = await db.insert(commits).values(commit).returning();
    return newCommit;
  }
  
  // Slide operations
  async getSlides(commitId: number): Promise<Slide[]> {
    return await db
      .select()
      .from(slides)
      .where(eq(slides.commitId, commitId))
      .orderBy(slides.slideNumber);
  }

  async getSlide(id: number): Promise<Slide | undefined> {
    const [slide] = await db.select().from(slides).where(eq(slides.id, id));
    return slide || undefined;
  }

  async createSlide(slide: InsertSlide): Promise<Slide> {
    const [newSlide] = await db.insert(slides).values(slide).returning();
    return newSlide;
  }

  async updateSlide(id: number, slide: Partial<Slide>): Promise<Slide | undefined> {
    const [updatedSlide] = await db
      .update(slides)
      .set(slide)
      .where(eq(slides.id, id))
      .returning();
    return updatedSlide || undefined;
  }
  
  // Diff operations
  async getDiffs(commitId: number): Promise<Diff[]> {
    return await db.select().from(diffs).where(eq(diffs.commitId, commitId));
  }

  async getDiff(id: number): Promise<Diff | undefined> {
    const [diff] = await db.select().from(diffs).where(eq(diffs.id, id));
    return diff || undefined;
  }

  async createDiff(diff: InsertDiff): Promise<Diff> {
    const [newDiff] = await db.insert(diffs).values(diff).returning();
    return newDiff;
  }

  // スナップショット操作
  async getSnapshot(id: string): Promise<Snapshot | undefined> {
    const [snapshot] = await db.select().from(snapshots).where(eq(snapshots.id, id));
    return snapshot || undefined;
  }

  async createSnapshot(snapshot: InsertSnapshot): Promise<Snapshot> {
    const [newSnapshot] = await db.insert(snapshots).values(snapshot).returning();
    return newSnapshot;
  }

  async updateSnapshotAccessCount(id: string): Promise<Snapshot | undefined> {
    const snapshot = await this.getSnapshot(id);
    if (!snapshot) return undefined;

    const [updatedSnapshot] = await db
      .update(snapshots)
      .set({ accessCount: snapshot.accessCount + 1 })
      .where(eq(snapshots.id, id))
      .returning();
      
    return updatedSnapshot || undefined;
  }

  async deleteExpiredSnapshots(): Promise<number> {
    const now = new Date();
    const result = await db
      .delete(snapshots)
      .where(lt(snapshots.expiresAt, now))
      .returning();
      
    return result.length;
  }

  // コメント機能の実装
  async getComments(slideId: number): Promise<Comment[]> {
    return db
      .select()
      .from(comments)
      .where(and(
        eq(comments.slideId, slideId), 
        isNull(comments.parentId)
      ))
      .orderBy(desc(comments.createdAt));
  }

  async getComment(id: number): Promise<Comment | undefined> {
    const [comment] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, id));
    return comment || undefined;
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db
      .insert(comments)
      .values(comment)
      .returning();
    return newComment;
  }

  async updateComment(id: number, comment: Partial<Comment>): Promise<Comment | undefined> {
    const [updatedComment] = await db
      .update(comments)
      .set({ ...comment, updatedAt: new Date() })
      .where(eq(comments.id, id))
      .returning();
    return updatedComment || undefined;
  }

  async deleteComment(id: number): Promise<boolean> {
    const result = await db
      .delete(comments)
      .where(eq(comments.id, id))
      .returning();
    return result.length > 0;
  }

  async getReplies(commentId: number): Promise<Comment[]> {
    return db
      .select()
      .from(comments)
      .where(eq(comments.parentId, commentId))
      .orderBy(comments.createdAt);
  }
}