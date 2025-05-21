import {
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
import { IStorage } from "./storage";

// Implement storage class using memory for prototyping
export class MemStorage implements IStorage {
  private users: User[] = [];
  private presentations: Presentation[] = [];
  private branches: Branch[] = [];
  private commits: Commit[] = [];
  private slides: Slide[] = [];
  private diffs: Diff[] = [];
  private snapshots: Snapshot[] = [];
  private comments: Comment[] = [];
  private nextId = {
    user: 1,
    presentation: 1,
    branch: 1,
    commit: 1,
    slide: 1,
    diff: 1,
    comment: 1
  };

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.nextId.user++;
    const user: User = {
      ...userData,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.push(user);
    return user;
  }

  // Presentation operations
  async getPresentations(): Promise<Presentation[]> {
    return this.presentations;
  }

  async getPresentationsByUserId(userId: number): Promise<Presentation[]> {
    return this.presentations.filter(presentation => presentation.userId === userId);
  }

  async getPresentation(id: number): Promise<Presentation | undefined> {
    return this.presentations.find(presentation => presentation.id === id);
  }

  async createPresentation(presentationData: InsertPresentation): Promise<Presentation> {
    const id = this.nextId.presentation++;
    const presentation: Presentation = {
      ...presentationData,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.presentations.push(presentation);
    return presentation;
  }

  async updatePresentation(id: number, updates: Partial<InsertPresentation>): Promise<Presentation | undefined> {
    const index = this.presentations.findIndex(presentation => presentation.id === id);
    if (index === -1) return undefined;
    
    this.presentations[index] = {
      ...this.presentations[index],
      ...updates,
      updatedAt: new Date()
    };
    
    return this.presentations[index];
  }

  async deletePresentation(id: number): Promise<void> {
    const index = this.presentations.findIndex(presentation => presentation.id === id);
    if (index !== -1) {
      this.presentations.splice(index, 1);
    }
  }

  // Branch operations
  async getBranchesByPresentationId(presentationId: number): Promise<Branch[]> {
    return this.branches.filter(branch => branch.presentationId === presentationId);
  }

  async getBranch(id: number): Promise<Branch | undefined> {
    return this.branches.find(branch => branch.id === id);
  }

  async getDefaultBranch(presentationId: number): Promise<Branch | undefined> {
    return this.branches.find(branch => branch.presentationId === presentationId && branch.isDefault);
  }

  async createBranch(branchData: InsertBranch): Promise<Branch> {
    const id = this.nextId.branch++;
    const branch: Branch = {
      ...branchData,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.branches.push(branch);
    return branch;
  }

  async updateBranch(id: number, updates: Partial<InsertBranch>): Promise<Branch | undefined> {
    const index = this.branches.findIndex(branch => branch.id === id);
    if (index === -1) return undefined;
    
    this.branches[index] = {
      ...this.branches[index],
      ...updates,
      updatedAt: new Date()
    };
    
    return this.branches[index];
  }

  async deleteBranch(id: number): Promise<void> {
    const index = this.branches.findIndex(branch => branch.id === id);
    if (index !== -1) {
      this.branches.splice(index, 1);
    }
  }

  // Commit operations
  async getCommitsByBranchId(branchId: number): Promise<Commit[]> {
    return this.commits.filter(commit => commit.branchId === branchId);
  }

  async getCommit(id: number): Promise<Commit | undefined> {
    return this.commits.find(commit => commit.id === id);
  }

  async getLatestCommit(branchId: number): Promise<Commit | undefined> {
    const branchCommits = this.commits.filter(commit => commit.branchId === branchId);
    if (branchCommits.length === 0) return undefined;
    
    // Sort by timestamp descending and return the most recent
    return branchCommits.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    })[0];
  }

  async createCommit(commitData: InsertCommit): Promise<Commit> {
    const id = this.nextId.commit++;
    const commit: Commit = {
      ...commitData,
      id,
      timestamp: commitData.timestamp || new Date(),
    };
    this.commits.push(commit);
    return commit;
  }

  // Slide operations
  async getSlidesByCommitId(commitId: number): Promise<Slide[]> {
    return this.slides.filter(slide => slide.commitId === commitId);
  }

  async getSlide(id: number): Promise<Slide | undefined> {
    return this.slides.find(slide => slide.id === id);
  }

  async createSlide(slideData: InsertSlide): Promise<Slide> {
    const id = this.nextId.slide++;
    const slide: Slide = {
      ...slideData,
      id
    };
    this.slides.push(slide);
    return slide;
  }

  async updateSlide(id: number, updates: Partial<InsertSlide>): Promise<Slide | undefined> {
    const index = this.slides.findIndex(slide => slide.id === id);
    if (index === -1) return undefined;
    
    this.slides[index] = {
      ...this.slides[index],
      ...updates
    };
    
    return this.slides[index];
  }

  async deleteSlide(id: number): Promise<void> {
    const index = this.slides.findIndex(slide => slide.id === id);
    if (index !== -1) {
      this.slides.splice(index, 1);
    }
  }

  // Diff operations
  async getDiffsByCommitId(commitId: number): Promise<Diff[]> {
    return this.diffs.filter(diff => diff.commitId === commitId);
  }

  async getDiff(id: number): Promise<Diff | undefined> {
    return this.diffs.find(diff => diff.id === id);
  }

  async createDiff(diffData: InsertDiff): Promise<Diff> {
    const id = this.nextId.diff++;
    const diff: Diff = {
      ...diffData,
      id
    };
    this.diffs.push(diff);
    return diff;
  }

  // Snapshot operations
  async getSnapshot(id: string): Promise<Snapshot | undefined> {
    return this.snapshots.find(snapshot => snapshot.id === id);
  }

  async createSnapshot(snapshotData: InsertSnapshot): Promise<Snapshot> {
    const snapshot: Snapshot = {
      ...snapshotData,
      accessCount: 0,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + (24 * 60 * 60 * 1000)) // 24 hours expiry
    };
    this.snapshots.push(snapshot);
    return snapshot;
  }

  async updateSnapshotAccessCount(id: string): Promise<Snapshot | undefined> {
    const index = this.snapshots.findIndex(snapshot => snapshot.id === id);
    if (index === -1) return undefined;
    
    this.snapshots[index].accessCount++;
    return this.snapshots[index];
  }

  async deleteExpiredSnapshots(): Promise<number> {
    const now = new Date();
    const initialCount = this.snapshots.length;
    
    this.snapshots = this.snapshots.filter(snapshot => {
      return new Date(snapshot.expiresAt) > now;
    });
    
    return initialCount - this.snapshots.length;
  }

  // Comment operations
  async getComments(slideId: number): Promise<Comment[]> {
    return this.comments.filter(comment => comment.slideId === slideId && comment.parentId === null);
  }
  
  async getComment(id: number): Promise<Comment | undefined> {
    return this.comments.find(comment => comment.id === id);
  }
  
  async createComment(commentData: InsertComment): Promise<Comment> {
    const id = this.nextId.comment++;
    const comment: Comment = {
      ...commentData,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.comments.push(comment);
    return comment;
  }
  
  async updateComment(id: number, updates: Partial<InsertComment>): Promise<Comment | undefined> {
    const index = this.comments.findIndex(comment => comment.id === id);
    if (index === -1) return undefined;
    
    this.comments[index] = {
      ...this.comments[index],
      ...updates,
      updatedAt: new Date()
    };
    
    return this.comments[index];
  }
  
  async deleteComment(id: number): Promise<void> {
    const index = this.comments.findIndex(comment => comment.id === id);
    if (index !== -1) {
      this.comments.splice(index, 1);
    }
  }
  
  async getReplies(commentId: number): Promise<Comment[]> {
    return this.comments.filter(comment => comment.parentId === commentId);
  }
}