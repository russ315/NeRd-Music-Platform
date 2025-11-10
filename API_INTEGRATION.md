# External API Integration Documentation

## Overview
The NeRd Music Platform integrates with the **Deezer API** to provide real music data, including trending tracks, artist information, and 30-second audio previews.

## Features

### ✨ Implemented Features
- **Real Music Data**: Fetches actual tracks from Deezer's catalog
- **Top Charts**: Displays trending tracks from Deezer
- **Search Integration**: Search for tracks, artists, and albums
- **Audio Previews**: 30-second preview clips for each track
- **Artist Information**: Track includes artist name and album art
- **Favorites Support**: Add API tracks to your favorites list
- **Rating System**: Rate API tracks just like local content
- **Loading States**: Visual feedback while fetching data
- **Error Handling**: Graceful fallback if API is unavailable

## API Service (`api-service.js`)

### Available Functions

#### `MusicAPI.fetchTopCharts(limit)`
Fetches top trending tracks from Deezer.
```javascript
const tracks = await MusicAPI.fetchTopCharts(12);
```

#### `MusicAPI.searchTracks(query, limit)`
Search for tracks by query string.
```javascript
const results = await MusicAPI.searchTracks('rock music', 20);
```

#### `MusicAPI.fetchTracksByGenre(genre, limit)`
Fetch tracks by specific genre.
```javascript
const jazzTracks = await MusicAPI.fetchTracksByGenre('jazz', 10);
```

#### `MusicAPI.fetchTracksByArtist(artistName, limit)`
Fetch top tracks by a specific artist.
```javascript
const artistTracks = await MusicAPI.fetchTracksByArtist('Coldplay', 10);
```

#### `MusicAPI.getRecommendations(genres, limit)`
Get personalized recommendations based on genres.
```javascript
const recommendations = await MusicAPI.getRecommendations(['pop', 'rock', 'electronic'], 5);
```

#### `MusicAPI.checkAPIStatus()`
Check if the Deezer API is currently available.
```javascript
const isAvailable = await MusicAPI.checkAPIStatus();
```

## Track Object Structure

API tracks are formatted to match the platform's internal structure:

```javascript
{
    id: 'deezer_123456789',      // Unique ID with 'deezer_' prefix
    title: 'Track Title',          // Song title
    artist: 'Artist Name',         // Artist name
    album: 'Album Name',           // Album title
    img: 'https://...',            // Album cover image URL
    preview: 'https://...',        // 30-second audio preview URL
    duration: 180,                 // Duration in seconds
    genre: 'Various',              // Genre (if available)
    source: 'deezer',              // Source identifier
    externalUrl: 'https://...'     // Link to track on Deezer
}
```

## CORS Proxy

The integration uses a CORS proxy (`https://corsproxy.io/`) to bypass browser CORS restrictions when calling the Deezer API. This is necessary for client-side requests.

### Alternative CORS Proxies
If the default proxy is unavailable, you can modify the `CORS_PROXY` in `api-service.js`:
- `https://corsproxy.io/?`
- `https://cors-anywhere.herokuapp.com/`
- Or set up your own CORS proxy server

## Usage in Code

### Display API Tracks on Home Page
```javascript
// Automatically loads when page initializes
// See index.js - initializeAPIIntegration()
```

### Search with API
```javascript
async function searchMusic(query) {
    try {
        const results = await MusicAPI.searchTracks(query, 20);
        renderAPITracks(results);
    } catch (error) {
        console.error('Search failed:', error);
    }
}
```

### Get Recommendations
```javascript
async function loadRecommendations() {
    const favoriteGenres = ['Pop', 'Rock', 'Electronic'];
    const recommendations = await MusicAPI.getRecommendations(favoriteGenres, 15);
    displayTracks(recommendations);
}
```

## Visual Indicators

API tracks are visually distinguished from local content:
- **Blue "API" Badge**: Shows on top-right of track images
- **Section Header**: "🌍 Trending Now" with "Powered by Deezer API" badge
- **Artist Info**: Displays "by [Artist Name]" below track title

## Error Handling

The integration includes comprehensive error handling:

1. **API Unavailable**: Silently fails and only displays local content
2. **Timeout**: 10-second timeout for all API requests
3. **Network Errors**: Caught and logged, user sees notification
4. **Empty Results**: Gracefully handles no results from API

## Performance Considerations

- **Lazy Loading**: API tracks load 1 second after page load to not block initial render
- **Caching**: Browser caches images from Deezer CDN
- **Timeout**: 10-second maximum wait time for API responses
- **Loading Indicator**: Shows spinner while fetching data

## Limitations

1. **No Authentication**: Uses public Deezer API (no user-specific features)
2. **Preview Only**: Only 30-second previews available (full playback requires Deezer subscription)
3. **Rate Limiting**: Deezer may rate-limit excessive requests
4. **CORS Dependency**: Relies on external CORS proxy service

## Future Enhancements

- [ ] Add Spotify API integration for more music sources
- [ ] Cache API results in localStorage
- [ ] Add pagination for search results
- [ ] Implement personalized recommendations based on listening history
- [ ] Add Last.fm API for music metadata and scrobbling
- [ ] Show track lyrics using Lyrics API

## Testing

To test the API integration:

1. Open the platform in a browser
2. Wait 1-2 seconds for API tracks to load
3. Check for "🌍 Trending Now" section
4. Click on track images to play 30-second previews
5. Add API tracks to favorites
6. Rate API tracks using the star system

## Troubleshooting

### API tracks not loading?
- Check browser console for errors
- Verify internet connection
- Check if CORS proxy is working
- Try alternative CORS proxy

### Preview playback not working?
- Check if Deezer preview URLs are accessible in your region
- Some tracks may not have previews available
- Check browser console for audio playback errors

## API Credits

This integration uses the **Deezer API**:
- Website: https://www.deezer.com
- API Documentation: https://developers.deezer.com/api
- Terms of Service: https://www.deezer.com/legal/cgu

---

**Note**: This is a free, public API integration for educational purposes. For production use, consider implementing proper authentication and obtaining necessary API keys.
