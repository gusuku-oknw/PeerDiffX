import { Router, Request, Response } from "express";
import { z } from "zod";
import { 
  sharePresentation, 
  removeAccess, 
  getSharedUsers, 
  getUserAccessiblePresentations 
} from "../services/access-control-service";
import { isAuthenticated, canAccessPresentation } from "../middleware/auth-middleware";

const accessControlRouter = Router();

// プレゼンテーションの共有設定一覧を取得
accessControlRouter.get(
  "/api/presentations/:presentationId/sharing",
  isAuthenticated,
  canAccessPresentation("admin"), // 管理者または所有者のみ
  async (req: Request, res: Response) => {
    try {
      const presentationId = parseInt(req.params.presentationId);
      if (isNaN(presentationId)) {
        return res.status(400).json({ message: "無効なプレゼンテーションIDです" });
      }

      const sharedUsers = await getSharedUsers(presentationId);
      res.json(sharedUsers);
    } catch (error) {
      console.error("共有設定取得エラー:", error);
      res.status(500).json({ message: "共有設定の取得中にエラーが発生しました" });
    }
  }
);

// プレゼンテーションを共有
accessControlRouter.post(
  "/api/presentations/:presentationId/share", 
  isAuthenticated,
  canAccessPresentation("admin"), // 管理者または所有者のみ
  async (req: Request, res: Response) => {
    try {
      const shareSchema = z.object({
        userId: z.number(),
        accessLevel: z.enum(["view", "comment", "edit", "admin"]),
        expiresAt: z.string().optional().transform(val => val ? new Date(val) : undefined)
      });

      const result = shareSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "入力データが無効です", 
          errors: result.error.format() 
        });
      }

      const { userId, accessLevel, expiresAt } = result.data;
      const presentationId = parseInt(req.params.presentationId);

      if (isNaN(presentationId)) {
        return res.status(400).json({ message: "無効なプレゼンテーションIDです" });
      }

      const success = await sharePresentation(
        presentationId,
        userId,
        accessLevel,
        req.user!.id,
        expiresAt
      );

      res.json({ success, message: "プレゼンテーションを共有しました" });
    } catch (error: any) {
      console.error("共有エラー:", error);
      res.status(500).json({ message: error.message || "共有中にエラーが発生しました" });
    }
  }
);

// 共有を解除
accessControlRouter.delete(
  "/api/presentations/:presentationId/share/:userId",
  isAuthenticated,
  canAccessPresentation("admin"), // 管理者または所有者のみ
  async (req: Request, res: Response) => {
    try {
      const presentationId = parseInt(req.params.presentationId);
      const userId = parseInt(req.params.userId);

      if (isNaN(presentationId) || isNaN(userId)) {
        return res.status(400).json({ message: "無効なIDです" });
      }

      const success = await removeAccess(presentationId, userId);
      res.json({ success, message: "共有を解除しました" });
    } catch (error) {
      console.error("共有解除エラー:", error);
      res.status(500).json({ message: "共有解除中にエラーが発生しました" });
    }
  }
);

// ユーザーがアクセスできるプレゼンテーション一覧
accessControlRouter.get(
  "/api/user/presentations",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const presentations = await getUserAccessiblePresentations(userId);
      res.json(presentations);
    } catch (error) {
      console.error("アクセス可能プレゼンテーション取得エラー:", error);
      res.status(500).json({ message: "プレゼンテーション一覧の取得中にエラーが発生しました" });
    }
  }
);

export default accessControlRouter;