import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { presentationAccess, roles, rolePermissions, permissions, users, presentations } from "@shared/schema";
import { eq, and } from "drizzle-orm";

// リクエストにユーザー情報を含めるための型拡張
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
      };
    }
  }
}

/**
 * 認証済みかチェックするミドルウェア
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  // ここでは簡易的な認証チェックを行います
  // 実際のアプリケーションでは、JWTやセッションを使用した認証が望ましいです
  const userId = req.headers["user-id"];
  
  if (!userId) {
    return res.status(401).json({ message: "認証が必要です" });
  }
  
  // ユーザーIDをリクエストに追加
  req.user = { id: Number(userId) };
  next();
};

/**
 * ユーザーのロールをチェックするミドルウェア
 */
export const hasRole = (roleName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.id) {
      return res.status(401).json({ message: "認証が必要です" });
    }

    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, req.user.id),
        with: {
          role: true
        }
      });

      if (!user || !user.role || user.role.name !== roleName) {
        return res.status(403).json({ message: `この操作には${roleName}ロールが必要です` });
      }

      next();
    } catch (error) {
      console.error("ロールチェックエラー:", error);
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  };
};

/**
 * リソースへのアクセス権をチェックするミドルウェア
 */
export const hasPermission = (resource: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.id) {
      return res.status(401).json({ message: "認証が必要です" });
    }

    try {
      // ユーザーのロールを取得
      const user = await db.query.users.findFirst({
        where: eq(users.id, req.user.id),
        columns: {
          id: true,
          roleId: true
        }
      });

      if (!user || !user.roleId) {
        return res.status(403).json({ message: "アクセス権限がありません" });
      }

      // ロールに基づいて権限をチェック
      const permissionCheck = await db
        .select()
        .from(rolePermissions)
        .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(
          and(
            eq(rolePermissions.roleId, user.roleId),
            eq(permissions.resource, resource),
            eq(permissions.action, action)
          )
        );

      if (permissionCheck.length === 0) {
        return res.status(403).json({ message: `${resource}への${action}権限がありません` });
      }

      next();
    } catch (error) {
      console.error("権限チェックエラー:", error);
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  };
};

/**
 * プレゼンテーションへのアクセス権をチェックするミドルウェア
 */
export const canAccessPresentation = (accessLevel: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.id) {
      return res.status(401).json({ message: "認証が必要です" });
    }

    const presentationId = parseInt(req.params.presentationId || req.params.id);
    
    if (isNaN(presentationId)) {
      return res.status(400).json({ message: "無効なプレゼンテーションIDです" });
    }

    try {
      // プレゼンテーションの所有者をチェック
      const presentation = await db.query.presentations.findFirst({
        where: eq(presentations.id, presentationId),
        columns: {
          userId: true,
          isPublic: true
        }
      });

      // プレゼンテーションが存在しない場合
      if (!presentation) {
        return res.status(404).json({ message: "プレゼンテーションが見つかりません" });
      }

      // 所有者の場合は常にアクセス許可
      if (presentation.userId === req.user.id) {
        return next();
      }

      // 公開プレゼンテーションで閲覧のみの場合はアクセス許可
      if (presentation.isPublic && accessLevel === 'view') {
        return next();
      }

      // それ以外の場合は明示的なアクセス権をチェック
      const access = await db.query.presentationAccess.findFirst({
        where: and(
          eq(presentationAccess.presentationId, presentationId),
          eq(presentationAccess.userId, req.user.id)
        )
      });

      // アクセス権がない場合
      if (!access) {
        return res.status(403).json({ message: "このプレゼンテーションへのアクセス権がありません" });
      }

      // アクセスレベルをチェック
      const accessLevels = ['view', 'comment', 'edit', 'admin'];
      const requiredLevel = accessLevels.indexOf(accessLevel);
      const userLevel = accessLevels.indexOf(access.accessLevel);

      // ユーザーのアクセスレベルが必要なレベルより低い場合
      if (userLevel < requiredLevel) {
        return res.status(403).json({ 
          message: `この操作には${accessLevel}権限が必要です（現在の権限: ${access.accessLevel}）` 
        });
      }

      // アクセス権の有効期限をチェック
      if (access.expiresAt && new Date() > access.expiresAt) {
        return res.status(403).json({ message: "アクセス権の有効期限が切れています" });
      }

      // すべてのチェックをパスした場合
      next();
    } catch (error) {
      console.error("プレゼンテーションアクセスチェックエラー:", error);
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  };
};