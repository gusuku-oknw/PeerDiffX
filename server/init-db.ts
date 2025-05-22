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
    
    // スライド1: タイトルページ
    const titleSlide = {
      commitId: latestCommitId,
      slideNumber: 1,
      title: 'Q4 Presentation',
      content: JSON.stringify({
        elements: [
          {
            type: 'text',
            x: 50,
            y: 150,
            content: 'Q4 Presentation',
            style: { fontSize: 42, fontWeight: 'bold', color: '#000000' }
          },
          {
            type: 'text',
            x: 50,
            y: 220,
            content: 'Company Overview and Results',
            style: { fontSize: 24, color: '#444444' }
          },
          {
            type: 'text',
            x: 50,
            y: 320,
            content: new Date().toLocaleDateString('ja-JP'),
            style: { fontSize: 16, color: '#666666' }
          }
        ]
      }),
      thumbnail: null,
      xmlContent: '<p:sld><p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>Q4 Presentation</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:sld>'
    };

    // スライド2: 売上概要
    const salesSlide = {
      commitId: latestCommitId,
      slideNumber: 2,
      title: '売上概要',
      content: JSON.stringify({
        elements: [
          {
            type: 'text',
            x: 50,
            y: 100,
            content: '売上概要',
            style: { fontSize: 36, fontWeight: 'bold', color: '#000000' }
          },
          {
            type: 'text',
            x: 50,
            y: 180,
            content: '• 2025年第4四半期の売上は前年同期比15%増',
            style: { fontSize: 20, color: '#333333' }
          },
          {
            type: 'text',
            x: 50,
            y: 220,
            content: '• 主力製品の売上が好調に推移',
            style: { fontSize: 20, color: '#333333' }
          },
          {
            type: 'text',
            x: 50,
            y: 260,
            content: '• 新規顧客獲得数が目標を上回る',
            style: { fontSize: 20, color: '#333333' }
          }
        ]
      }),
      thumbnail: null,
      xmlContent: '<p:sld><p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>売上概要</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:sld>'
    };

    // スライド3: 今後の展望
    const futureSlide = {
      commitId: latestCommitId,
      slideNumber: 3,
      title: '今後の展望',
      content: JSON.stringify({
        elements: [
          {
            type: 'text',
            x: 50,
            y: 100,
            content: '今後の展望',
            style: { fontSize: 36, fontWeight: 'bold', color: '#000000' }
          },
          {
            type: 'text',
            x: 50,
            y: 180,
            content: '1. デジタル化の推進',
            style: { fontSize: 24, fontWeight: 'bold', color: '#1976d2' }
          },
          {
            type: 'text',
            x: 70,
            y: 220,
            content: '- AI技術の活用による業務効率化',
            style: { fontSize: 18, color: '#333333' }
          },
          {
            type: 'text',
            x: 70,
            y: 250,
            content: '- クラウドサービスの導入',
            style: { fontSize: 18, color: '#333333' }
          }
        ]
      }),
      thumbnail: null,
      xmlContent: '<p:sld><p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>今後の展望</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:sld>'
    };

    // スライド4: まとめ
    const summarySlide = {
      commitId: latestCommitId,
      slideNumber: 4,
      title: 'まとめ',
      content: JSON.stringify({
        elements: [
          {
            type: 'text',
            x: 50,
            y: 150,
            content: 'まとめ',
            style: { fontSize: 42, fontWeight: 'bold', color: '#000000' }
          },
          {
            type: 'text',
            x: 50,
            y: 240,
            content: 'ご清聴ありがとうございました',
            style: { fontSize: 28, color: '#444444' }
          },
          {
            type: 'text',
            x: 50,
            y: 320,
            content: 'ご質問がございましたら、お気軽にお声かけください',
            style: { fontSize: 18, color: '#666666' }
          }
        ]
      }),
      thumbnail: null,
      xmlContent: '<p:sld><p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>まとめ</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:sld>'
    };
    
    // 4枚のスライドをデータベースに挿入
    await db.insert(slides).values([titleSlide, salesSlide, futureSlide, summarySlide]);
    
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