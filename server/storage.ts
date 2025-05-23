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
  type Comment,
  type InsertComment
} from "@shared/schema";
import { DatabaseStorage } from "./storage-db";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: Partial<InsertUser>): Promise<User>;
  
  // Presentation operations
  getPresentations(): Promise<Presentation[]>;
  getPresentationsByUserId(userId: number): Promise<Presentation[]>;
  getPresentation(id: number): Promise<Presentation | undefined>;
  createPresentation(presentation: InsertPresentation): Promise<Presentation>;
  updatePresentation(id: number, presentation: Partial<InsertPresentation>): Promise<Presentation | undefined>;
  deletePresentation(id: number): Promise<boolean>;
  
  // Branch operations
  getBranchesByPresentationId(presentationId: number): Promise<Branch[]>;
  getBranch(id: number): Promise<Branch | undefined>;
  getDefaultBranch(presentationId: number): Promise<Branch | undefined>;
  createBranch(branch: InsertBranch): Promise<Branch>;
  updateBranch(id: number, branch: Partial<InsertBranch>): Promise<Branch | undefined>;
  deleteBranch(id: number): Promise<void>;
  
  // Commit operations
  getCommitsByBranchId(branchId: number): Promise<Commit[]>;
  getCommit(id: number): Promise<Commit | undefined>;
  getLatestCommit(branchId: number): Promise<Commit | undefined>;
  createCommit(commit: InsertCommit): Promise<Commit>;
  
  // Slide operations
  getSlidesByCommitId(commitId: number): Promise<Slide[]>;
  getSlide(id: number): Promise<Slide | undefined>;
  createSlide(slide: InsertSlide): Promise<Slide>;
  updateSlide(id: number, slide: Partial<InsertSlide>): Promise<Slide | undefined>;
  deleteSlide(id: number): Promise<void>;
  
  // Diff operations
  getDiffsByCommitId(commitId: number): Promise<Diff[]>;
  getDiff(id: number): Promise<Diff | undefined>;
  createDiff(diff: InsertDiff): Promise<Diff>;
  
  // Snapshot operations removed
  
  // Comment operations
  getComments(slideId: number): Promise<Comment[]>;
  getComment(id: number): Promise<Comment | undefined>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: number, comment: Partial<InsertComment>): Promise<Comment | undefined>;
  deleteComment(id: number): Promise<void>;
  getReplies(commentId: number): Promise<Comment[]>;
}

// Create and export a DatabaseStorage instance to use PostgreSQL database
export const storage = new DatabaseStorage();