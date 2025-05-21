import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { pool } from "./db";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    pool,
    tableName: "sessions",
    createTableIfMissing: true
  });
  return session({
    secret: process.env.SESSION_SECRET || "peerdiffx-secret-key",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  try {
    // ユーザーIDはReplitが提供するsub（一意のID）を使用
    const userId = parseInt(claims["sub"]);
    
    // 既存ユーザーを確認
    const existingUser = await storage.getUser(userId);
    
    if (existingUser) {
      // ユーザー情報を更新（今回はシンプルにするため更新は行いません）
      return existingUser;
    } else {
      // 新規ユーザーを作成
      const newUser = await storage.createUser({
        id: userId,
        username: claims["email"] || `user${userId}`,
        password: "", // OAuth認証なのでパスワードは使用しない
        email: claims["email"] || null,
        firstName: claims["first_name"] || null,
        lastName: claims["last_name"] || null,
        organization: null,
        isActive: true,
        roleId: 1, // デフォルトロール
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date()
      });
      return newUser;
    }
  } catch (error) {
    console.error("Error upserting user:", error);
    throw error;
  }
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: Function
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  for (const domain of process.env
    .REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        client: new client.Client(config, {
          client_id: process.env.REPL_ID!,
        }),
        params: {
          scope: "openid email profile offline_access",
        },
        redirect_uri: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.generators.logoutUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });

  // ユーザー情報を取得するエンドポイント
  app.get("/api/auth/user", async (req: any, res) => {
    if (!req.isAuthenticated() || !req.user?.claims) {
      return res.json(null);
    }

    try {
      const userId = parseInt(req.user.claims.sub);
      const user = await storage.getUser(userId);

      if (!user) {
        return res.json(null);
      }

      // パスワードなど機密情報を除外
      const { password, ...safeUser } = user;
      return res.json(safeUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      return res.status(500).json({ message: "Error fetching user information" });
    }
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user?.expires_at) {
    return res.status(401).json({ message: "認証が必要です" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    return res.redirect("/api/login");
  }

  try {
    const config = await getOidcConfig();
    const client_instance = new client.Client(config, {
      client_id: process.env.REPL_ID!,
    });
    
    const tokenSet = await client_instance.refresh(refreshToken);
    updateUserSession(user, tokenSet);
    return next();
  } catch (error) {
    return res.redirect("/api/login");
  }
};