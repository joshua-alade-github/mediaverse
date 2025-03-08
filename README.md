# MediaVerse

MediaVerse is a comprehensive platform for tracking, discovering, and sharing your media consumption across various types including movies, TV shows, books, games, music, and more.

## Features

### User Account
- 🔐 Register and login with email/password or social media
- 👤 Customize your profile with bio and profile picture
- 🔄 Reset password via email
- 🛑 Delete account and all associated data
- 🔒 Robust privacy and security settings

### Media Tracking
- 📚 Track your media consumption across multiple media types
- ✅ Mark media as "To Watch/Read/Play", "In Progress", or "Completed"
- ⭐ Rate and review media
- 📋 Create custom lists to organize your media collection
- ❤️ Favorite your most loved media

### Social Features
- 👥 Follow other users
- 📝 Create and share posts about media
- 💬 Comment on posts and reviews
- 👍 Like or dislike content
- 📨 Private messaging between users
- 🔔 Notifications for social interactions

### Discovery
- 🔍 Advanced search across all media types
- 📊 Trending media charts
- 🎯 Personalized recommendations based on your preferences
- 📈 Statistics about your media consumption habits
- 🏆 Achievements and badges for platform usage

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **External APIs**: TMDB, IGDB, Google Books, Last.fm, Comic Vine

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env.local` file with the required environment variables
4. Run the development server: `npm run dev`

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key
NEXT_PUBLIC_IGDB_CLIENT_ID=your_igdb_client_id
NEXT_PUBLIC_IGDB_CLIENT_SECRET=your_igdb_client_secret
NEXT_PUBLIC_LASTFM_API_KEY=your_lastfm_api_key
NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY=your_google_books_api_key
NEXT_PUBLIC_COMIC_VINE_API_KEY=your_comic_vine_api_key
```

## Database Schema

The application relies on the following main tables in Supabase:

- `users` - User authentication (handled by Supabase Auth)
- `user_profiles` - User profile information
- `media` - Core media information
- `media_progress` - User's progress on media
- `reviews` - User reviews and ratings
- `lists` - User-created media lists
- `list_items` - Items in lists
- `favorites` - User's favorite media
- `posts` - User-generated posts
- `comments` - Comments on posts and reviews
- `reactions` - Likes/dislikes on posts, comments, and reviews
- `user_follows` - User follow relationships
- `notifications` - User notifications
- `messages` - Private messages between users
- `conversations` - Message groupings
- `achievements` - User achievements and badges

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.