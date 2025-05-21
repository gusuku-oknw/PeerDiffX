const passport = require('passport');
const { Strategy } = require('openid-client');
const { Issuer } = require('openid-client');
const session = require('express-session');
const connectPg = require('connect-pg-simple');
const { pool } = require('./db');
const { storage } = require('./storage');

async function setupAuth(app) {
  // セッションの設定
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1週間
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    pool,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: 'sessions',
  });
  
  app.use(session({
    secret: process.env.SESSION_SECRET || 'localsessionsecret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  try {
    // Replit OpenID Connect の設定を取得
    const issuer = await Issuer.discover('https://replit.com/~/.well-known/openid-configuration');
    
    // クライアント設定
    const client = new issuer.Client({
      client_id: process.env.REPL_ID || 'local_client_id',
      redirect_uris: [`https://${process.env.REPLIT_DOMAINS.split(',')[0]}/api/callback`],
      response_types: ['code'],
    });

    // Strategy の設定
    const strategy = new Strategy(
      {
        client,
        passReqToCallback: true,
        params: {
          scope: 'openid email profile',
        },
      },
      async (req, tokenSet, userinfo, done) => {
        try {
          const profile = {
            id: userinfo.sub,
            email: userinfo.email,
            name: {
              givenName: userinfo.given_name,
              familyName: userinfo.family_name,
            },
            photos: userinfo.picture ? [{ value: userinfo.picture }] : [],
          };

          // ユーザー情報を永続化
          await storage.upsertUser({
            username: profile.id,
            password: '', // OAuth なのでパスワードは空
            email: profile.email,
            firstName: profile.name?.givenName || null,
            lastName: profile.name?.familyName || null,
            profileImageUrl: profile.photos?.[0]?.value || null,
            roleId: 5, // 一般ユーザー
            isActive: true
          });

          // ユーザー情報とトークンをセッションに保存
          return done(null, {
            id: profile.id,
            profile,
            accessToken: tokenSet.access_token,
            refreshToken: tokenSet.refresh_token,
          });
        } catch (err) {
          return done(err);
        }
      }
    );

    passport.use('oidc', strategy);

    // セッションでのユーザー管理
    passport.serializeUser((user, done) => {
      done(null, user);
    });

    passport.deserializeUser((user, done) => {
      done(null, user);
    });

    // ログインルート
    app.get('/api/login', (req, res, next) => {
      // すでにログインしていれば、ホームにリダイレクト
      if (req.isAuthenticated()) {
        return res.redirect('/');
      }
      passport.authenticate('oidc')(req, res, next);
    });

    // コールバックルート
    app.get('/api/callback', 
      passport.authenticate('oidc', {
        successRedirect: '/',
        failureRedirect: '/login'
      })
    );

    // ログアウトルート
    app.get('/api/logout', (req, res) => {
      req.logout((err) => {
        if (err) {
          console.error('Logout error:', err);
        }
        res.redirect('/');
      });
    });

    // ユーザー情報取得API
    app.get('/api/auth/user', isAuthenticated, async (req, res) => {
      try {
        const userId = req.user.id;
        const user = await storage.getUserByUsername(userId);
        res.json(user);
      } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Failed to fetch user' });
      }
    });

    console.log('Replit Auth setup completed');
    
  } catch (error) {
    console.error('Failed to setup authentication:', error);
    // 開発環境では認証なしでも動作するようにする
    if (process.env.NODE_ENV !== 'production') {
      console.log('Running in development mode without authentication');
      
      // ユーザー情報API (開発用モック)
      app.get('/api/auth/user', (req, res) => {
        res.json({
          id: 'dev-user',
          username: 'dev',
          email: 'dev@example.com',
          firstName: '開発',
          lastName: 'ユーザー',
          profileImageUrl: null,
          roleId: 5,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });
    }
  }
}

// 認証ミドルウェア
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated() || process.env.NODE_ENV !== 'production') {
    return next();
  }
  return res.status(401).json({ message: 'Unauthorized' });
}

module.exports = { setupAuth, isAuthenticated };