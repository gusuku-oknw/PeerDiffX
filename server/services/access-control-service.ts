import { db } from "../db";
import { 
  presentationAccess, 
  presentations, 
  users, 
  roles, 
  insertPresentationAccessSchema 
} from "@shared/schema";
import { eq, and, gte, lt } from "drizzle-orm";
import { InsertPresentationAccess } from "@shared/schema";

/**
 * アクセス権限を共有する
 */
export async function sharePresentation(
  presId: number, 
  targetUserId: number, 
  accessLevel: string,
  createdById: number,
  expiresAt?: Date
): Promise<boolean> {
  try {
    // 有効なプレゼンテーションか確認
    const presentation = await db.query.presentations.findFirst({
      where: eq(presentations.id, presId)
    });

    if (!presentation) {
      throw new Error("プレゼンテーションが見つかりません");
    }

    // 対象ユーザーが存在するか確認
    const targetUser = await db.query.users.findFirst({
      where: eq(users.id, targetUserId)
    });

    if (!targetUser) {
      throw new Error("ユーザーが見つかりません");
    }
    
    // 既存の共有があれば更新、なければ作成
    const existingAccess = await db.query.presentationAccess.findFirst({
      where: and(
        eq(presentationAccess.presentationId, presId),
        eq(presentationAccess.userId, targetUserId)
      )
    });

    if (existingAccess) {
      await db
        .update(presentationAccess)
        .set({
          accessLevel,
          updatedAt: new Date(),
          expiresAt: expiresAt || null,
          createdBy: createdById
        })
        .where(eq(presentationAccess.id, existingAccess.id));
    } else {
      const newAccess: InsertPresentationAccess = {
        presentationId: presId,
        userId: targetUserId,
        accessLevel,
        createdBy: createdById,
        expiresAt: expiresAt
      };

      await db.insert(presentationAccess).values(newAccess);
    }

    return true;
  } catch (error) {
    console.error("アクセス権共有エラー:", error);
    throw error;
  }
}

/**
 * アクセス権限を削除する
 */
export async function removeAccess(presId: number, userId: number): Promise<boolean> {
  try {
    const result = await db
      .delete(presentationAccess)
      .where(
        and(
          eq(presentationAccess.presentationId, presId),
          eq(presentationAccess.userId, userId)
        )
      );
    
    return true;
  } catch (error) {
    console.error("アクセス権削除エラー:", error);
    throw error;
  }
}

/**
 * プレゼンテーションのすべての共有アクセス権を取得
 */
export async function getSharedUsers(presId: number) {
  try {
    const accesses = await db
      .select({
        access: presentationAccess,
        user: {
          id: users.id,
          username: users.username,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          organization: users.organization
        }
      })
      .from(presentationAccess)
      .innerJoin(users, eq(presentationAccess.userId, users.id))
      .where(eq(presentationAccess.presentationId, presId));
    
    return accesses;
  } catch (error) {
    console.error("共有ユーザー取得エラー:", error);
    throw error;
  }
}

/**
 * 期限切れのアクセス権限をクリーンアップ
 */
export async function cleanupExpiredAccess(): Promise<number> {
  try {
    const now = new Date();
    const result = await db
      .delete(presentationAccess)
      .where(
        and(
          lt(presentationAccess.expiresAt, now),
          gte(presentationAccess.expiresAt, new Date(0)) // null以外
        )
      );
    
    return 1; // 削除した数を返す (drizzleではまだcountが利用できない場合のためのダミー値)
  } catch (error) {
    console.error("期限切れアクセスクリーンアップエラー:", error);
    throw error;
  }
}

/**
 * ユーザーの持つアクセス権限のあるプレゼンテーション一覧を取得
 */
export async function getUserAccessiblePresentations(userId: number) {
  try {
    // ユーザーがアクセス権を持つプレゼンテーション
    const sharedPresentations = await db
      .select({
        presentation: presentations,
        accessLevel: presentationAccess.accessLevel,
        expiresAt: presentationAccess.expiresAt
      })
      .from(presentationAccess)
      .innerJoin(presentations, eq(presentationAccess.presentationId, presentations.id))
      .where(eq(presentationAccess.userId, userId));
    
    // ユーザー自身が所有するプレゼンテーション
    const ownedPresentations = await db
      .select()
      .from(presentations)
      .where(eq(presentations.userId, userId));
    
    // 公開プレゼンテーション
    const publicPresentations = await db
      .select()
      .from(presentations)
      .where(
        and(
          eq(presentations.isPublic, true),
          lt(presentations.userId, userId) // 自分のプレゼンテーションは除外（既にownedPresentationsに含まれる）
        )
      );
    
    return {
      shared: sharedPresentations,
      owned: ownedPresentations,
      public: publicPresentations
    };
  } catch (error) {
    console.error("アクセス可能プレゼンテーション取得エラー:", error);
    throw error;
  }
}