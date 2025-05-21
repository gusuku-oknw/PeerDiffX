import { users, type User, type InsertUser } from "@shared/schema";
import { presentations, type Presentation, type InsertPresentation } from "@shared/schema";
import { branches, type Branch, type InsertBranch } from "@shared/schema";
import { commits, type Commit, type InsertCommit } from "@shared/schema";
import { slides, type Slide, type InsertSlide } from "@shared/schema";
import { diffs, type Diff, type InsertDiff } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

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
    return await db
      .select()
      .from(commits)
      .where(eq(commits.branchId, branchId))
      .orderBy(desc(commits.createdAt));
  }

  async getCommit(id: number): Promise<Commit | undefined> {
    const [commit] = await db.select().from(commits).where(eq(commits.id, id));
    return commit || undefined;
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
}