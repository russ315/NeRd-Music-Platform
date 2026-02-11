# NeRuaD Music Platform

A modern web-based music streaming platform with user authentication, favorites management, playlists, and external API integration.

## Team Members
- Ruslan Bolatbekuly
- Nurkhan Orazbay
- Zhexenov Dauren

## Project Proposal

**Project title:** NeRuaD

**Topic:** Music platform in Spotify-like style with support for video clips and personalized playlists. Users can listen to music, watch clips, and get recommendations.

**Why this project:** The team wanted to build a practical product around everyday music usage and combine frontend + backend skills in one system.

## Main Features
- Personalized music suggestions (simple recommendation logic)
- Playlist creation and editing
- Favorite tracks
- User profile and settings
- Monthly subscription concept (no ads, infinite stream, weekly picks)
- Video clips page for tracks
- Unique feature: **Share Capsule** (short set of 5-10 tracks shared by code/link with expiration)

## Current Implemented Features

### User Authentication
- User registration and login flow
- Session persistence in localStorage and token-based API mode
- Protected pages/routes for authenticated users

### Music Player
- Bottom player with play/pause/next/prev
- Volume control with persistence
- Progress bar with seeking
- Auto-play next track

### Favorites and Playlists
- Add/remove favorites
- User-scoped favorites list
- Playlist management and track assignment

### External API Integration
- Deezer API integration for track metadata
- Trending tracks fetch
- 30-second preview playback
- Search support

### Profile and UX
- Profile editing
- Avatar and settings controls
- Ratings and statistics widgets
- i18n (English/Russian), responsive UI, theming

## Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript (ES6+)
- Bootstrap 5

### Backend
- Node.js
- Express
- MongoDB + Mongoose
- JWT + bcrypt

### APIs
- Deezer API (music data)
- CORS proxy for client-side API requests

## Database Design (Schemas)

### User
- `_id` (ObjectId)
- `username` (string)
- `email` (string, unique)
- `passwordHash` (string)
- `role` (string: user / premium / admin)
- `createdAt`, `updatedAt`

### Profile
- `_id`
- `userId` (ref User)
- `avatarColor` (string)
- `bio` (string, optional)
- `settings` (object: notifications, autoplay, privacy)
- `stats` (object: favoritesCount, playlistsCount, listenMinutes, avgRating)

### Track
- `_id`
- `externalId` (string, id from external API)
- `title` (string)
- `artist` (string)
- `album` (string)
- `previewUrl` (string)
- `duration` (number)
- `genre` (string)
- `source` (string: deezer / local)

### Playlist
- `_id`
- `userId` (ref User)
- `title` (string)
- `description` (string)
- `isPublic` (boolean)
- `trackIds` (array of Track refs)
- `createdAt`, `updatedAt`

### Favorite
- `_id`
- `userId` (ref User)
- `trackId` (ref Track)
- `createdAt`

### Subscription
- `_id`
- `userId` (ref User)
- `status` (string: active / inactive)
- `plan` (string: monthly)
- `startedAt`, `expiresAt`

### VideoClip
- `_id`
- `trackId` (ref Track)
- `title` (string)
- `videoUrl` (string)
- `source` (string: youtube / local)

### ShareCapsule
- `_id`
- `userId` (ref User)
- `title` (string)
- `trackIds` (array of Track refs)
- `shareCode` (string, unique)
- `expiresAt` (date)
- `createdAt`

## API Endpoint List

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`

### User / Profile
- `GET /api/users/me`
- `PUT /api/users/me`
- `GET /api/users/me/profile`
- `PUT /api/users/me/profile`

### Playlists
- `POST /api/playlists`
- `GET /api/playlists`
- `GET /api/playlists/:id`
- `PUT /api/playlists/:id`
- `DELETE /api/playlists/:id`
- `POST /api/playlists/:id/tracks`
- `DELETE /api/playlists/:id/tracks/:trackId`

### Favorites
- `GET /api/favorites`
- `POST /api/favorites`
- `DELETE /api/favorites/:trackId`

### Tracks
- `POST /api/tracks`
- `GET /api/tracks/:id`

### Video Clips
- `GET /api/tracks/:id/clips`
- `POST /api/tracks/:id/clips`

### Subscriptions
- `GET /api/subscription`
- `PUT /api/subscription`

### Share Capsule
- `POST /api/share-capsules`
- `GET /api/share-capsules/:shareCode`

## Project Structure

```text
NeRuaD-Music-Platform/
|-- frontend/
|   |-- css/
|   |-- html/
|   |-- js/
|   `-- src/
|       |-- img/
|       `-- music/
|-- backend/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middlewares/
|   |   |-- models/
|   |   `-- routes/
|   `-- package.json
|-- index.html
|-- API_INTEGRATION.md
`-- README.md
```

## How to Run

1. Clone the repository.
2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Configure backend env:
   - create `backend/.env`
   - set `PORT`, `MONGO_URI`, `JWT_SECRET`
4. Start backend:
   ```bash
   npm run dev
   ```
5. Open frontend from backend static server:
   - `http://localhost:4000`

## Usage

### Registration
1. Click **Sign Up**.
2. Enter username, email, and password.
3. Submit the form.

### Login
1. Click **Login**.
2. Enter email and password.
3. Submit the form.

### Favorites
1. Log in.
2. Browse tracks.
3. Click **Add to Favourites**.
4. Open **Favourites** page to manage items.

### Profile
1. Open profile page.
2. Edit profile fields and settings.
3. Check quick statistics.

## Data Storage Notes
- Local UI state uses browser localStorage (theme, some UI preferences, cached lists).
- Backend persistence uses MongoDB for users, tracks, favorites, playlists, and related entities.

## Browser Compatibility
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Known Issues
- Some pages still include localStorage fallback behavior.
- Deezer previews can be unavailable by region or track.
- CORS proxy availability can affect external API fetches.

## Future Enhancements
- Remove all legacy local-only auth flows
- Full DB-only synchronization for profile/settings/statistics
- Social features and collaboration playlists
- More music providers (Spotify, SoundCloud)
- Improved search and recommendation quality
  
## Acknowledgments
- Bootstrap for UI components
- Deezer API for music data
