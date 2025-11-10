# NeRd Music Platform

A modern web-based music streaming platform with user authentication, favorites management, and external API integration.

## Team Members
- Ruslan Bolatbekuly
- Nurkhan Orazbay

## Features

### User Authentication
- User registration and login system
- Session management with localStorage
- Protected routes for authenticated users
- User-specific favorites

### Music Player
- Bottom music player with full controls
- Play, pause, skip tracks
- Volume control with persistence
- Progress bar with seek functionality
- Auto-play next track

### Favorites System
- Add tracks to favorites
- User-specific favorites (each user has their own list)
- View and manage favorite tracks
- Remove tracks from favorites

### External API Integration
- Deezer API integration for real music data
- Fetch trending tracks
- 30-second audio previews
- Search functionality
- Album artwork display

### User Profile
- Personalized user profiles
- Edit profile information
- Change avatar colors
- View listening statistics
- Manage account settings

### Other Features
- Star rating system for tracks
- Genre filtering
- Internationalization (English/Russian)
- Responsive design
- Dark theme UI
- Search functionality

## Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript (ES6+)
- Bootstrap 5

### APIs
- Deezer API (music data)
- CORS proxy for API requests

### Storage
- localStorage for data persistence
- User sessions
- Favorites storage
- Profile data

## Project Structure

```
NeRd-Music-Platform/
├── frontend/
│   ├── css/
│   │   ├── main.css
│   │   ├── login.css
│   │   ├── favourite.css
│   │   └── profile.css
│   ├── html/
│   │   ├── login.html
│   │   ├── register.html
│   │   ├── favourite.html
│   │   └── profile.html
│   ├── js/
│   │   ├── index.js
│   │   ├── main.js
│   │   ├── player.js
│   │   ├── search.js
│   │   ├── validation.js
│   │   ├── auth.js
│   │   ├── profile.js
│   │   ├── api-service.js
│   │   ├── favorites-manager.js
│   │   └── shared-ux.js
│   └── src/
│       ├── img/
│       └── music/
├── index.html
└── README.md
```

## How to Run

1. Clone the repository
2. Open `index.html` in a web browser
3. Or use a local server (recommended):
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   ```
4. Navigate to `http://localhost:8000`

## Usage

### Registration
1. Click "Sign Up" button
2. Enter username, email, and password
3. Submit the form
4. Automatically logged in after registration

### Login
1. Click "Login" button
2. Enter email and password
3. Submit the form

### Adding Favorites
1. Login to your account
2. Browse music tracks
3. Click "Add to Favourites" button
4. View your favorites in the Favourites page

### Playing Music
1. Click on any track image to start playing
2. Use the player controls at the bottom:
   - Play/Pause button
   - Previous/Next track buttons
   - Volume slider
   - Progress bar for seeking

### Profile Management
1. Click on your username in the navigation
2. Edit profile information
3. Change avatar color
4. View your statistics

## API Integration

The platform uses the Deezer API to fetch real music data:
- Trending tracks from Deezer charts
- Track previews (30 seconds)
- Album artwork
- Artist information

API requests are proxied through `corsproxy.io` to handle CORS restrictions.

## Data Storage

All user data is stored in browser's localStorage:
- `nerd_auth` - Authentication status
- `nerd_user` - User information
- `nerd_profile` - Profile data
- `nerd_favourites_[email]` - User-specific favorites
- `nerd_ratings` - Track ratings
- `nerd_volume` - Player volume setting
- `nerd_lang` - Language preference

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Known Issues

- API tracks may not load if CORS proxy is down
- Some Deezer preview URLs may not be available in all regions
- localStorage is browser-specific (data doesn't sync across browsers)

## Future Enhancements

- Backend server for proper authentication
- Database for persistent storage
- Playlist creation and management
- Social features (share favorites)
- More music sources (Spotify, SoundCloud)
- Advanced search filters
- User comments and reviews

## Acknowledgments

- Bootstrap for UI components
- Deezer API for music data
- Font Awesome for icons (if used)
