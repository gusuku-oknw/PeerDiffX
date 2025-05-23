import { 
  users, type User, type InsertUser,
  presentations, type Presentation, type InsertPresentation,
  branches, type Branch, type InsertBranch,
  commits, type Commit, type InsertCommit,
  slides, type Slide, type InsertSlide,
  diffs, type Diff, type InsertDiff,
  comments, type Comment, type InsertComment,
  presentationAccess
} from "../shared/schema";
import { db } from "./db";
import { eq, and, desc, lt, isNull, or, inArray } from "drizzle-orm";
import { IStorage } from "./storage";
import { v4 as uuidv4 } from 'uuid';

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
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
  
  async upsertUser(userData: Partial<InsertUser>): Promise<User> {
    if (!userData.id) {
      throw new Error("User ID is required for upsert operation");
    }
    
    const [user] = await db
      .insert(users)
      .values({
        id: userData.id,
        username: userData.username || userData.id,
        password: userData.password || '',
        email: userData.email || null,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        profileImageUrl: userData.profileImageUrl || null,
        organization: userData.organization || null,
        roleId: userData.roleId || 2, // Default to regular user role
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        lastLogin: new Date()
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email || undefined,
          firstName: userData.firstName || undefined,
          lastName: userData.lastName || undefined,
          profileImageUrl: userData.profileImageUrl || undefined,
          lastLogin: new Date(),
        }
      })
      .returning();
    
    return user;
  }

  // Presentation operations
  async getPresentations(): Promise<Presentation[]> {
    return await db.select().from(presentations);
  }

  async getPresentationsByUserId(userId: number | string): Promise<Presentation[]> {
    const userIdStr = String(userId);
    return await db.select().from(presentations).where(eq(presentations.userId, userIdStr));
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
    const [updatedPresentation] = await db
      .update(presentations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(presentations.id, id))
      .returning();
    return updatedPresentation;
  }

  async deletePresentation(id: number): Promise<boolean> {
    try {
      console.log(`Deleting presentation with ID: ${id}`);
      
      // トランザクションを使って、すべての関連データを順番に削除する
      await db.transaction(async (tx) => {
        // まず、この発表に関連するブランチを取得
        const relatedBranches = await tx.select().from(branches).where(eq(branches.presentationId, id));
        console.log(`Found ${relatedBranches.length} branches to delete`);
        
        // すべてのコミットIDを収集（diff削除で必要）
        const allCommitIds: number[] = [];
        
        for (const branch of relatedBranches) {
          // ブランチに関連するコミットを取得
          const relatedCommits = await tx.select().from(commits).where(eq(commits.branchId, branch.id));
          console.log(`Branch ${branch.id}: Found ${relatedCommits.length} commits to delete`);
          
          // コミットIDを収集
          allCommitIds.push(...relatedCommits.map(commit => commit.id));
          
          for (const commit of relatedCommits) {
            // コメントの削除 (もし存在するなら)
            const relatedSlides = await tx.select().from(slides).where(eq(slides.commitId, commit.id));
            for (const slide of relatedSlides) {
              await tx.delete(comments).where(eq(comments.slideId, slide.id));
            }
            
            // スライドの削除
            await tx.delete(slides).where(eq(slides.commitId, commit.id));
          }
          
          // コミットの削除（diffはまだ削除しない）
          await tx.delete(commits).where(eq(commits.branchId, branch.id));
        }
        
        // 収集したすべてのコミットIDに関連するdiffを削除
        // Diffs table uses commitId field
        if (allCommitIds.length > 0) {
          for (const commitId of allCommitIds) {
            await tx.delete(diffs).where(eq(diffs.commitId, commitId));
          }
          console.log(`Deleted diffs related to ${allCommitIds.length} commits`);
        }
        
        // ブランチの削除
        await tx.delete(branches).where(eq(branches.presentationId, id));
        
        // スナップショット機能削除済み
        
        // アクセス権の削除（存在する場合）
        try {
          await tx.delete(presentationAccess).where(eq(presentationAccess.presentationId, id));
        } catch (e) {
          console.log('No presentation access to delete, continuing...');
        }
        
        // 最後にプレゼンテーション自体を削除
        await tx.delete(presentations).where(eq(presentations.id, id));
        console.log(`Presentation ${id} deleted successfully`);
      });
      
      return true;
    } catch (error) {
      console.error(`Error during presentation deletion (ID: ${id}):`, error);
      throw error; // エラーを再スローして適切なエラーハンドリングを可能に
    }
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
    // If this is the default branch, make sure no other branches for this presentation are default
    if (branchData.isDefault) {
      await db
        .update(branches)
        .set({ isDefault: false })
        .where(eq(branches.presentationId, branchData.presentationId));
    }
    
    const [branch] = await db.insert(branches).values(branchData).returning();
    return branch;
  }

  async updateBranch(id: number, updates: Partial<InsertBranch>): Promise<Branch | undefined> {
    // If this branch is being set as default, unset other default branches
    if (updates.isDefault) {
      const [branch] = await db.select().from(branches).where(eq(branches.id, id));
      if (branch) {
        await db
          .update(branches)
          .set({ isDefault: false })
          .where(and(
            eq(branches.presentationId, branch.presentationId),
            eq(branches.isDefault, true)
          ));
      }
    }

    const [updatedBranch] = await db
      .update(branches)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(branches.id, id))
      .returning();
    return updatedBranch;
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
    const [latestCommit] = await db
      .select()
      .from(commits)
      .where(eq(commits.branchId, branchId))
      .orderBy(desc(commits.createdAt))
      .limit(1);
    return latestCommit;
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
    const [updatedSlide] = await db
      .update(slides)
      .set(updates)
      .where(eq(slides.id, id))
      .returning();
    return updatedSlide;
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

  // Snapshot operations removed

  // Comment operations
  async getComments(slideId: number): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(and(
        eq(comments.slideId, slideId),
        isNull(comments.parentId)
      ))
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
    const [updatedComment] = await db
      .update(comments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(comments.id, id))
      .returning();
    return updatedComment;
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