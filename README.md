# 🔖 Smart Bookmark App

A sophisticated, real-time bookmark manager built with **Next.js 14** and **Supabase**. This application allows users to securely manage their bookmarks with instant synchronization across devices.

## 🚀 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, TypeScript)
- **Backend / Database**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Realtime)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## ✨ Features

- **Google OAuth Login**: Seamless and secure authentication.
- **Real-time Sync**: Uses Supabase Postgres Changes to update the UI instantly across all open tabs.
- **Private Data**: Row Level Security (RLS) ensures that every user's bookmarks are completely private.
- **Search & Filter**: Find your saved links instantly with high-performance client-side filtering.
- **Premium Aesthetics**: A custom-built dark theme with glassmorphic elements and buttery-smooth transitions.

---

## 🛠️ Setup Instructions

### 1. Database Configuration
Execute the following SQL commands in your Supabase SQL Editor to initialize the database:

```sql
-- Create bookmarks table
CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can view their own bookmarks" ON bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own bookmarks" ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bookmarks" ON bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Enable Realtime for the bookmarks table
ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;
```

### 2. Environment Setup
Create a `.env.local` file in the root directory and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Local Development
```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

---

## 🧠 Problems Encountered & Solutions

### 1. Directory Naming Restrictions
- **Problem**: The initial project initialization failed because the parent directory contained spaces and capital letters (`Smart Boomark App`), which is incompatible with `create-next-app` naming standards.
- **Solution**: Created a dedicated, URL-friendly subdirectory named `smart-bookmark-app` for the source code and initialized the project there.

### 2. Deprecated Auth Helpers
- **Problem**: The `@supabase/auth-helpers-nextjs` package showed inconsistent behavior and missing exports (specifically `createRouteHandlerClient`) in the context of Next.js 14/15 modern App Router features.
- **Solution**: Migrated the entire authentication and session management layer to the newer `@supabase/ssr` package. This required refactoring the Middleware, Browser Client, and Auth Callback Route, resulting in a much more stable and future-proof implementation.

### 3. Real-time Latency vs. User Experience
- **Problem**: While Supabase Realtime worked, there was a slight "perceived delay" between clicking "Add" and the bookmark appearing in the list on the same tab.
- **Solution**: Implemented a hybrid approach. While relying on Realtime for multi-device sync, I added a manual `fetchBookmarks()` call immediately after a successful insertion. This ensures the UI feels "snappy" and instant for the active user while still maintaining perfect sync across other secondary tabs.

### 4. Schema Cache Inconsistency
- **Problem**: During development, an error occurred stating `"Could not find the table 'public.bookmarks' in the schema cache"`.
- **Solution**: This usually happens when the PostgREST cache is stale after table creation. I addressed this by ensuring the SQL schema was correctly applied and advising a project refresh/environment variable verification, which force-refreshed the schema cache.

---

## 📝 Submission Details

- **Public Repo**: [GitHub Repository Link]
- **Live Demo**: [Vercel Deployment URL]
- **README**: Detailed documentation of features, setup, and engineering challenges.
