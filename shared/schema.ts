import { pgTable, text, serial, integer, boolean, jsonb, timestamp, varchar, primaryKey, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage for authentication
export const sessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
}, (table) => {
  return {
    expireIdx: index("IDX_session_expire").on(table.expire),
  };
});

// ロールの定義（学生、企業担当者、管理者など）
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertRoleSchema = createInsertSchema(roles).pick({
  name: true,
  description: true,
});

export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Role = typeof roles.$inferSelect;

// パーミッションの定義（閲覧、編集、コメント、管理など）
export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: text("description"),
  resource: varchar("resource", { length: 50 }).notNull(), // リソース（presentations, slides, comments など）
  action: varchar("action", { length: 50 }).notNull(), // アクション（view, edit, delete など）
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPermissionSchema = createInsertSchema(permissions).pick({
  name: true,
  description: true,
  resource: true,
  action: true,
});

export type InsertPermission = z.infer<typeof insertPermissionSchema>;
export type Permission = typeof permissions.$inferSelect;

// ロールとパーミッションの関連付け
export const rolePermissions = pgTable("role_permissions", {
  roleId: integer("role_id").notNull().references(() => roles.id, { onDelete: 'cascade' }),
  permissionId: integer("permission_id").notNull().references(() => permissions.id, { onDelete: 'cascade' }),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
  };
});

export const insertRolePermissionSchema = createInsertSchema(rolePermissions);
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;
export type RolePermission = typeof rolePermissions.$inferSelect;

// User schemas 拡張
export const users = pgTable("users", {
  // Use a text-based id for Replit Auth users (sub claim is a string)
  id: varchar("id", { length: 255 }).primaryKey().notNull(),
  username: text("username").notNull().unique(),
  password: text("password").default(''),
  email: varchar("email", { length: 255 }).unique(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  organization: varchar("organization", { length: 255 }),
  profileImageUrl: text("profile_image_url"),
  isActive: boolean("is_active").default(true).notNull(),
  roleId: integer("role_id").references(() => roles.id),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  id: true,
  username: true,
  password: true,
  email: true,
  firstName: true,
  lastName: true,
  organization: true,
  profileImageUrl: true,
  roleId: true,
  isActive: true,
  lastLogin: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Define relations after all tables are defined

// Roleとユーザーの関係
export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
  rolePermissions: many(rolePermissions),
}));

// Permissionの関係
export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

// Role-Permission 関連の関係
export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}));

// ユーザーの関係
export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  presentations: many(presentations),
  accessGranted: many(presentationAccess, { relationName: "accessGranted" }),
  accessCreated: many(presentationAccess, { relationName: "accessCreated" }),
}));

// Presentation schemas
export const presentations = pgTable("presentations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id),
  isPublic: boolean("is_public").default(false).notNull(),
  status: varchar("status", { length: 20 }).default("draft").notNull(), // draft, active, archived
  thumbnail: text("thumbnail"),  // URLまたはBase64エンコードされたサムネイル
});

export const insertPresentationSchema = createInsertSchema(presentations).pick({
  name: true,
  description: true,
  userId: true,
  isPublic: true,
  status: true,
  thumbnail: true,
});

export type InsertPresentation = z.infer<typeof insertPresentationSchema>;
export type Presentation = typeof presentations.$inferSelect;

// プレゼンテーションに対するユーザーアクセス権
export const presentationAccess = pgTable("presentation_access", {
  id: serial("id").primaryKey(),
  presentationId: integer("presentation_id").notNull().references(() => presentations.id, { onDelete: 'cascade' }),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  accessLevel: varchar("access_level", { length: 20 }).notNull(), // view, comment, edit, admin
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: varchar("created_by", { length: 255 }).references(() => users.id),
  expiresAt: timestamp("expires_at"), // アクセス権の有効期限（オプション）
});

export const insertPresentationAccessSchema = createInsertSchema(presentationAccess).pick({
  presentationId: true,
  userId: true,
  accessLevel: true,
  createdBy: true,
  expiresAt: true,
});

export type InsertPresentationAccess = z.infer<typeof insertPresentationAccessSchema>;
export type PresentationAccess = typeof presentationAccess.$inferSelect;

