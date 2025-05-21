import { db, pool } from './db';
import { 
  roles, insertRoleSchema,
  permissions, insertPermissionSchema,
  rolePermissions,
  users, insertUserSchema,
  presentations, insertPresentationSchema,
  branches, insertBranchSchema,
  commits, insertCommitSchema,
  slides, insertSlideSchema,
  diffs, insertDiffSchema
} from '../shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Initialize the database with some sample data
 */
export async function initializeDatabase() {
  console.log('Initializing database with sample data...');
  
  try {
    // Insert roles
    console.log('Creating roles...');
    
    const adminRole = {
      name: 'admin',
      description: 'Administrator with full system access'
    };
    
    const userRole = {
      name: 'user',
      description: 'Regular user with limited access'
    };
    
    const reviewerRole = {
      name: 'reviewer',
      description: 'Can view and comment on presentations'
    };
    
    // Insert roles
    await db.insert(roles).values(adminRole).onConflictDoNothing();
    await db.insert(roles).values(userRole).onConflictDoNothing();
    await db.insert(roles).values(reviewerRole).onConflictDoNothing();
    
    // Get inserted roles
    const insertedRoles = await db.select().from(roles);
    const adminRoleId = insertedRoles.find(r => r.name === 'admin')?.id;
    const userRoleId = insertedRoles.find(r => r.name === 'user')?.id;
    const reviewerRoleId = insertedRoles.find(r => r.name === 'reviewer')?.id;
    
    if (!adminRoleId || !userRoleId || !reviewerRoleId) {
      throw new Error('Failed to get role IDs');
    }
    
    // Insert permissions
    console.log('Creating permissions...');
    
    const viewPresentationPermission = {
      name: 'view_presentation',
      description: 'Can view presentations',
      resource: 'presentation',
      action: 'view'
    };
    
    const editPresentationPermission = {
      name: 'edit_presentation', 
      description: 'Can edit presentations',
      resource: 'presentation',
      action: 'edit'
    };
    
    const createPresentationPermission = {
      name: 'create_presentation',
      description: 'Can create new presentations',
      resource: 'presentation',
      action: 'create'
    };
    
    const deletePresentationPermission = {
      name: 'delete_presentation',
      description: 'Can delete presentations',
      resource: 'presentation',
      action: 'delete'
    };
    
    const commentPermission = {
      name: 'comment',
      description: 'Can add comments to slides',
      resource: 'slide',
      action: 'comment'
    };
    
    const manageUsersPermission = {
      name: 'manage_users',
      description: 'Can manage users in the system',
      resource: 'user',
      action: 'manage'
    };
    
    // Insert permissions
    await db.insert(permissions).values(viewPresentationPermission).onConflictDoNothing();
    await db.insert(permissions).values(editPresentationPermission).onConflictDoNothing();
    await db.insert(permissions).values(createPresentationPermission).onConflictDoNothing();
    await db.insert(permissions).values(deletePresentationPermission).onConflictDoNothing();
    await db.insert(permissions).values(commentPermission).onConflictDoNothing();
    await db.insert(permissions).values(manageUsersPermission).onConflictDoNothing();
    
    // Get inserted permissions
    const insertedPermissions = await db.select().from(permissions);
    
    // Assign permissions to roles
    console.log('Assigning permissions to roles...');
    
    // Admin role has all permissions
    for (const permission of insertedPermissions) {
      await db.insert(rolePermissions).values({
        roleId: adminRoleId,
        permissionId: permission.id
      }).onConflictDoNothing();
    }
    
    // User role has basic permissions
    const userPermissions = insertedPermissions.filter(p => 
      ['view_presentation', 'create_presentation', 'edit_presentation', 'comment'].includes(p.name)
    );
    
    for (const permission of userPermissions) {
      await db.insert(rolePermissions).values({
        roleId: userRoleId,
        permissionId: permission.id
      }).onConflictDoNothing();
    }
    
    // Reviewer role has view and comment permissions
    const reviewerPermissions = insertedPermissions.filter(p => 
      ['view_presentation', 'comment'].includes(p.name)
    );
    
    for (const permission of reviewerPermissions) {
      await db.insert(rolePermissions).values({
        roleId: reviewerRoleId,
        permissionId: permission.id
      }).onConflictDoNothing();
    }
    
    // Create demo users
    console.log('Creating demo users...');
    
    const demoAdminUser = {
      username: 'admin',
      password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // secret
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      organization: 'PeerDiffX',
      roleId: adminRoleId,
      isActive: true
    };
    
    const demoUser = {
      username: 'user',
      password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // secret
      email: 'user@example.com',
      firstName: 'Demo',
      lastName: 'User',
      organization: 'Example Corp',
      roleId: userRoleId,
      isActive: true
    };
    
    // Insert demo users
    await db.insert(users).values(demoAdminUser).onConflictDoNothing();
    await db.insert(users).values(demoUser).onConflictDoNothing();
    
    // Get inserted users
    const insertedUsers = await db.select().from(users);
    const adminUserId = insertedUsers.find(u => u.username === 'admin')?.id;
    const regularUserId = insertedUsers.find(u => u.username === 'user')?.id;
    
    if (!adminUserId || !regularUserId) {
      throw new Error('Failed to get user IDs');
    }
    
    // Create demo presentation
    console.log('Creating demo presentation...');
    
    const demoPresentation = {
      name: 'Sample Presentation',
      description: 'A demonstration of PeerDiffX features',
      userId: regularUserId,
      isPublic: true,
      status: 'published',
      thumbnail: null
    };
    
    // Insert demo presentation
    const [presentationResult] = await db.insert(presentations).values(demoPresentation).returning();
    
    if (!presentationResult) {
      throw new Error('Failed to insert presentation');
    }
    
    const presentationId = presentationResult.id;
    
    // Create branches
    console.log('Creating branches...');
    
    const mainBranch = {
      name: 'main',
      description: 'Main branch of the presentation',
      presentationId: presentationId,
      isDefault: true
    };
    
    const featureBranch = {
      name: 'feature/new-slides',
      description: 'Adding new content slides',
      presentationId: presentationId,
      isDefault: false
    };
    
    const designBranch = {
      name: 'design/new-theme',
      description: 'Updated design theme',
      presentationId: presentationId,
      isDefault: false
    };
    
    // Insert branches
    const [mainBranchResult] = await db.insert(branches).values(mainBranch).returning();
    const [featureBranchResult] = await db.insert(branches).values(featureBranch).returning();
    const [designBranchResult] = await db.insert(branches).values(designBranch).returning();
    
    if (!mainBranchResult || !featureBranchResult || !designBranchResult) {
      throw new Error('Failed to insert branches');
    }
    
    const mainBranchId = mainBranchResult.id;
    const featureBranchId = featureBranchResult.id;
    const designBranchId = designBranchResult.id;
    
    // Create commits
    console.log('Creating commits...');
    
    const initialCommit = {
      message: 'Initial presentation',
      branchId: mainBranchId,
      userId: regularUserId,
      parentId: null
    };
    
    // Insert initial commit
    const [initialCommitResult] = await db.insert(commits).values(initialCommit).returning();
    
    if (!initialCommitResult) {
      throw new Error('Failed to insert initial commit');
    }
    
    const initialCommitId = initialCommitResult.id;
    
    // Create more commits
    const designMergeCommit = {
      message: 'Merged design updates',
      branchId: mainBranchId,
      userId: regularUserId,
      parentId: initialCommitId
    };
    
    const [designCommitResult] = await db.insert(commits).values(designMergeCommit).returning();
    
    if (!designCommitResult) {
      throw new Error('Failed to insert design commit');
    }
    
    const designCommitId = designCommitResult.id;
    
    const latestCommit = {
      message: 'Added content updates',
      branchId: mainBranchId,
      userId: regularUserId,
      parentId: designCommitId
    };
    
    const [latestCommitResult] = await db.insert(commits).values(latestCommit).returning();
    
    if (!latestCommitResult) {
      throw new Error('Failed to insert latest commit');
    }
    
    const latestCommitId = latestCommitResult.id;
    
    // Create slides
    console.log('Creating slides...');
    
    const titleSlide = {
      commitId: latestCommitId,
      slideNumber: 1,
      title: 'Welcome to PeerDiffX',
      content: JSON.stringify({
        elements: [
          {
            id: 'title1',
            type: 'text',
            x: 50,
            y: 50,
            width: 500,
            height: 100,
            content: 'Welcome to PeerDiffX',
            style: { fontSize: 44, fontWeight: 'bold', textAlign: 'center' }
          },
          {
            id: 'subtitle1',
            type: 'text',
            x: 50,
            y: 160,
            width: 500,
            height: 50,
            content: 'Version Control for Presentations',
            style: { fontSize: 24, textAlign: 'center' }
          }
        ],
        background: '#ffffff'
      }),
      thumbnail: null,
      xmlContent: '<p:sld><p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>Welcome to PeerDiffX</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:sld>'
    };
    
    const contentSlide = {
      commitId: latestCommitId,
      slideNumber: 2,
      title: 'Key Features',
      content: JSON.stringify({
        elements: [
          {
            id: 'title2',
            type: 'text',
            x: 50,
            y: 50,
            width: 500,
            height: 50,
            content: 'Key Features',
            style: { fontSize: 36, fontWeight: 'bold' }
          },
          {
            id: 'bullet1',
            type: 'text',
            x: 70,
            y: 120,
            width: 500,
            height: 30,
            content: 'Version Control for PowerPoint',
            style: { fontSize: 24 }
          },
          {
            id: 'bullet2',
            type: 'text',
            x: 70,
            y: 160,
            width: 500,
            height: 30,
            content: 'Visual Diff Tool',
            style: { fontSize: 24 }
          },
          {
            id: 'bullet3',
            type: 'text',
            x: 70,
            y: 200,
            width: 500,
            height: 30,
            content: 'Collaboration & Review',
            style: { fontSize: 24 }
          }
        ],
        background: '#ffffff'
      }),
      thumbnail: null,
      xmlContent: '<p:sld><p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>Key Features</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:sld>'
    };
    
    const chartSlide = {
      commitId: latestCommitId,
      slideNumber: 3,
      title: 'Performance',
      content: JSON.stringify({
        elements: [
          {
            id: 'title3',
            type: 'text',
            x: 50,
            y: 50,
            width: 500,
            height: 50,
            content: 'Performance Metrics',
            style: { fontSize: 36, fontWeight: 'bold' }
          },
          {
            id: 'chart1',
            type: 'chart',
            x: 100,
            y: 120,
            width: 400,
            height: 300,
            content: 'chart-data-placeholder',
            style: { chartType: 'bar' }
          }
        ],
        background: '#ffffff'
      }),
      thumbnail: null,
      xmlContent: '<p:sld><p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>Performance Metrics</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:sld>'
    };
    
    const imageSlide = {
      commitId: latestCommitId,
      slideNumber: 4,
      title: 'Team',
      content: JSON.stringify({
        elements: [
          {
            id: 'title4',
            type: 'text',
            x: 50,
            y: 50,
            width: 500,
            height: 50,
            content: 'Our Team',
            style: { fontSize: 36, fontWeight: 'bold' }
          },
          {
            id: 'image1',
            type: 'image',
            x: 150,
            y: 120,
            width: 300,
            height: 200,
            content: 'team-image-placeholder',
            style: {}
          }
        ],
        background: '#ffffff'
      }),
      thumbnail: null,
      xmlContent: '<p:sld><p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>Our Team</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:sld>'
    };
    
    // Insert slides
    await db.insert(slides).values(titleSlide);
    await db.insert(slides).values(contentSlide);
    await db.insert(slides).values(chartSlide);
    await db.insert(slides).values(imageSlide);
    
    // Create a diff example
    console.log('Creating example diff...');
    
    const [contentSlideResult] = await db
      .select()
      .from(slides)
      .where(eq(slides.commitId, latestCommitId))
      .where(eq(slides.slideNumber, 2));
    
    if (!contentSlideResult) {
      throw new Error('Failed to find content slide');
    }
    
    const contentSlideDiff = {
      commitId: latestCommitId,
      slideId: contentSlideResult.id,
      diffContent: JSON.stringify({
        added: [
          {
            id: 'bullet4',
            type: 'text',
            x: 70,
            y: 240,
            width: 500,
            height: 30,
            content: 'AI-Powered Analysis',
            style: { fontSize: 24 }
          }
        ],
        deleted: [],
        modified: [
          {
            before: {
              id: 'title2',
              type: 'text',
              x: 50,
              y: 50,
              width: 500,
              height: 50,
              content: 'Features',
              style: { fontSize: 36, fontWeight: 'bold' }
            },
            after: {
              id: 'title2',
              type: 'text',
              x: 50,
              y: 50,
              width: 500,
              height: 50,
              content: 'Key Features',
              style: { fontSize: 36, fontWeight: 'bold' }
            }
          }
        ]
      }),
      xmlDiff: '<diff><added path="/p:sld/p:cSld/p:spTree[1]/p:sp[4]"><p:sp><p:txBody><a:p><a:r><a:t>AI-Powered Analysis</a:t></a:r></a:p></p:txBody></p:sp></added><modified path="/p:sld/p:cSld/p:spTree[1]/p:sp[1]/p:txBody/a:p/a:r/a:t">Features</modified><modified path="/p:sld/p:cSld/p:spTree[1]/p:sp[1]/p:txBody/a:p/a:r/a:t">Key Features</modified></diff>',
      changeType: 'update'
    };
    
    // Insert diff
    await db.insert(diffs).values(contentSlideDiff);
    
    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    // No need to close the connection here as it may be reused by the application
  }
}

// If this file is run directly, execute the initialization
// ESモジュール対応
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// メインモジュールとして実行された場合
if (import.meta.url === `file://${__filename}`) {
  initializeDatabase()
    .then(() => {
      console.log('Database initialization complete.');
      // Don't close the pool when running within the main application
      if (process.env.NODE_ENV !== 'development') {
        pool.end();
      }
    })
    .catch((error) => {
      console.error('Database initialization failed:', error);
      if (process.env.NODE_ENV !== 'development') {
        pool.end();
      }
      process.exit(1);
    });
}