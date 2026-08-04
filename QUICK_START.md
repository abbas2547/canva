# 🚀 QUICK START GUIDE - Mini Canva

Complete step-by-step instructions to get your AI-powered design platform running.

## Step 1: Project Setup

```bash
# Navigate to project directory
cd "D:\one drive\OneDrive\Desktop\mini canva\ai-saas"

# Install dependencies
npm install

# This will install all packages including:
# - Next.js 16
# - Firebase
# - Tailwind CSS
# - Framer Motion
# - React Hot Toast
# - Fabric.js
# - Stripe, html2canvas, jsPDF
# - OpenAI SDK
```

## Step 2: Firebase Setup

1. **Create Firebase Project**
   - Go to https://firebase.google.com
   - Click "Get Started"
   - Create a new project
   - Enable Firestore Database
   - Enable Authentication (Email & Google)
   - Enable Storage

2. **Get Firebase Credentials**
   - In Firebase Console → Project Settings
   - Copy all credentials

3. **Create `.env.local` File**
   ```bash
   # In project root, create .env.local file
   touch .env.local
   ```

4. **Add Firebase Config**
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=xxx
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
   NEXT_PUBLIC_FIREBASE_APP_ID=xxx
   ```

## Step 3: AI Setup (OpenRouter)

1. **Get OpenRouter API Key**
   - Go to https://openrouter.ai
   - Sign up and get API key

2. **Add to `.env.local`**
   ```
   OPENROUTER_API_KEY=your_openrouter_key
   ```

## Step 4: Optional - Stripe Setup

1. **Get Stripe Keys**
   - Go to https://stripe.com
   - Sign up and get API keys

2. **Add to `.env.local`**
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
   STRIPE_SECRET_KEY=sk_test_xxx
   ```

## Step 5: Run Development Server

```bash
npm run dev

# Server runs at http://localhost:3000
```

## Step 6: Test the Application

### Create Test Account
1. Go to http://localhost:3000
2. Click "Sign Up"
3. Create account with email
4. OR login with Google

### Test Dashboard
1. Click "Dashboard"
2. See empty designs list
3. Click "New Design"

### Test Editor
1. Click "Editor" in navbar
2. Should see canvas
3. AI chatbox appears on right
4. Click chat to test AI

### Test Settings
1. Click profile icon
2. Click "Settings"
3. Update profile
4. View billing info

## Firebase Firestore Rules

Add these rules to Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /designs/{designId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
  }
}
```

## File Structure Overview

```
ai-saas/
├── app/
│   ├── api/ai-chat/         ← AI API endpoint
│   ├── login/               ← Login page
│   ├── signup/              ← Signup page  
│   ├── dashboard/           ← Main dashboard
│   ├── editor/              ← Canvas editor
│   ├── settings/            ← User settings
│   ├── billing/             ← Billing page
│   ├── templates/           ← Templates gallery
│   └── page.tsx             ← Home page
├── components/
│   ├── Navbar.tsx           ← Navigation
│   ├── AIChatBoxEnhanced.tsx← AI chatbot
│   ├── ProtectedRoute.tsx   ← Route protection
│   └── ImageUploadComponent.tsx
├── lib/
│   ├── firebase.ts          ← Firebase config
│   ├── db-operations.ts     ← Database functions
│   ├── export-utils.ts      ← Export functions
│   └── format-utils.ts      ← Format functions
├── context/
│   └── AuthContext.tsx      ← Auth logic
├── store/
│   └── useEditorStore.ts    ← Editor state
└── types/
    └── auth.ts              ← Type definitions
```

## Key Features to Try

### 1. Authentication
- Sign up with email
- Login with Google
- Password reset
- Profile editing

### 2. Dashboard
- View your designs
- See usage statistics
- Create new design
- Delete designs

### 3. Editor
- Chat with AI assistant
- Add text to canvas
- Add shapes
- Upload images
- Export as PNG/JPG/PDF

### 4. Settings
- Update display name
- View current plan
- See storage usage
- Manage notifications

## Commands Reference

```bash
# Development
npm run dev              # Start dev server

# Production
npm run build            # Build for production
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint
npx tsc --noEmit        # Type check

# Dependencies
npm install              # Install all packages
npm update               # Update packages
npm audit                # Check vulnerabilities
```

## Common Issues & Solutions

### "Firebase initialization failed"
**Solution**: Check `.env.local` has correct Firebase keys

### "AI chat not responding"
**Solution**: Verify OPENROUTER_API_KEY in `.env.local`

### "Images not uploading"
**Solution**: Check Firebase Storage permissions

### "Port 3000 already in use"
**Solution**: Run on different port: `npm run dev -- -p 3001`

### "Module not found"
**Solution**: Run `npm install` again

## Debugging Tips

1. **Check Console Errors**
   - Open browser DevTools (F12)
   - Check Console tab
   - Check Network tab for API errors

2. **Firebase Console Logs**
   ```bash
   firebase emulators:start
   ```

3. **Enable Debug Logging**
   ```bash
   DEBUG=* npm run dev
   ```

## Next Steps After Setup

1. **Deploy to Vercel**
   - Push code to GitHub
   - Connect to Vercel
   - Add environment variables
   - Deploy

2. **Enable Stripe Payments**
   - Create Stripe products
   - Implement webhooks
   - Test payments

3. **Add More AI Features**
   - Image generation (DALL-E)
   - Text generation
   - Design suggestions

4. **Enhance Templates**
   - Create more templates
   - Add template categories
   - Implement template preview

5. **Add Analytics**
   - Google Analytics
   - Firebase Analytics
   - Custom events

## Support

- 📖 Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- 📋 Check [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- 🚀 Check [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

## Useful Links

- Firebase: https://firebase.google.com
- Next.js: https://nextjs.org
- Tailwind: https://tailwindcss.com
- Fabric.js: http://fabricjs.com
- OpenRouter: https://openrouter.ai
- Stripe: https://stripe.com

---

**Ready to launch? 🎨**

For production deployment, follow [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
