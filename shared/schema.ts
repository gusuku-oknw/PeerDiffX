import { pgTable, text, serial, integer, boolean, jsonb, timestamp, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schemas
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Define relations after all tables are defined

// Presentation schemas
export const presentations = pgTable("presentations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  userId: integer("user_id").references(() => users.id),
});

export const insertPresentationSchema = createInsertSchema(presentations).pick({
  name: true,
  userId: true,
});

export type InsertPresentation = z.infer<typeof insertPresentationSchema>;
export type Presentation = typeof presentations.$inferSelect;

// Branch schemas
export const branches = pgTable("branches", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  presentationId: integer("presentation_id").references(() => presentations.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isDefault: boolean("is_default").default(false),
});

export const insertBranchSchema = createInsertSchema(branches).pick({
  name: true,
  description: true,
  presentationId: true,
  isDefault: true,
});

export type InsertBranch = z.infer<typeof insertBranchSchema>;
export type Branch = typeof branches.$inferSelect;

// Commit schemas
export const commits = pgTable("commits", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  parentId: integer("parent_id").references(() => commits.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCommitSchema = createInsertSchema(commits).pick({
  message: true,
  branchId: true,
  userId: true,
  parentId: true,
});

export type InsertCommit = z.infer<typeof insertCommitSchema>;
export type Commit = typeof commits.$inferSelect;

// Slide schemas
export const slides = pgTable("slides", {
  id: serial("id").primaryKey(),
  commitId: integer("commit_id").references(() => commits.id).notNull(),
  slideNumber: integer("slide_number").notNull(),
  title: text("title"),
  content: jsonb("content").notNull(),
  thumbnail: text("thumbnail"),
  xmlContent: text("xml_content").notNull(),
});

export const insertSlideSchema = createInsertSchema(slides).pick({
  commitId: true,
  slideNumber: true,
  title: true,
  content: true,
  thumbnail: true,
  xmlContent: true,
});

export type InsertSlide = z.infer<typeof insertSlideSchema>;
export type Slide = typeof slides.$inferSelect;

// Diff schemas
export const diffs = pgTable("diffs", {
  id: serial("id").primaryKey(),
  commitId: integer("commit_id").references(() => commits.id).notNull(),
  slideId: integer("slide_id").references(() => slides.id).notNull(),
  diffContent: jsonb("diff_content").notNull(),
  xmlDiff: text("xml_diff"),
  changeType: varchar("change_type", { length: 20 }).notNull(), // 'added', 'modified', 'deleted'
});

export const insertDiffSchema = createInsertSchema(diffs).pick({
  commitId: true,
  slideId: true,
  diffContent: true,
  xmlDiff: true,
  changeType: true,
});

export type InsertDiff = z.infer<typeof insertDiffSchema>;
export type Diff = typeof diffs.$inferSelect;

// Define type for slide content
export type SlideContent = {
  elements: SlideElement[];
  background?: string;
};

export type SlideElement = {
  id: string;
  type: 'text' | 'shape' | 'image' | 'chart';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  style?: Record<string, any>;
  children?: SlideElement[];
};

// Define type for diff content
export type DiffContent = {
  added: SlideElement[];
  deleted: SlideElement[];
  modified: {
    before: SlideElement;
    after: SlideElement;
  }[];
};

// Define all relations after all tables are defined
export const usersRelations = relations(users, ({ many }) => ({
  presentations: many(presentations),
}));

export const presentationsRelations = relations(presentations, ({ one, many }) => ({
  user: one(users, { fields: [presentations.userId], references: [users.id] }),
  branches: many(branches),
}));

export const branchesRelations = relations(branches, ({ one, many }) => ({
  presentation: one(presentations, { fields: [branches.presentationId], references: [presentations.id] }),
  commits: many(commits),
}));

export const commitsRelations = relations(commits, ({ one, many }) => ({
  branch: one(branches, { fields: [commits.branchId], references: [branches.id] }),
  user: one(users, { fields: [commits.userId], references: [users.id] }),
  parentCommit: one(commits, { fields: [commits.parentId], references: [commits.id] }),
  slides: many(slides),
  diffs: many(diffs),
}));

export const slidesRelations = relations(slides, ({ one, many }) => ({
  commit: one(commits, { fields: [slides.commitId], references: [commits.id] }),
  diffs: many(diffs, { relationName: "slideDiffs" }),
}));

export const diffsRelations = relations(diffs, ({ one }) => ({
  commit: one(commits, { fields: [diffs.commitId], references: [commits.id] }),
  slide: one(slides, { fields: [diffs.slideId], references: [slides.id], relationName: "slideDiffs" }),
}));

// スナップショットテーブル
export const snapshots = pgTable("snapshots", {
  id: text("id").primaryKey(), // ランダムなUUID文字列
  presentationId: integer("presentation_id").notNull().references(() => presentations.id),
  commitId: integer("commit_id").notNull().references(() => commits.id),
  slideId: integer("slide_id").references(() => slides.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  accessCount: integer("access_count").default(0).notNull(),
  data: jsonb("data"), // プレゼンテーションデータのスナップショット
});

export const insertSnapshotSchema = createInsertSchema(snapshots).pick({
  id: true,
  presentationId: true,
  commitId: true,
  slideId: true,
  expiresAt: true,
  data: true,
});

export type InsertSnapshot = z.infer<typeof insertSnapshotSchema>;
export type Snapshot = typeof snapshots.$inferSelect;

export const snapshotsRelations = relations(snapshots, ({ one }) => ({
  presentation: one(presentations, { fields: [snapshots.presentationId], references: [presentations.id] }),
  commit: one(commits, { fields: [snapshots.commitId], references: [commits.id] }),
  slide: one(slides, { fields: [snapshots.slideId], references: [slides.id] }),
}));

// コメント機能のスキーマ
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  slideId: integer("slide_id").notNull().references(() => slides.id),
  userId: integer("user_id").references(() => users.id),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  resolved: boolean("resolved").default(false),
  parentId: integer("parent_id").references(() => comments.id),
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  slideId: true,
  userId: true,
  message: true,
  parentId: true,
});

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

export const commentsRelations = relations(comments, ({ one, many }) => ({
  slide: one(slides, {
    fields: [comments.slideId],
    references: [slides.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
  }),
  replies: many(comments),
}));
