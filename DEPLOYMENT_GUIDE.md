# Mini Canva - AI-Powered SaaS Design Platform

Complete production-ready Canva-like SaaS application with AI features.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Firebase Project
- OpenRouter API Key (for AI features)

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Add your Firebase and API keys to .env.local

# Run development server
npm run dev
```

## 🔧 Environment Variables

Create `.env.local` with:

```
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# AI Services
OPENROUTER_API_KEY=your_openrouter_key

# Stripe (Optional)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret

# API
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 📁 Project Structure

```
ai-saas/
├── app/
│   ├── api/              # API routes
│   ├── dashboard/        # User dashboard
│   ├── editor/          # Canvas editor
│   ├── login/           # Auth pages
│   ├── signup/
│   ├── settings/        # User settings
│   ├── billing/         # Billing page
│   ├── templates/       # Templates gallery
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/
│   ├── Navbar.tsx
│   ├── NavbarNew.tsx
│   ├── AIChatBoxEnhanced.tsx
│   ├── ProtectedRoute.tsx
│   └── editor/          # Editor components
├── context/
│   └── AuthContext.tsx  # Authentication context
├── lib/
│   ├── firebase.ts      # Firebase config
│   ├── firestore-schema.ts
│   ├── db-operations.ts
│   ├── export-utils.ts
│   └── format-utils.ts
├── types/
│   ├── auth.ts
│   └── editor.ts
├── store/
│   └── useEditorStore.ts # Zustand store
└── public/
```

## 🔐 Authentication

### Supported Methods
- ✅ Google OAuth
- ✅ Email/Password
- ✅ Persistent sessions
- ✅ Email verification

### User Roles
- `user` - Free tier
- `premium` - Pro tier
- `admin` - Admin access

### Session Persistence
- Auto login on page refresh
- Browser local storage
- Firebase Auth state

## 🎨 Features Implemented

### Core Canvas Editor
- ✅ Fabric.js integration
- ✅ Drag & drop elements
- ✅ Resize & rotate
- ✅ Multi-page designs
- ✅ Undo/redo history
- ✅ Auto-save to Firebase

### AI Features
- ✅ Design suggestions
- ✅ AI chatbot assistant
- ✅ Real-time design tips
- ✅ OpenRouter integration

### Design Tools
- ✅ Text formatting
- ✅ Shape creation
- ✅ Color management
- ✅ Layer management
- ✅ Gradient support

### Export Options
- ✅ PNG export
- ✅ JPG export
- ✅ PDF export
- ✅ SVG export
- ✅ Transparent background

### Database (Firestore)
- ✅ Users collection
- ✅ Designs collection
- ✅ Templates collection
- ✅ Subscriptions collection

## 📊 Firebase Collections

### users
```json
{
  "uid": "user_id",
  "email": "user@example.com",
  "displayName": "John Doe",
  "photoURL": "url",
  "role": "user|premium|admin",
  "subscriptionPlan": "free|pro|business",
  "aiCreditsUsed": 0,
  "aiCreditsLimit": 10,
  "storageUsed": 0,
  "storageLimit": 100,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### designs
```json
{
  "id": "design_id",
  "userId": "user_id",
  "title": "My Design",
  "description": "",
  "thumbnail": "url",
  "pages": [
    {
      "id": "page_1",
      "name": "Page 1",
      "json": "fabric_json"
    }
  ],
  "width": 1080,
  "height": 1080,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

## 🚀 Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Firebase Rules

```
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

## 💳 Stripe Integration

### Setup

1. Get Stripe API keys from dashboard
2. Add to environment variables
3. Update billing page with Stripe pricing

```typescript
// Example Stripe integration
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createSubscription(userId: string, priceId: string) {
  // Implementation
}
```

## 📱 Responsive Design

- ✅ Mobile optimized
- ✅ Tablet support
- ✅ Desktop layouts
- ✅ Touch gestures (mobile)

## ⚡ Performance

### Optimizations
- ✅ Code splitting
- ✅ Image optimization
- ✅ Lazy loading
- ✅ Caching strategy
- ✅ CDN integration

### Target Lighthouse Scores
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 95+

## 🛠 Development

### Commands

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start

# Lint
npm run lint

# Type check
npx tsc --noEmit
```

### Debugging

```bash
# Enable debug logging
DEBUG=* npm run dev

# Firebase emulator
firebase emulators:start
```

## 📚 Key Components

### AuthContext
Handles all authentication logic including:
- Login/signup
- Session management
- Profile updates
- Logout

### useEditorStore
Zustand store for canvas state:
- Canvas instance
- Active selection
- History management
- Multi-page support
- Auto-save

### ProtectedRoute
Route protection wrapper:
- Checks authentication
- Redirects to login
- Role-based access
- Admin routes

## 🐛 Common Issues

### Firebase Connection
- Verify API keys in .env.local
- Check Firebase project settings
- Enable Firestore in Firebase console

### AI Chatbot Not Working
- Verify OpenRouter API key
- Check API usage limits
- Review error logs in browser console

### Export Not Working
- Check browser storage permissions
- Verify canvas is properly rendered
- Check file size limits

## 📖 Documentation

- [Next.js Docs](https://nextjs.org)
- [Firebase Docs](https://firebase.google.com/docs)
- [Fabric.js Docs](http://fabricjs.com)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [Tailwind Docs](https://tailwindcss.com)

## 🤝 Contributing

Pull requests are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📄 License

MIT

## 💬 Support

For issues and questions:
- Create GitHub issue
- Contact support@minicanva.com
- Discord community

---

**Happy Designing! 🎨**