// Branch schemas
export const branches = pgTable("branches", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  presentationId: integer("presentation_id").references(() => presentations.id, { onDelete: 'cascade' }).notNull(),
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
  branchId: integer("branch_id").references(() => branches.id, { onDelete: 'cascade' }).notNull(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id),
  parentId: integer("parent_id").references(() => commits.id, { onDelete: 'set null' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}) as any;

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
  commitId: integer("commit_id").references(() => commits.id, { onDelete: 'cascade' }).notNull(),
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
  commitId: integer("commit_id").references(() => commits.id, { onDelete: 'cascade' }).notNull(),
  slideId: integer("slide_id").references(() => slides.id, { onDelete: 'cascade' }).notNull(),
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

// テーブル間のリレーション定義（修正版）

export const presentationsRelations = relations(presentations, ({ one, many }) => ({
  user: one(users, { fields: [presentations.userId], references: [users.id] }),
  branches: many(branches),
  accessControls: many(presentationAccess),
}));

// プレゼンテーションアクセスの関係
export const presentationAccessRelations = relations(presentationAccess, ({ one }) => ({
  presentation: one(presentations, {
    fields: [presentationAccess.presentationId],
    references: [presentations.id],
  }),
  user: one(users, {
    fields: [presentationAccess.userId],
    references: [users.id],
    relationName: "accessGranted",
  }),
  createdByUser: one(users, {
    fields: [presentationAccess.createdBy],
    references: [users.id],
    relationName: "accessCreated",
  }),
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

// スナップショット機能は削除されました

// コメント機能のスキーマ
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  slideId: integer("slide_id").notNull().references(() => slides.id, { onDelete: 'cascade' }),
  userId: varchar("user_id", { length: 255 }).references(() => users.id),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  resolved: boolean("resolved").default(false),
  parentId: integer("parent_id").references(() => comments.id, { onDelete: 'set null' }),
}) as any;

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

// プロジェクト管理テーブル（学生向けタスク管理）
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  companyName: text("company_name").notNull(),
  presentationId: integer("presentation_id").references(() => presentations.id, { onDelete: 'cascade' }).notNull(),
  dueDate: timestamp("due_date"),
  status: varchar("status", { length: 20 }).default("active").notNull(), // active, completed, archived
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: varchar("created_by", { length: 255 }).references(() => users.id),
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  description: true,
  companyName: true,
  presentationId: true,
  dueDate: true,
  status: true,
  createdBy: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// 学生のプロジェクトアサイン
export const studentProjects = pgTable("student_projects", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: 'cascade' }),
  studentId: varchar("student_id", { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  status: varchar("status", { length: 20 }).default("assigned").notNull(), // assigned, in_progress, completed
  commentCount: integer("comment_count").default(0),
});

export const insertStudentProjectSchema = createInsertSchema(studentProjects).pick({
  projectId: true,
  studentId: true,
  status: true,
});

export type InsertStudentProject = z.infer<typeof insertStudentProjectSchema>;
export type StudentProject = typeof studentProjects.$inferSelect;

// 学生プロフィール（ランク・進捗管理）
export const studentProfiles = pgTable("student_profiles", {
  userId: varchar("user_id", { length: 255 }).primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  rank: varchar("rank", { length: 20 }).default("bronze").notNull(), // bronze, silver, gold
  totalComments: integer("total_comments").default(0),
  approvedComments: integer("approved_comments").default(0),
  approvalRate: integer("approval_rate").default(0), // パーセンテージ
  bonusProgress: integer("bonus_progress").default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertStudentProfileSchema = createInsertSchema(studentProfiles).pick({
  userId: true,
  rank: true,
  totalComments: true,
  approvedComments: true,
  approvalRate: true,
  bonusProgress: true,
});

export type InsertStudentProfile = z.infer<typeof insertStudentProfileSchema>;
export type StudentProfile = typeof studentProfiles.$inferSelect;

// サブスクリプション管理
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  planType: varchar("plan_type", { length: 20 }).notNull(), // light, standard, premium
  reviewQuotaUsed: integer("review_quota_used").default(0),
  reviewQuotaLimit: integer("review_quota_limit").notNull(),
  nextBillingDate: timestamp("next_billing_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).pick({
  userId: true,
  planType: true,
  reviewQuotaUsed: true,
  reviewQuotaLimit: true,
  nextBillingDate: true,
  isActive: true,
});

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

// コメント拡張（匿名ID、座標、ステータス管理）
export const commentExtensions = pgTable("comment_extensions", {
  commentId: integer("comment_id").primaryKey().references(() => comments.id, { onDelete: 'cascade' }),
  anonymousId: varchar("anonymous_id", { length: 50 }), // Student#001 形式
  x: integer("x"), // スライド上の座標
  y: integer("y"), // スライド上の座標
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, in_progress, completed
  approvedBy: varchar("approved_by", { length: 255 }).references(() => users.id),
  approvedAt: timestamp("approved_at"),
});

export const insertCommentExtensionSchema = createInsertSchema(commentExtensions).pick({
  commentId: true,
  anonymousId: true,
  x: true,
  y: true,
  status: true,
  approvedBy: true,
  approvedAt: true,
});

export type InsertCommentExtension = z.infer<typeof insertCommentExtensionSchema>;
export type CommentExtension = typeof commentExtensions.$inferSelect;

// プロジェクトリレーション
export const projectsRelations = relations(projects, ({ one, many }) => ({
  presentation: one(presentations, {
    fields: [projects.presentationId],
    references: [presentations.id],
  }),
  createdByUser: one(users, {
    fields: [projects.createdBy],
    references: [users.id],
  }),
  studentAssignments: many(studentProjects),
}));

// 学生プロジェクトリレーション
export const studentProjectsRelations = relations(studentProjects, ({ one }) => ({
  project: one(projects, {
    fields: [studentProjects.projectId],
    references: [projects.id],
  }),
  student: one(users, {
    fields: [studentProjects.studentId],
    references: [users.id],
  }),
}));

// 学生プロファイルリレーション
export const studentProfilesRelations = relations(studentProfiles, ({ one }) => ({
  user: one(users, {
    fields: [studentProfiles.userId],
    references: [users.id],
  }),
}));

// サブスクリプションリレーション
export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

// コメント拡張リレーション
export const commentExtensionsRelations = relations(commentExtensions, ({ one }) => ({
  comment: one(comments, {
    fields: [commentExtensions.commentId],
    references: [comments.id],
  }),
  approvedByUser: one(users, {
    fields: [commentExtensions.approvedBy],
    references: [users.id],
  }),
}));
