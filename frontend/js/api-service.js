(function(window) {
    'use strict';

    const API_CONFIG = {
        DEEZER_BASE_URL: 'https://api.deezer.com',
        CORS_PROXY: 'https://corsproxy.io/?',
        TIMEOUT: 10000
    };

    async function fetchTracksByGenre(genre, limit = 10) {
        try {
            const searchQuery = encodeURIComponent(genre);
            const url = `${API_CONFIG.CORS_PROXY}${API_CONFIG.DEEZER_BASE_URL}/search?q=${searchQuery}&limit=${limit}`;
            
            const response = await fetchWithTimeout(url, API_CONFIG.TIMEOUT);
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }
            
            const data = await response.json();
            return formatDeezerTracks(data.data || []);
        } catch (error) {
            console.error('Error fetching tracks by genre:', error);
            return [];
        }
    }

    async function searchTracks(query, limit = 20) {
        try {
            if (!query || query.trim() === '') {
                return [];
            }

            const searchQuery = encodeURIComponent(query.trim());
            const url = `${API_CONFIG.CORS_PROXY}${API_CONFIG.DEEZER_BASE_URL}/search?q=${searchQuery}&limit=${limit}`;
            
            const response = await fetchWithTimeout(url, API_CONFIG.TIMEOUT);
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }
            
            const data = await response.json();
            return formatDeezerTracks(data.data || []);
        } catch (error) {
            console.error('Error searching tracks:', error);
            return [];
        }
    }

    async function fetchTopCharts(limit = 15) {
        try {
            const url = `${API_CONFIG.CORS_PROXY}${API_CONFIG.DEEZER_BASE_URL}/chart/0/tracks?limit=${limit}`;
            
            const response = await fetchWithTimeout(url, API_CONFIG.TIMEOUT);
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }
            
            const data = await response.json();
            return formatDeezerTracks(data.data || []);
        } catch (error) {
            console.error('Error fetching top charts:', error);
            return [];
        }
    }

    async function fetchTracksByArtist(artistName, limit = 10) {
        try {
            const searchQuery = encodeURIComponent(artistName);
            const url = `${API_CONFIG.CORS_PROXY}${API_CONFIG.DEEZER_BASE_URL}/search/artist?q=${searchQuery}&limit=1`;
            
            const response = await fetchWithTimeout(url, API_CONFIG.TIMEOUT);
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.data && data.data.length > 0) {
                const artistId = data.data[0].id;
                const tracksUrl = `${API_CONFIG.CORS_PROXY}${API_CONFIG.DEEZER_BASE_URL}/artist/${artistId}/top?limit=${limit}`;
                
                const tracksResponse = await fetchWithTimeout(tracksUrl, API_CONFIG.TIMEOUT);
                const tracksData = await tracksResponse.json();
                
                return formatDeezerTracks(tracksData.data || []);
            }
            
            return [];
        } catch (error) {
            console.error('Error fetching tracks by artist:', error);
            return [];
        }
    }

    function formatDeezerTracks(tracks) {
        return tracks.map(track => ({
            id: `deezer_${track.id}`,
            title: track.title || 'Unknown Track',
            artist: track.artist?.name || 'Unknown Artist',
            album: track.album?.title || 'Unknown Album',
            img: track.album?.cover_big || track.album?.cover_medium || track.album?.cover || 'frontend/src/img/track1.jpeg',
            preview: track.preview || null,
            duration: track.duration || 0,
            genre: extractGenre(track),
            source: 'deezer',
            externalUrl: track.link || null
        }));
    }

    function extractGenre(track) {
        return 'Various';
    }

    function fetchWithTimeout(url, timeout) {
        return Promise.race([
            fetch(url),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), timeout)
            )
        ]);
    }

    async function getRecommendations(genres, limit = 5) {
        try {
            const promises = genres.map(genre => fetchTracksByGenre(genre, limit));
            const results = await Promise.all(promises);
            
            const allTracks = results.flat();
            return shuffleArray(allTracks).slice(0, limit * genres.length);
        } catch (error) {
            console.error('Error getting recommendations:', error);
            return [];
        }
    }

    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    async function checkAPIStatus() {
        try {
            const url = `${API_CONFIG.CORS_PROXY}${API_CONFIG.DEEZER_BASE_URL}/chart/0/tracks?limit=1`;
            const response = await fetchWithTimeout(url, 5000);
            return response.ok;
        } catch (error) {
            console.error('API is not available:', error);
            return false;
        }
    }

    window.MusicAPI = {
        fetchTracksByGenre,
        searchTracks,
        fetchTopCharts,
        fetchTracksByArtist,
        getRecommendations,
        checkAPIStatus
    };

})(window);
