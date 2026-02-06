(function(window) {
    'use strict';

    function getCurrentUser() {
        try {
            const isAuth = localStorage.getItem('NeRuaD_auth') === 'true';
            if (!isAuth) return null;
            
            const userData = localStorage.getItem('NeRuaD_user');
            return userData ? JSON.parse(userData) : null;
        } catch (e) {
            return null;
        }
    }

    function getToken() {
        return localStorage.getItem('NeRuaD_token');
    }

    function getUserFavoritesKey() {
        const user = getCurrentUser();
        if (!user) return null;
        
        const userId = user.email || user.username || 'guest';
        return `NeRuaD_favourites_${userId}`;
    }

    function isUserLoggedIn() {
        return getCurrentUser() !== null;
    }

    function readUserFavorites() {
        if (!isUserLoggedIn()) {
            return [];
        }

        try {
            const key = getUserFavoritesKey();
            if (!key) return [];
            
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error reading favorites:', e);
            return [];
        }
    }

    async function pushFavoritesToApi(list) {
        for (const fav of list) {
            const payload = {
                externalId: fav.externalId || fav.id,
                title: fav.title,
                artist: fav.artist || 'Various Artists',
                album: fav.album || '',
                img: fav.img || '',
                previewUrl: fav.audio || '',
                duration: fav.duration || 0,
                genre: fav.genre || '',
                source: fav.source || 'local',
                externalUrl: fav.externalUrl || ''
            };
            try {
                const track = await ApiClient.request('/tracks', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
                await ApiClient.request('/favorites', {
                    method: 'POST',
                    body: JSON.stringify({ trackId: track._id || track.id })
                });
            } catch (e) {
                console.warn('Failed to push favorite to API', e.message);
            }
        }
    }

    async function syncFavoritesFromApi() {
        if (!getToken() || typeof ApiClient === 'undefined') return;
        try {
            const localBefore = readUserFavorites();
            const data = await ApiClient.request('/favorites', { method: 'GET' });
            if (!data.length && localBefore.length) {
                await pushFavoritesToApi(localBefore);
                return;
            }
            const mapped = data.map(function(item) {
                const track = item.trackId || {};
                return {
                    id: track._id || item.trackId,
                    externalId: track.externalId,
                    title: track.title,
                    img: track.img || '',
                    audio: track.previewUrl || '',
                    duration: track.duration || 0,
                    source: track.source || 'local'
                };
            });
            writeUserFavorites(mapped);
        } catch (e) {
            console.warn('Failed to sync favorites from API', e.message);
        }
    }

    function writeUserFavorites(favorites) {
        if (!isUserLoggedIn()) {
            return false;
        }

        try {
            const key = getUserFavoritesKey();
            if (!key) return false;
            
            localStorage.setItem(key, JSON.stringify(favorites));
            return true;
        } catch (e) {
            console.error('Error writing favorites:', e);
            return false;
        }
    }

    function matchesFavorite(fav, itemId) {
        return fav.id === itemId || fav.externalId === itemId;
    }

    function addToUserFavorites(item) {
        if (!isUserLoggedIn()) {
            alert('Please login to add favorites');
            return false;
        }

        if (!item || !item.id) {
            console.error('Invalid item');
            return false;
        }

        const favorites = readUserFavorites();
        const exists = favorites.some(fav => matchesFavorite(fav, item.id));
        
        if (!exists) {
            const storedItem = {
                ...item,
                externalId: item.externalId || item.id
            };
            favorites.push(storedItem);
            writeUserFavorites(favorites);

            if (getToken() && typeof ApiClient !== 'undefined') {
                (async function() {
                    try {
                        const payload = {
                            externalId: storedItem.externalId,
                            title: storedItem.title,
                            artist: storedItem.artist || 'Various Artists',
                            album: storedItem.album || '',
                            img: storedItem.img || '',
                            previewUrl: storedItem.audio || '',
                            duration: storedItem.duration || 0,
                            genre: storedItem.genre || '',
                            source: storedItem.source || 'local',
                            externalUrl: storedItem.externalUrl || ''
                        };
                        const track = await ApiClient.request('/tracks', {
                            method: 'POST',
                            body: JSON.stringify(payload)
                        });
                        await ApiClient.request('/favorites', {
                            method: 'POST',
                            body: JSON.stringify({ trackId: track._id || track.id })
                        });

                        const refreshed = readUserFavorites().map(function(fav) {
                            if (fav.externalId === storedItem.externalId) {
                                return { ...fav, id: track._id || track.id };
                            }
                            return fav;
                        });
                        writeUserFavorites(refreshed);
                    } catch (e) {
                        console.warn('Failed to sync favorite to API', e.message);
                    }
                })();
            }

            return true;
        }
        
        return false;
    }

    function removeFromUserFavorites(itemId) {
        if (!isUserLoggedIn()) {
            return false;
        }

        const favorites = readUserFavorites();
        const target = favorites.find(fav => matchesFavorite(fav, itemId));
        const filtered = favorites.filter(fav => !matchesFavorite(fav, itemId));
        
        if (filtered.length !== favorites.length) {
            writeUserFavorites(filtered);

            if (getToken() && typeof ApiClient !== 'undefined' && target && target.id) {
                (async function() {
                    try {
                        await ApiClient.request(`/favorites/${target.id}`, { method: 'DELETE' });
                    } catch (e) {
                        console.warn('Failed to remove favorite from API', e.message);
                    }
                })();
            }

            return true;
        }
        
        return false;
    }

    function isInUserFavorites(itemId) {
        if (!isUserLoggedIn()) {
            return false;
        }

        const favorites = readUserFavorites();
        return favorites.some(fav => matchesFavorite(fav, itemId));
    }

    function getUserFavoritesCount() {
        if (!isUserLoggedIn()) {
            return 0;
        }

        return readUserFavorites().length;
    }

    function clearUserFavorites() {
        if (!isUserLoggedIn()) {
            return false;
        }

        return writeUserFavorites([]);
    }

    function migrateOldFavorites() {
        if (!isUserLoggedIn()) {
            return;
        }

        try {
            const oldFavorites = localStorage.getItem('NeRuaD_favourites');
            if (!oldFavorites) return;

            const userFavoritesKey = getUserFavoritesKey();
            if (!userFavoritesKey) return;
            
            const userFavorites = localStorage.getItem(userFavoritesKey);
            
            if (!userFavorites) {
                localStorage.setItem(userFavoritesKey, oldFavorites);
            }
        } catch (e) {
            console.error('Error migrating favorites:', e);
        }
    }

    function init() {
        if (isUserLoggedIn()) {
            migrateOldFavorites();
            syncFavoritesFromApi();
        }
    }

    window.FavoritesManager = {
        isUserLoggedIn,
        readUserFavorites,
        writeUserFavorites,
        addToUserFavorites,
        removeFromUserFavorites,
        isInUserFavorites,
        getUserFavoritesCount,
        clearUserFavorites,
        getCurrentUser
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})(window);
