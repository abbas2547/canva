# Production Deployment Checklist

## Pre-Deployment

- [ ] All environment variables set in `.env.local`
- [ ] Firebase project created and configured
- [ ] OpenRouter API key obtained
- [ ] All dependencies installed (`npm install`)
- [ ] No console errors or warnings
- [ ] Code passes linting (`npm run lint`)
- [ ] TypeScript compilation successful (`npx tsc --noEmit`)

## Firebase Setup

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      allow list: if request.auth != null && request.auth.uid == userId;
    }

    // User designs
    match /designs/{designId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
      allow delete: if request.auth.uid == resource.data.userId;
      allow list: if request.auth.uid == resource.data.userId;
    }

    // Public templates
    match /templates/{templateId} {
      allow read: if true;
      allow write: if request.auth.uid in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.admins;
    }

    // Subscriptions
    match /subscriptions/{subscriptionId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
  }
}
```

### Firebase Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /uploads/{userId}/{allPaths=**} {
      allow read, write: if request.auth.uid == userId;
    }
    match /thumbnails/{userId}/{allPaths=**} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

## Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Vercel
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
OPENROUTER_API_KEY
NEXT_PUBLIC_API_URL=https://your-domain.com
```

## Testing Checklist

### Authentication
- [ ] Sign up with email works
- [ ] Login with email works
- [ ] Google OAuth works
- [ ] Forgot password email sent
- [ ] Session persists on refresh
- [ ] Logout clears session

### Dashboard
- [ ] User can see their designs
- [ ] Stats display correctly
- [ ] Can create new design
- [ ] Can delete design
- [ ] Can duplicate design

### Editor
- [ ] Canvas renders correctly
- [ ] Can add text
- [ ] Can add shapes
- [ ] Can upload images
- [ ] AI chatbox responds
- [ ] Can export PNG/PDF
- [ ] Auto-save works
- [ ] Undo/Redo works
- [ ] Multi-page works

### Settings
- [ ] Can update profile
- [ ] Can change password
- [ ] Can see usage stats
- [ ] Can view billing

### Mobile
- [ ] Navbar responsive
- [ ] Mobile menu works
- [ ] Touch interactions work
- [ ] Responsive layouts

## Performance Optimization

### Images
- [ ] Use Next.js Image component
- [ ] Optimize image sizes
- [ ] Use WebP format

### Code Splitting
- [ ] Dynamic imports for heavy components
- [ ] Lazy load templates
- [ ] Split editor components

### Caching
- [ ] Cache Firebase queries
- [ ] Browser caching enabled
- [ ] CDN configured

## Security

- [ ] HTTPS enabled
- [ ] CSP headers configured
- [ ] CORS properly set
- [ ] API keys hidden
- [ ] Firebase rules restrictive
- [ ] No sensitive data in localStorage
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented

## Monitoring

- [ ] Firebase monitoring enabled
- [ ] Error tracking set up
- [ ] Analytics enabled
- [ ] Performance monitoring active
- [ ] Uptime monitoring configured

## Backup & Recovery

- [ ] Firebase backup enabled
- [ ] Database exports scheduled
- [ ] Disaster recovery plan
- [ ] Rollback procedure documented

## Post-Deployment

- [ ] DNS configured
- [ ] SSL certificate active
- [ ] Custom domain working
- [ ] Email notifications enabled
- [ ] Analytics dashboard accessible
- [ ] Error alerts configured
- [ ] Performance baseline established

## Monitoring Commands

```bash
# Check build size
npm run build
du -sh .next

# Analyze dependencies
npm ls --depth=0

# Check for vulnerabilities
npm audit

# Performance check
npm install -g lighthouse
lighthouse https://your-domain.com
```

## Rollback Procedure

If issues occur:

1. Revert to previous Vercel deployment
2. Check Firebase console for errors
3. Review recent changes
4. Test in development environment
5. Redeployonce fixed

## Ongoing Maintenance

- [ ] Monitor error rates
- [ ] Update dependencies monthly
- [ ] Security patches applied immediately
- [ ] Database optimization
- [ ] Performance review
- [ ] User feedback implemented

---

**Last Updated:** January 2024
