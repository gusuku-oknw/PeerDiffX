import { db } from "./db";
import { 
  users, 
  presentations, 
  branches, 
  commits, 
  slides, 
  diffs,
  roles,
  permissions,
  rolePermissions,
  type InsertUser,
  type InsertPresentation,
  type InsertBranch,
  type InsertCommit,
  type InsertSlide,
  type InsertDiff,
  type InsertRole,
  type InsertPermission,
  type InsertRolePermission
} from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * Initialize the database with some sample data
 */
export async function initializeDatabase() {
  // Check if we already have data
  const usersCount = await db.select().from(users);
  if (usersCount.length > 0) {
    console.log("Database already initialized with sample data");
    return;
  }

  console.log("Initializing database with sample data...");

  // Create roles first
  const adminRole: InsertRole = {
    name: "admin",
    description: "Administrator role with full access"
  };
  const [adminRoleResult] = await db.insert(roles).values(adminRole).returning();

  const userRole: InsertRole = {
    name: "user",
    description: "Standard user role"
  };
  const [userRoleResult] = await db.insert(roles).values(userRole).returning();

  const reviewerRole: InsertRole = {
    name: "reviewer",
    description: "Reviewer with special permissions"
  };
  const [reviewerRoleResult] = await db.insert(roles).values(reviewerRole).returning();

  // Create permissions
  const createPermissions = [
    { name: "create:presentation", description: "Create presentations" },
    { name: "create:branch", description: "Create branches" },
    { name: "create:commit", description: "Create commits" },
    { name: "create:comment", description: "Create comments" }
  ];
  
  const readPermissions = [
    { name: "read:presentation", description: "View presentations" },
    { name: "read:branch", description: "View branches" },
    { name: "read:commit", description: "View commits" },
    { name: "read:diff", description: "View diffs" }
  ];
  
  const updatePermissions = [
    { name: "update:presentation", description: "Update presentations" },
    { name: "update:branch", description: "Update branches" },
    { name: "update:slide", description: "Update slides" }
  ];
  
  const deletePermissions = [
    { name: "delete:presentation", description: "Delete presentations" },
    { name: "delete:branch", description: "Delete branches" },
    { name: "delete:comment", description: "Delete comments" }
  ];
  
  const adminPermissions = [
    { name: "admin:users", description: "Manage users" },
    { name: "admin:roles", description: "Manage roles" },
    { name: "admin:system", description: "Manage system settings" }
  ];

  // Combine all permissions
  const allPermissions = [
    ...createPermissions,
    ...readPermissions,
    ...updatePermissions,
    ...deletePermissions,
    ...adminPermissions
  ];
  
  // Insert all permissions
  const permissionResults = [];
  for (const perm of allPermissions) {
    const [result] = await db.insert(permissions).values(perm).returning();
    permissionResults.push(result);
  }
  
  // Assign permissions to roles
  // Admin gets all permissions
  for (const perm of permissionResults) {
    await db.insert(rolePermissions).values({
      roleId: adminRoleResult.id,
      permissionId: perm.id
    });
  }
  
  // Regular users get basic permissions
  const userPermissionNames = [
    "create:presentation", "create:branch", "create:commit", "create:comment",
    "read:presentation", "read:branch", "read:commit", "read:diff",
    "update:presentation", "update:branch", "update:slide",
    "delete:presentation", "delete:branch", "delete:comment"
  ];
  
  for (const perm of permissionResults) {
    if (userPermissionNames.includes(perm.name)) {
      await db.insert(rolePermissions).values({
        roleId: userRoleResult.id,
        permissionId: perm.id
      });
    }
  }
  
  // Reviewers get read permissions and comments
  const reviewerPermissionNames = [
    "read:presentation", "read:branch", "read:commit", "read:diff",
    "create:comment", "update:comment", "delete:comment"
  ];
  
  for (const perm of permissionResults) {
    if (reviewerPermissionNames.includes(perm.name)) {
      await db.insert(rolePermissions).values({
        roleId: reviewerRoleResult.id,
        permissionId: perm.id
      });
    }
  }

  // Create demo users
  const demoAdminUser: InsertUser = {
    username: "admin",
    password: "admin123", // In a real app, this would be hashed
    email: "admin@example.com",
    firstName: "Admin",
    lastName: "User",
    organization: "PeerDiffX Inc",
    roleId: adminRoleResult.id,
    isActive: true,
    lastLogin: new Date()
  };
  const [adminUser] = await db.insert(users).values(demoAdminUser).returning();

  const demoUser: InsertUser = {
    username: "demo",
    password: "demo123", // In a real app, this would be hashed
    email: "demo@example.com",
    firstName: "Demo",
    lastName: "User",
    organization: "PeerDiffX Inc",
    roleId: userRoleResult.id,
    isActive: true,
    lastLogin: new Date()
  };
  const [user] = await db.insert(users).values(demoUser).returning();

  // Create a demo presentation
  const demoPresentation: InsertPresentation = {
    name: "Q4_Presentation.pptx",
    description: "Corporate quarterly results presentation",
    userId: user.id,
    isPublic: false,
    status: "draft",
    thumbnail: null
  };
  const [presentation] = await db.insert(presentations).values(demoPresentation).returning();

  // Create branches
  const mainBranch: InsertBranch = {
    name: "main",
    description: "Main branch",
    presentationId: presentation.id,
    isDefault: true
  };
  const [mainBranchResult] = await db.insert(branches).values(mainBranch).returning();

  const featureBranch: InsertBranch = {
    name: "feature-charts",
    description: "Adding new charts and statistics",
    presentationId: presentation.id,
    isDefault: false
  };
  const [featureBranchResult] = await db.insert(branches).values(featureBranch).returning();

  const designBranch: InsertBranch = {
    name: "design-update",
    description: "Updating design elements and colors",
    presentationId: presentation.id,
    isDefault: false
  };
  const [designBranchResult] = await db.insert(branches).values(designBranch).returning();

  // Create commits
  const initialCommit: InsertCommit = {
    message: "Initial presentation setup",
    branchId: mainBranchResult.id,
    userId: user.id,
    parentId: null
  };
  const [initialCommitResult] = await db.insert(commits).values(initialCommit).returning();

  const designMergeCommit: InsertCommit = {
    message: "Merge design-update branch",
    branchId: mainBranchResult.id,
    userId: user.id,
    parentId: initialCommitResult.id
  };
  const [designMergeCommitResult] = await db.insert(commits).values(designMergeCommit).returning();

  const latestCommit: InsertCommit = {
    message: "Update slide content",
    branchId: mainBranchResult.id,
    userId: user.id,
    parentId: designMergeCommitResult.id
  };
  const [latestCommitResult] = await db.insert(commits).values(latestCommit).returning();

  // Create slides
  const titleSlide: InsertSlide = {
    commitId: latestCommitResult.id,
    slideNumber: 1,
    title: "Q4 Presentation",
    content: {
      elements: [
        {
          id: "title",
          type: "text",
          x: 50,
          y: 50,
          width: 500,
          height: 100,
          content: "Q4 Presentation",
          style: { fontSize: 36, fontWeight: "bold", textAlign: "center" }
        },
        {
          id: "subtitle",
          type: "text",
          x: 50,
          y: 160,
          width: 500,
          height: 50,
          content: "Company Overview and Results",
          style: { fontSize: 24, textAlign: "center" }
        }
      ]
    },
    thumbnail: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAJCAYAAAA7KqwyAAAAFElEQVR42mNkYPhfz0BLMDIY1AAAPgAAETAJj3IAAAAAElFTkSuQmCC",
    xmlContent: '<slide id="1"><title>Q4 Presentation</title><subtitle>Company Overview and Results</subtitle></slide>'
  };
  const [titleSlideResult] = await db.insert(slides).values(titleSlide).returning();

  const contentSlide: InsertSlide = {
    commitId: latestCommitResult.id,
    slideNumber: 2,
    title: "Project Overview",
    content: {
      elements: [
        {
          id: "title",
          type: "text",
          x: 50,
          y: 50,
          width: 500,
          height: 60,
          content: "Project Overview",
          style: { fontSize: 30, fontWeight: "bold" }
        },
        {
          id: "bullet1",
          type: "text",
          x: 70,
          y: 120,
          width: 480,
          height: 40,
          content: "XML-level diff extraction from PPTX files",
          style: { fontSize: 20 }
        },
        {
          id: "bullet2",
          type: "text",
          x: 70,
          y: 170,
          width: 480,
          height: 40,
          content: "Git-like branch and merge management",
          style: { fontSize: 20 }
        }
      ]
    },
    thumbnail: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAJCAYAAAA7KqwyAAAAFElEQVR42mNkYJjnz0BLMDIY1AAArSkBH04RXqkAAAAASUVORK5CYII=",
    xmlContent: '<slide id="2"><title>Project Overview</title><bullet>XML-level diff extraction from PPTX files</bullet><bullet>Git-like branch and merge management</bullet></slide>'
  };
  const [contentSlideResult] = await db.insert(slides).values(contentSlide).returning();

  const chartSlide: InsertSlide = {
    commitId: latestCommitResult.id,
    slideNumber: 3,
    title: "Implementation Progress",
    content: {
      elements: [
        {
          id: "title",
          type: "text",
          x: 50,
          y: 50,
          width: 500,
          height: 60,
          content: "Implementation Progress",
          style: { fontSize: 30, fontWeight: "bold" }
        },
        {
          id: "chart",
          type: "chart",
          x: 100,
          y: 120,
          width: 400,
          height: 300,
          content: "bar-chart-data"
        }
      ]
    },
    thumbnail: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAJCAYAAAA7KqwyAAAAFElEQVR42mNkYJgXwEBLMDIY1AAAxFcCEYdj4XwAAAAASUVORK5CYII=",
    xmlContent: '<slide id="3"><title>Implementation Progress</title><chart type="bar">Q1,Q2,Q3,Q4</chart></slide>'
  };
  const [chartSlideResult] = await db.insert(slides).values(chartSlide).returning();

  const imageSlide: InsertSlide = {
    commitId: latestCommitResult.id,
    slideNumber: 4,
    title: "Team & Resources",
    content: {
      elements: [
        {
          id: "title",
          type: "text",
          x: 50,
          y: 50,
          width: 500,
          height: 60,
          content: "Team & Resources",
          style: { fontSize: 30, fontWeight: "bold" }
        },
        {
          id: "image",
          type: "image",
          x: 150,
          y: 120,
          width: 300,
          height: 200,
          content: "team-photo"
        },
        {
          id: "caption",
          type: "text",
          x: 50,
          y: 330,
          width: 500,
          height: 40,
          content: "Our dedicated team of engineers and designers",
          style: { fontSize: 18, textAlign: "center" }
        }
      ]
    },
    thumbnail: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAJCAYAAAA7KqwyAAAAFElEQVR42mNkYJhXy0BLMDIY1AAAyYMCASW8YAAAAAAASUVORK5CYII=",
    xmlContent: '<slide id="4"><title>Team & Resources</title><image src="team-photo.jpg" /><caption>Our dedicated team of engineers and designers</caption></slide>'
  };
  const [imageSlideResult] = await db.insert(slides).values(imageSlide).returning();

  // Create a diff
  const contentSlideDiff: InsertDiff = {
    commitId: latestCommitResult.id,
    slideId: contentSlideResult.id,
    changeType: "modified",
    diffContent: {
      added: [
        {
          id: "bullet3",
          type: "text",
          x: 70,
          y: 220,
          width: 480,
          height: 40,
          content: "Browser-based instant preview",
          style: { fontSize: 20 }
        }
      ],
      deleted: [],
      modified: [
        {
          before: {
            id: "title",
            type: "text",
            x: 50,
            y: 50,
            width: 500,
            height: 60,
            content: "Overview",
            style: { fontSize: 28, fontWeight: "bold" }
          },
          after: {
            id: "title",
            type: "text",
            x: 50,
            y: 50,
            width: 500,
            height: 60,
            content: "Project Overview",
            style: { fontSize: 30, fontWeight: "bold" }
          }
        }
      ]
    },
    xmlDiff: `@@ -1,3 +1,4 @@
-<slide id="2"><title>Overview</title><bullet>XML-level diff extraction from PPTX files</bullet><bullet>Git-like branch and merge management</bullet></slide>
+<slide id="2"><title>Project Overview</title><bullet>XML-level diff extraction from PPTX files</bullet><bullet>Git-like branch and merge management</bullet><bullet>Browser-based instant preview</bullet></slide>
`
  };
  await db.insert(diffs).values(contentSlideDiff).returning();

  console.log("Database successfully initialized with sample data!");
}