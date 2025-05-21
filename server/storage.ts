import { User, InsertUser, Presentation, InsertPresentation, Branch, InsertBranch, Commit, InsertCommit, Slide, InsertSlide, Diff, InsertDiff, SlideContent, DiffContent, Snapshot, InsertSnapshot } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Presentation operations
  getPresentations(userId: number): Promise<Presentation[]>;
  getPresentation(id: number): Promise<Presentation | undefined>;
  createPresentation(presentation: InsertPresentation): Promise<Presentation>;
  updatePresentation(id: number, presentation: Partial<Presentation>): Promise<Presentation | undefined>;
  deletePresentation(id: number): Promise<boolean>;
  
  // Branch operations
  getBranches(presentationId: number): Promise<Branch[]>;
  getBranch(id: number): Promise<Branch | undefined>;
  getDefaultBranch(presentationId: number): Promise<Branch | undefined>;
  createBranch(branch: InsertBranch): Promise<Branch>;
  updateBranch(id: number, branch: Partial<Branch>): Promise<Branch | undefined>;
  deleteBranch(id: number): Promise<boolean>;
  
  // Commit operations
  getCommits(branchId: number): Promise<Commit[]>;
  getCommit(id: number): Promise<Commit | undefined>;
  createCommit(commit: InsertCommit): Promise<Commit>;
  
  // Slide operations
  getSlides(commitId: number): Promise<Slide[]>;
  getSlide(id: number): Promise<Slide | undefined>;
  createSlide(slide: InsertSlide): Promise<Slide>;
  updateSlide(id: number, slide: Partial<Slide>): Promise<Slide | undefined>;
  
  // Diff operations
  getDiffs(commitId: number): Promise<Diff[]>;
  getDiff(id: number): Promise<Diff | undefined>;
  createDiff(diff: InsertDiff): Promise<Diff>;
  
  // Snapshot operations
  getSnapshot(id: string): Promise<Snapshot | undefined>;
  createSnapshot(snapshot: InsertSnapshot): Promise<Snapshot>;
  updateSnapshotAccessCount(id: string): Promise<Snapshot | undefined>;
  deleteExpiredSnapshots(): Promise<number>; // 削除された数を返す
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private presentations: Map<number, Presentation>;
  private branches: Map<number, Branch>;
  private commits: Map<number, Commit>;
  private slides: Map<number, Slide>;
  private diffs: Map<number, Diff>;
  
  private userId: number;
  private presentationId: number;
  private branchId: number;
  private commitId: number;
  private slideId: number;
  private diffId: number;

  constructor() {
    this.users = new Map();
    this.presentations = new Map();
    this.branches = new Map();
    this.commits = new Map();
    this.slides = new Map();
    this.diffs = new Map();
    
    this.userId = 1;
    this.presentationId = 1;
    this.branchId = 1;
    this.commitId = 1;
    this.slideId = 1;
    this.diffId = 1;
    
    // Initialize with demo data
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Create a demo user
    const demoUser: User = {
      id: this.userId++,
      username: "demo",
      password: "password"
    };
    this.users.set(demoUser.id, demoUser);
    
    // Create a demo presentation
    const demoPresentation: Presentation = {
      id: this.presentationId++,
      name: "Q4_Presentation.pptx",
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: demoUser.id
    };
    this.presentations.set(demoPresentation.id, demoPresentation);
    
    // Create main branch
    const mainBranch: Branch = {
      id: this.branchId++,
      name: "main",
      description: "Main branch",
      presentationId: demoPresentation.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDefault: true
    };
    this.branches.set(mainBranch.id, mainBranch);
    
    // Create feature branch
    const featureBranch: Branch = {
      id: this.branchId++,
      name: "feature/new-slides",
      description: "New slides for Q4 presentation",
      presentationId: demoPresentation.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDefault: false
    };
    this.branches.set(featureBranch.id, featureBranch);
    
    // Create design branch
    const designBranch: Branch = {
      id: this.branchId++,
      name: "design/improvements",
      description: "Design improvements for the presentation",
      presentationId: demoPresentation.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDefault: false
    };
    this.branches.set(designBranch.id, designBranch);
    
    // Create initial commit
    const initialCommit: Commit = {
      id: this.commitId++,
      message: "Initial slide creation",
      branchId: mainBranch.id,
      userId: demoUser.id,
      parentId: null,
      createdAt: new Date(Date.now() - 86400000) // yesterday
    };
    this.commits.set(initialCommit.id, initialCommit);
    
    // Create design merge commit
    const designMergeCommit: Commit = {
      id: this.commitId++,
      message: "Merged from feature/slide-design",
      branchId: mainBranch.id,
      userId: demoUser.id,
      parentId: initialCommit.id,
      createdAt: new Date(Date.now() - 7200000) // 2 hours ago
    };
    this.commits.set(designMergeCommit.id, designMergeCommit);
    
    // Create latest commit
    const latestCommit: Commit = {
      id: this.commitId++,
      message: "Update slide content",
      branchId: mainBranch.id,
      userId: demoUser.id,
      parentId: designMergeCommit.id,
      createdAt: new Date(Date.now() - 600000) // 10 minutes ago
    };
    this.commits.set(latestCommit.id, latestCommit);
    
    // Create slides
    const titleSlide: Slide = {
      id: this.slideId++,
      commitId: latestCommit.id,
      slideNumber: 1,
      title: "Title Slide",
      content: { elements: [] } as SlideContent,
      thumbnail: "",
      xmlContent: "<p:sld></p:sld>"
    };
    this.slides.set(titleSlide.id, titleSlide);
    
    const contentSlide: Slide = {
      id: this.slideId++,
      commitId: latestCommit.id,
      slideNumber: 2,
      title: "Project Overview",
      content: { elements: [] } as SlideContent,
      thumbnail: "",
      xmlContent: "<p:sld></p:sld>"
    };
    this.slides.set(contentSlide.id, contentSlide);
    
    const chartSlide: Slide = {
      id: this.slideId++,
      commitId: latestCommit.id,
      slideNumber: 3,
      title: "Chart",
      content: { elements: [] } as SlideContent,
      thumbnail: "",
      xmlContent: "<p:sld></p:sld>"
    };
    this.slides.set(chartSlide.id, chartSlide);
    
    const imageSlide: Slide = {
      id: this.slideId++,
      commitId: latestCommit.id,
      slideNumber: 4,
      title: "Image",
      content: { elements: [] } as SlideContent,
      thumbnail: "",
      xmlContent: "<p:sld></p:sld>"
    };
    this.slides.set(imageSlide.id, imageSlide);
    
    // Create diff for latest commit
    const contentSlideDiff: Diff = {
      id: this.diffId++,
      commitId: latestCommit.id,
      slideId: contentSlide.id,
      diffContent: {} as DiffContent,
      xmlDiff: "<diff></diff>",
      changeType: "modified"
    };
    this.diffs.set(contentSlideDiff.id, contentSlideDiff);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Presentation operations
  async getPresentations(userId: number): Promise<Presentation[]> {
    return Array.from(this.presentations.values()).filter(
      (presentation) => presentation.userId === userId,
    );
  }
  
  async getPresentation(id: number): Promise<Presentation | undefined> {
    return this.presentations.get(id);
  }
  
  async createPresentation(presentation: InsertPresentation): Promise<Presentation> {
    const id = this.presentationId++;
    const now = new Date();
    const newPresentation: Presentation = { 
      ...presentation, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.presentations.set(id, newPresentation);
    
    // Create default main branch
    await this.createBranch({
      name: "main",
      description: "Main branch",
      presentationId: id,
      isDefault: true
    });
    
    return newPresentation;
  }
  
  async updatePresentation(id: number, presentation: Partial<Presentation>): Promise<Presentation | undefined> {
    const existingPresentation = this.presentations.get(id);
    if (!existingPresentation) return undefined;
    
    const updatedPresentation = {
      ...existingPresentation,
      ...presentation,
      updatedAt: new Date()
    };
    this.presentations.set(id, updatedPresentation);
    return updatedPresentation;
  }
  
  async deletePresentation(id: number): Promise<boolean> {
    return this.presentations.delete(id);
  }
  
  // Branch operations
  async getBranches(presentationId: number): Promise<Branch[]> {
    return Array.from(this.branches.values()).filter(
      (branch) => branch.presentationId === presentationId,
    );
  }
  
  async getBranch(id: number): Promise<Branch | undefined> {
    return this.branches.get(id);
  }
  
  async getDefaultBranch(presentationId: number): Promise<Branch | undefined> {
    return Array.from(this.branches.values()).find(
      (branch) => branch.presentationId === presentationId && branch.isDefault,
    );
  }
  
  async createBranch(branch: InsertBranch): Promise<Branch> {
    const id = this.branchId++;
    const now = new Date();
    const newBranch: Branch = { 
      ...branch, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.branches.set(id, newBranch);
    
    // If this is the default branch, make sure other branches are not default
    if (newBranch.isDefault) {
      for (const [branchId, existingBranch] of this.branches.entries()) {
        if (existingBranch.presentationId === newBranch.presentationId && 
            existingBranch.id !== newBranch.id && 
            existingBranch.isDefault) {
          existingBranch.isDefault = false;
          this.branches.set(branchId, existingBranch);
        }
      }
    }
    
    return newBranch;
  }
  
  async updateBranch(id: number, branch: Partial<Branch>): Promise<Branch | undefined> {
    const existingBranch = this.branches.get(id);
    if (!existingBranch) return undefined;
    
    const updatedBranch = {
      ...existingBranch,
      ...branch,
      updatedAt: new Date()
    };
    this.branches.set(id, updatedBranch);
    
    // If this branch is being set as default, make sure other branches are not default
    if (branch.isDefault) {
      for (const [branchId, otherBranch] of this.branches.entries()) {
        if (otherBranch.presentationId === existingBranch.presentationId && 
            otherBranch.id !== id && 
            otherBranch.isDefault) {
          otherBranch.isDefault = false;
          this.branches.set(branchId, otherBranch);
        }
      }
    }
    
    return updatedBranch;
  }
  
  async deleteBranch(id: number): Promise<boolean> {
    return this.branches.delete(id);
  }
  
  // Commit operations
  async getCommits(branchId: number): Promise<Commit[]> {
    return Array.from(this.commits.values())
      .filter(commit => commit.branchId === branchId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getCommit(id: number): Promise<Commit | undefined> {
    return this.commits.get(id);
  }
  
  async createCommit(commit: InsertCommit): Promise<Commit> {
    const id = this.commitId++;
    const newCommit: Commit = { 
      ...commit, 
      id, 
      createdAt: new Date()
    };
    this.commits.set(id, newCommit);
    return newCommit;
  }
  
  // Slide operations
  async getSlides(commitId: number): Promise<Slide[]> {
    return Array.from(this.slides.values())
      .filter(slide => slide.commitId === commitId)
      .sort((a, b) => a.slideNumber - b.slideNumber);
  }
  
  async getSlide(id: number): Promise<Slide | undefined> {
    return this.slides.get(id);
  }
  
  async createSlide(slide: InsertSlide): Promise<Slide> {
    const id = this.slideId++;
    const newSlide: Slide = { ...slide, id };
    this.slides.set(id, newSlide);
    return newSlide;
  }
  
  async updateSlide(id: number, slide: Partial<Slide>): Promise<Slide | undefined> {
    const existingSlide = this.slides.get(id);
    if (!existingSlide) return undefined;
    
    const updatedSlide = {
      ...existingSlide,
      ...slide
    };
    this.slides.set(id, updatedSlide);
    return updatedSlide;
  }
  
  // Diff operations
  async getDiffs(commitId: number): Promise<Diff[]> {
    return Array.from(this.diffs.values()).filter(
      diff => diff.commitId === commitId
    );
  }
  
  async getDiff(id: number): Promise<Diff | undefined> {
    return this.diffs.get(id);
  }
  
  async createDiff(diff: InsertDiff): Promise<Diff> {
    const id = this.diffId++;
    const newDiff: Diff = { ...diff, id };
    this.diffs.set(id, newDiff);
    return newDiff;
  }
}

// Use database storage instead of memory storage 
import { DatabaseStorage } from './storage-db';
export const storage = new DatabaseStorage();
