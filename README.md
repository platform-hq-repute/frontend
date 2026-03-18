# ReputeHQ

A mobile SaaS application that helps businesses manage and respond to customer reviews on platforms like Google Business Profile and Trustpilot.

## Features

### Core Functionality
- **Review Dashboard** - View all reviews in one unified feed with key stats
- **AI-Powered Responses** - Generate thoughtful, personalized responses using OpenAI
- **Multi-Location Support** - Manage reviews across multiple business locations
- **Response Workflow** - Edit AI responses before publishing or write manual responses
- **Customizable AI Tone** - Professional, friendly, or casual response styles
- **Database Sync** - All data syncs with Supabase for persistence across devices

### Branding
- **Logo** - Custom logo displayed on onboarding, login, signup, and settings screens
- **Logo file**: `public/logo-1.png`

### Screens
- **Onboarding** - Beautiful 4-step introduction to the app
- **Login/Signup** - Authentication with email (creates/retrieves user from database)
- **Admin Login** - Separate admin portal access
- **Admin Dashboard** - Platform overview with user/business/review stats
- **Dashboard** - Stats overview, recent reviews, quick actions (empty state for new users)
- **Reviews** - Filterable list by status (pending, AI ready, responded) and rating
- **Review Detail** - Full review with AI response generator (OpenAI integration)
- **Locations** - Manage connected business locations (saved to database)
- **Settings** - AI preferences, notifications, account management

### Admin Portal (Mobile)
- **Admin Login** - Access via login screen "Admin Login" link
- **Admin Credentials**:
  - Email: `admin@reputehq.com`
  - Password: `Admin123!`
  - Alternative: `support@reputehq.com` / `Support123!`
- **Admin Dashboard** - View total users, businesses, reviews, and rating metrics

### Web Admin Portal
The app includes a full-featured web admin panel for managing the platform from a desktop browser. When viewing the app in a web browser, the admin panel automatically uses an optimized web layout with:

- **Dashboard** - Overview with stat cards, charts, recent users and reviews
- **Users Management** - View, edit, delete users with search and status filtering
- **Businesses Management** - Manage all registered business locations
- **Reviews Management** - View all reviews, edit responses, publish, delete
- **Settings** - Admin profile, security, notifications, database management

#### Accessing Web Admin
1. Open the app in a web browser
2. Navigate to the login screen
3. Click "Admin Login" link
4. Use admin credentials (see above)
5. The web-optimized admin interface will load automatically

## Database

The app uses **Supabase** as the backend database. Data is stored in the cloud and persists across sessions.

### Supabase Setup
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Add environment variables in the ENV tab:
   - `EXPO_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key

### Database Features
- **Users CRUD** - Create, read, update, delete users
- **Locations CRUD** - Manage business locations with owner associations
- **Reviews CRUD** - Manage reviews with automatic location stat updates
- **Admin Authentication** - Validate admin credentials
- **Statistics** - Aggregated platform metrics
- **Cloud Persistence** - Data stored in Supabase PostgreSQL database

## OpenAI Integration

The app uses **OpenAI** to generate AI-powered review responses.

### OpenAI Setup
1. Get an API key from [platform.openai.com](https://platform.openai.com)
2. Add environment variable in the **API tab** on Vibecode:
   - `EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY` - Your OpenAI API key

### How It Works
- When generating a response, the app sends the review content and tone settings to OpenAI
- Uses the `gpt-4o-mini` model for cost-effective, high-quality responses
- Falls back to template-based responses if OpenAI is not configured
- Responses are customized based on:
  - Review rating (positive, neutral, negative)
  - Selected tone (professional, friendly, casual)
  - Review content (personalized to the specific feedback)

### Database Types
```typescript
DBUser {
  id, email, name, avatar?, createdAt, status, businessCount, lastLoginAt?
}

DBLocation {
  id, name, address, googlePlaceId?, averageRating, totalReviews,
  pendingResponses, ownerId, ownerName, createdAt, status
}

Review {
  id, locationId, locationName, platform, authorName, authorAvatar?,
  rating, content, createdAt, status, aiResponse?, publishedResponse?, respondedAt?
}
```

### Web Landing Page
The app includes a professional corporate landing page for web visitors. When viewing the app in a browser, users see:

- **Hero Section** - Compelling headline with animated floating orbs and gradient mesh background
- **Stats Section** - Key metrics showcasing platform scale (10K+ businesses, 2M+ reviews)
- **Features Section** - Six feature cards highlighting platform capabilities
- **Testimonials** - Social proof from industry leaders
- **CTA Section** - Clear call-to-action for free trial signup
- **Professional Footer** - Product links, company info, and legal links

The landing page automatically routes users to Sign In or Get Started (signup) flows.

## Tech Stack

- Expo SDK 53 / React Native 0.76.7
- TypeScript
- **Supabase** for backend database
- Zustand for state management
- React Query for server state
- NativeWind (Tailwind CSS)
- React Native Reanimated for animations
- Expo Router for navigation

## Project Structure

```
src/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx    # Tab navigation
│   │   ├── index.tsx      # Dashboard
│   │   ├── reviews.tsx    # Reviews list
│   │   ├── locations.tsx  # Locations management
│   │   └── settings.tsx   # Settings
│   ├── admin/
│   │   ├── _layout.tsx    # Admin stack navigation
│   │   ├── index.tsx      # Mobile admin dashboard
│   │   ├── index.web.tsx  # Web admin dashboard
│   │   ├── users.web.tsx  # Web user management
│   │   ├── businesses.web.tsx  # Web business management
│   │   ├── reviews.web.tsx     # Web review management
│   │   └── settings.web.tsx    # Web admin settings
│   ├── review/
│   │   └── [id].tsx       # Review detail with AI response
│   ├── _layout.tsx        # Root layout
│   ├── admin-login.tsx    # Admin login screen
│   ├── onboarding.tsx     # Onboarding flow
│   ├── login.tsx          # Login screen
│   └── signup.tsx         # Signup screen
├── lib/
│   ├── store.ts           # Zustand stores
│   ├── supabase.ts        # Supabase client configuration
│   ├── database.ts        # Database layer with CRUD operations
│   ├── openai.ts          # OpenAI integration for AI review responses
│   ├── mock-data.ts       # Fallback response templates
│   └── cn.ts              # Tailwind class merger
└── components/
    ├── AdminWebLayout.tsx # Web admin sidebar layout
    └── Themed.tsx         # Themed components
```

## Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Blue | `#1A1F36` | Headers, text |
| Accent Teal | `#00D4AA` | CTAs, success |
| Background | `#F7F8FA` | App background |
| Warning | `#F59E0B` | Pending status |
| Success | `#10B981` | Responded status |
| Purple | `#8B5CF6` | AI Ready status |

## Running the App

The app runs automatically on port 8081 via Expo. View it through the Vibecode app.

### Viewing Web Admin
To access the web admin panel, view the app in a web browser and navigate to admin login.
