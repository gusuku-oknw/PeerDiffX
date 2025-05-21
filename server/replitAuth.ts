import passport from 'passport';
import { Strategy } from 'passport-openid-connect';
import session from 'express-session';
import type { Express, RequestHandler } from 'express';
import connectPg from 'connect-pg-simple';
import { pool } from './db';
import { storage } from './storage';

if (!process.env.REPLIT_DOMAINS) {
  throw new Error('Environment variable REPLIT_DOMAINS not provided');
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    pool,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: 'sessions',
  });
  
  return session({
    secret: process.env.SESSION_SECRET || 'localsessionsecret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

async function upsertUser(profile: any) {
  const userData = {
    username: profile.id,
    password: '', // No password for OAuth users
    email: profile.email,
    firstName: profile.name?.givenName || null,
    lastName: profile.name?.familyName || null,
    profileImageUrl: profile.photos?.[0]?.value || null,
    roleId: 5, // Default to regular user role
    isActive: true
  };

  return await storage.upsertUser(userData);
}

export async function setupAuth(app: Express) {
  app.set('trust proxy', 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Replit OpenID Connect strategy
  passport.use(new Strategy({
    issuer: process.env.ISSUER_URL || 'https://replit.com/oidc',
    clientID: process.env.REPL_ID!,
    clientSecret: 'none', // Replit doesn't require a client secret
    callbackURL: `https://${process.env.REPLIT_DOMAINS!.split(',')[0]}/api/callback`,
    scope: 'openid email profile'
  }, (accessToken, refreshToken, profile, done) => {
    // Store the tokens and profile in the user object
    const user = {
      id: profile.id,
      profile,
      accessToken,
      refreshToken
    };
    
    // Save user to database
    upsertUser(profile)
      .then(() => done(null, user))
      .catch(err => done(err));
  }));

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // Login endpoint 
  app.get('/api/login', (req, res, next) => {
    // If already logged in, redirect to home
    if (req.isAuthenticated()) {
      return res.redirect('/');
    }

    passport.authenticate('openidconnect')(req, res, next);
  });

  // Callback endpoint
  app.get('/api/callback', 
    passport.authenticate('openidconnect', {
      successRedirect: '/',
      failureRedirect: '/api/login'
    })
  );

  // Logout endpoint
  app.get('/api/logout', (req, res) => {
    req.logout(() => {
      res.redirect('/');
    });
  });

  // User info endpoint
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUserByUsername(userId);
      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  return next();
};