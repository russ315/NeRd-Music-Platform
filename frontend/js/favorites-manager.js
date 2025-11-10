(function(window) {
    'use strict';

    function getCurrentUser() {
        try {
            const isAuth = localStorage.getItem('nerd_auth') === 'true';
            if (!isAuth) return null;
            
            const userData = localStorage.getItem('nerd_user');
            return userData ? JSON.parse(userData) : null;
        } catch (e) {
            return null;
        }
    }

    function getUserFavoritesKey() {
        const user = getCurrentUser();
        if (!user) return null;
        
        const userId = user.email || user.username || 'guest';
        return `nerd_favourites_${userId}`;
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
        const exists = favorites.some(fav => fav.id === item.id);
        
        if (!exists) {
            favorites.push(item);
            return writeUserFavorites(favorites);
        }
        
        return false;
    }

    function removeFromUserFavorites(itemId) {
        if (!isUserLoggedIn()) {
            return false;
        }

        const favorites = readUserFavorites();
        const filtered = favorites.filter(fav => fav.id !== itemId);
        
        if (filtered.length !== favorites.length) {
            return writeUserFavorites(filtered);
        }
        
        return false;
    }

    function isInUserFavorites(itemId) {
        if (!isUserLoggedIn()) {
            return false;
        }

        const favorites = readUserFavorites();
        return favorites.some(fav => fav.id === itemId);
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
            const oldFavorites = localStorage.getItem('nerd_favourites');
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
