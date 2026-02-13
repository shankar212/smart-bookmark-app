# 🔖 Smart Bookmark App

A sophisticated, real-time bookmark manager built with **Next.js 14/15**, **Tailwind v4**, and **Supabase**. This application allows users to securely manage their bookmarks with instant synchronization and a premium, theme-aware user interface.

## 🚀 Tech Stack

- **Framework**: [Next.js 14/15](https://nextjs.org/) (App Router, TypeScript)
- **Backend / Database**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Realtime)
- **Theming**: [Next-Themes](https://github.com/pacocoursey/next-themes) (Dark/Light mode persistence)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## ✨ Features

- **Google OAuth Login**: Seamless and secure authentication.
- **Dynamic Theming**: Premium **Dark** and **Light** modes. Defaults to system preference with manual toggle.
- **Enhanced Real-time Sync**: Full cross-tab synchronization. Add or delete a bookmark in one tab, and it instantly updates across all others.
- **Private Data**: Row Level Security (RLS) ensures that every user's bookmarks are completely private.
- **Search & Filter**: Find your saved links instantly with high-performance client-side filtering.
- **Premium Aesthetics**: Glassmorphic elements, softened light-mode palette, and buttery-smooth animations.

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

-- CRITICAL: Enable Realtime for the bookmarks table
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

### 1. Cross-Tab Deletion Sync
- **Problem**: While insertions were syncing, deletions were often ignored or required a full page refresh in other tabs.
- **Solution**: Refactored the Realtime listener to handle `DELETE` events explicitly by tracking the `old.id` payload. This allows the application to remove the specific element from the state instantly across all instances.

### 2. Supabase Client Re-initialization
- **Problem**: The Realtime subscription would frequently drop or "flicker" during user interactions (like typing in the search bar).
- **Solution**: Identified that the Supabase client was being recreated on every component render. I implemented `useMemo` to stabilize the client instance, ensuring a persistent WebSocket connection for Realtime updates.

### 3. Tailwind v4 Dark Mode Selector
- **Problem**: Tailwind v4 changed how it detects the `.dark` class compared to previous versions, causing the "manual" theme toggle to fail even when the class was present.
- **Solution**: Implemented a custom `@theme` block and a `@custom-variant dark` in `globals.css` to explicitly link Tailwind's dark utility classes to the `.dark` class applied by `next-themes`.

### 4. Light Theme Eye Strain
- **Problem**: The initial light theme was a pure `#ffffff` which felt too bright and "unfinished".
- **Solution**: Shifted to a premium off-white palette (`#f9fafb`) and used solid white cards with subtle shadows to create depth and a better visual hierarchy.

---

## 📝 Submission Details

- **Public Repo**: [GitHub Repository Link]
- **Live Demo**: [Vercel Deployment URL]
- **README**: Detailed documentation of features, setup, and engineering challenges.
