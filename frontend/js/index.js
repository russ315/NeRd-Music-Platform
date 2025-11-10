document.addEventListener('DOMContentLoaded', () => {
    
    if (!window.currentAudio) {
        window.currentAudio = null;
    }
    
    function stopCurrent() {
        if (window.currentAudio) {
            window.currentAudio.pause();
            window.currentAudio.currentTime = 0;
            window.currentAudio = null;
        }
    }

    var ratingStorageKey = 'nerd_ratings';
    
    function readRatings() {
        try { 
            return JSON.parse(localStorage.getItem(ratingStorageKey) || '{}'); 
        } catch (e) { 
            return {}; 
        }
    }
    
    function writeRatings(ratings) {
        localStorage.setItem(ratingStorageKey, JSON.stringify(ratings));
    }
    
    function getRatingForItem(itemId) {
        var ratings = readRatings();
        return ratings[itemId] || 0;
    }
    
    function setRatingForItem(itemId, rating) {
        var ratings = readRatings();
        ratings[itemId] = rating;
        writeRatings(ratings);
    }
    
    function initializeStarRating(ratingContainer) {
        var itemId = ratingContainer.closest('.card').getAttribute('data-title');
        var currentRating = getRatingForItem(itemId);
        
        // Set initial rating
        updateStarDisplay(ratingContainer, currentRating);
        
        var stars = ratingContainer.querySelectorAll('.star');
        stars.forEach(function(star, index) {
            star.addEventListener('mouseenter', function() {
                highlightStars(ratingContainer, index + 1);
            });
            
            star.addEventListener('mouseleave', function() {
                updateStarDisplay(ratingContainer, currentRating);
            });
            
            star.addEventListener('click', function() {
                var newRating = index + 1;
                currentRating = newRating;
                setRatingForItem(itemId, newRating);
                updateStarDisplay(ratingContainer, newRating);
                
                ratingContainer.classList.add('rating-clicked');
                setTimeout(function() {
                    ratingContainer.classList.remove('rating-clicked');
                }, 400);
                
                ratingContainer.classList.add('pulsing');
                setTimeout(function() {
                    ratingContainer.classList.remove('pulsing');
                }, 700);
            });
        });
    }
    
    function highlightStars(ratingContainer, rating) {
        var stars = ratingContainer.querySelectorAll('.star');
        stars.forEach(function(star, index) {
            if (index < rating) {
                star.classList.add('hovered');
            } else {
                star.classList.remove('hovered');
            }
        });
    }
    
    function updateStarDisplay(ratingContainer, rating) {
        var stars = ratingContainer.querySelectorAll('.star');
        stars.forEach(function(star, index) {
            star.classList.remove('hovered', 'filled');
            if (index < rating) {
                star.classList.add('filled');
            }
        });
    }
    
    function attachStarRatingHandlers(scope) {
        var ratingContainers = (scope || document).querySelectorAll('.rating');
        ratingContainers.forEach(function(container) {
            if (!container._ratingInitialized) {
                container._ratingInitialized = true;
                initializeStarRating(container);
            }
        });
    }
   
    function addToFav(item) {
        // Check if FavoritesManager is available
        if (typeof window.FavoritesManager === 'undefined') {
            console.error('FavoritesManager not loaded');
            return false;
        }

        // Check if user is logged in
        if (!window.FavoritesManager.isUserLoggedIn()) {
            alert('Please login to add favorites');
            // Redirect to login page
            setTimeout(function() {
                window.location.href = 'frontend/html/login.html';
            }, 1000);
            return false;
        }

        // Add to user's favorites
        const success = window.FavoritesManager.addToUserFavorites(item);
        
        if (success && window.showNotification) {
            showNotification('Added to Favorites', item.title, 'success', 2000);
        }
        
        return success;
    }

    /**
     * Update favorite button state based on user's favorites
     */
    function updateFavoriteButton(btn) {
        if (typeof window.FavoritesManager === 'undefined') return;
        
        const itemId = btn.getAttribute('data-id');
        
        if (!window.FavoritesManager.isUserLoggedIn()) {
            // User not logged in - show login prompt
            btn.textContent = '🔒 Login to Favorite';
            btn.classList.add('btn-secondary');
            btn.classList.remove('btn-warning');
            return;
        }
        
        // Check if already in favorites
        if (window.FavoritesManager.isInUserFavorites(itemId)) {
            btn.textContent = '✓ In Favorites';
            btn.disabled = true;
            btn.classList.add('btn-success');
            btn.classList.remove('btn-warning');
        }
    }
    
    /**
     * Attach favorite button handlers
     */
    function attachFavoriteHandlers(scope) {
        var addButtons = (scope || document).querySelectorAll('.add-fav');
        addButtons.forEach(function (btn) {
            if (btn._favHandlerAttached) return;
            btn._favHandlerAttached = true;
            
            // Update initial button state
            updateFavoriteButton(btn);
            
            btn.addEventListener('click', function () {
                var id = btn.getAttribute('data-id');
                var title = btn.getAttribute('data-title');
                var img = btn.getAttribute('data-img');
                
                const success = addToFav({ id: id, title: title, img: img });
                
                if (success) {
                    btn.textContent = '✓ In Favorites';
                    btn.disabled = true;
                    btn.classList.add('btn-success');
                    btn.classList.remove('btn-warning');
                }
            });
        });
    }
    //#endregion
    
    //#region Search (Legacy - DISABLED to prevent conflicts with jQuery search)
    // This section is disabled to prevent conflicts with the new jQuery search system
    // The main search functionality is now handled by jQuery in search.js
    
    // var input = document.getElementById('searchInput');
    // var btn = document.getElementById('searchBtn');
    
    // function applySearch() {
    //     var q = (input.value || '').toLowerCase().trim();
    //     var cards = document.querySelectorAll('.card[data-title]');
    //     cards.forEach(function (card) {
    //         var title = card.getAttribute('data-title').toLowerCase();
    //         card.style.display = title.indexOf(q) !== -1 ? '' : 'none';
    //     });
    // }
    
    // Note: All search functionality is now handled by jQuery search system
    //#endregion
   
    //#region Internationalization (i18n)
    var translations = {
        en: {
            load_more: 'Load more',
            lang_toggle: 'RU',
            home: 'Home',
            favourites: 'Favourites',
            login: 'Login',
            signup: 'Sign Up',
            welcome_title: 'Welcome to NeRd!',
            welcome_sub: 'Your place for music',
            section_title: 'New Popular Music For You!',
            section_sub: 'Suggestions just for you based on your preferences.',
            search_placeholder: 'Search music'
        },
        ru: {
            load_more: 'Загрузить ещё',
            lang_toggle: 'EN',
            home: 'Главная',
            favourites: 'Избранное',
            login: 'Войти',
            signup: 'Регистрация',
            welcome_title: 'Добро пожаловать в NeRd!',
            welcome_sub: 'Твое место для музыки',
            section_title: 'Популярная музыка для тебя',
            section_sub: 'Рекомендации на основе твоих предпочтений.',
            search_placeholder: 'Поиск музыки'
        }
    };
    var lang = localStorage.getItem('nerd_lang') || 'en';
    
    function getDictByLang(code) {
        switch (code) {
            case 'ru':
                return translations.ru;
            case 'en':
            default:
                return translations.en;
        }
    }
    
    function applyI18n() {
        var dict = getDictByLang(lang);
        document.querySelectorAll('[data-i18n]').forEach(function(el){
            var k = el.getAttribute('data-i18n');
            if (dict[k]) el.textContent = dict[k];
        });
        var si = document.getElementById('searchInput');
        if (si && dict.search_placeholder) si.setAttribute('placeholder', dict.search_placeholder);
    }
    
    var langBtn = document.getElementById('langToggle');
    if (langBtn) {
        langBtn.addEventListener('click', function(){
            lang = lang === 'en' ? 'ru' : 'en';
            localStorage.setItem('nerd_lang', lang);
            applyI18n();
        });
    }
    //#endregion

    //#region Audio Playback
    function attachAudioHandlers(scope) {
        var imgsScoped = (scope || document).querySelectorAll('.card-img-top[data-audio]');
        imgsScoped.forEach(function (img) {
            img.style.cursor = 'pointer';
            img.addEventListener('click', function () {
                var src = img.getAttribute('data-audio');
                var card = img.closest('.card');
                if (window.currentAudio && window.currentAudio.src.includes(src)) {
                    stopCurrent();
                    if (card) card.classList.remove('playing');
                    return;
                }
                stopCurrent();
                window.currentAudio = new Audio(src);
                
                // Apply stored volume
                const storedVolume = localStorage.getItem('nerd_volume');
                if (storedVolume !== null) {
                    window.currentAudio.volume = parseFloat(storedVolume) / 100;
                } else {
                    window.currentAudio.volume = 0.7;
                }
                
                var playPromise = window.currentAudio.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function(){});
                }
                document.querySelectorAll('.card.playing').forEach(function(c){ c.classList.remove('playing'); });
                if (card) card.classList.add('playing');
                window.currentAudio.addEventListener('ended', function(){ 
                    if (card) card.classList.remove('playing');
                    
                    // Auto-play next track
                    if (window.playNextTrack) {
                        window.playNextTrack();
                    }
                });
                
                // Update player track info
                if (window.updatePlayerTrackInfo) {
                    window.updatePlayerTrackInfo(card);
                }
            });
        });
    }
    //#endregion

    //#region Page Rendering
    function renderMore(items) {
        var container = document.getElementById('moreContainer');
        if (!container) return;
        items.forEach(function(item){
            var col = document.createElement('div');
            col.className = 'col';
            col.innerHTML =
                  '<div class="card h-100 bg-dark border-secondary text-light" data-title="'+item.title+'">'
                + '<img src="'+item.img+'" class="card-img-top" data-audio="'+item.audio+'" alt="'+item.title+'">'
                + '<div class="card-body d-flex flex-column">'
                + '<p class="card-text mb-2">'+item.title+'</p>'
                + '<div class="rating mb-3" data-rating="0">'
                + '<span class="star" data-value="1">★</span>'
                + '<span class="star" data-value="2">★</span>'
                + '<span class="star" data-value="3">★</span>'
                + '<span class="star" data-value="4">★</span>'
                + '<span class="star" data-value="5">★</span>'
                + '</div>'
                + '<button class="btn btn-warning mt-auto add-fav" data-id="'+item.id+'" data-title="'+item.title+'" data-img="'+item.img+'">Add to Favourites</button>'
                + '</div></div>';
            container.appendChild(col);
        });
        
        // Attach handlers to the new content
        attachFavoriteHandlers(container);
        attachAudioHandlers(container);
        attachStarRatingHandlers(container);
    }
    //#endregion

    //#region Event Listeners
    
    // Nav Links Accessibility
    var navLinks = document.querySelectorAll('.navbar .nav-link');
    console.log(navLinks+"dsasad");
    navLinks.forEach(function(link, index){
        link.addEventListener('keydown', function(e){
            if (e.key === 'ArrowRight' || e.key === 'Right') {
                e.preventDefault();
                var next = navLinks[(index + 1) % navLinks.length];
                if (next) next.focus();
            } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
                e.preventDefault();
                var prev = navLinks[(index - 1 + navLinks.length) % navLinks.length];
                if (prev) prev.focus();
            }
        });
    });

    // Load More Button
    var loadBtn = document.getElementById('loadMore');
    if (loadBtn) {
        var loaded = false;
        loadBtn.addEventListener('click', function(){
            if (loaded) return;
            var url = './frontend/src/more-playlists.json?ts=' + Date.now();
            fetch(url, { cache: 'no-store' })
                .then(function(r){ if(!r.ok) throw new Error('status '+r.status); return r.json(); })
                .then(function(items){
                    if (!Array.isArray(items) || items.length === 0) throw new Error('empty');
                    renderMore(items);
                    loaded = true;
                    loadBtn.disabled = true;
                })
                .catch(function(err){
                    alert('Не удалось загрузить данные. Открой через локальный сервер или GitHub Pages.');
                    console.log('Load failed', err);
                });
        });
    }
    //#endregion

    
    //#region External API Integration
    /**
     * Load tracks from external API (Deezer)
     */
    async function loadExternalTracks() {
        // Check if MusicAPI is available
        if (typeof window.MusicAPI === 'undefined') {
            console.warn('MusicAPI not loaded, skipping external content');
            return;
        }

        try {
            // Show loading indicator
            showAPILoadingState();

            // Check API status first
            const isAPIAvailable = await window.MusicAPI.checkAPIStatus();
            
            if (!isAPIAvailable) {
                console.warn('External API is not available');
                hideAPILoadingState();
                return;
            }

            // Fetch top chart tracks
            const topTracks = await window.MusicAPI.fetchTopCharts(12);
            
            if (topTracks && topTracks.length > 0) {
                renderAPITracks(topTracks);
                hideAPILoadingState();
                
                // Show success notification
                if (window.showNotification) {
                    showNotification('API Connected', `Loaded ${topTracks.length} tracks from Deezer`, 'success', 3000);
                }
            } else {
                hideAPILoadingState();
            }
        } catch (error) {
            console.error('Error loading external tracks:', error);
            hideAPILoadingState();
            
            // Show error notification
            if (window.showNotification) {
                showNotification('API Error', 'Unable to load external content', 'error', 3000);
            }
        }
    }

    /**
     * Show loading state for API content
     */
    function showAPILoadingState() {
        const moreContainer = document.getElementById('moreContainer');
        if (!moreContainer) return;

        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'apiLoadingState';
        loadingDiv.className = 'col-12 text-center py-5';
        loadingDiv.innerHTML = `
            <div class="spinner-border text-warning" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3 text-secondary">Loading tracks from Deezer API...</p>
        `;
        moreContainer.appendChild(loadingDiv);
    }

    /**
     * Hide loading state
     */
    function hideAPILoadingState() {
        const loadingDiv = document.getElementById('apiLoadingState');
        if (loadingDiv) {
            loadingDiv.remove();
        }
    }

    /**
     * Render tracks from API
     */
    function renderAPITracks(tracks) {
        const container = document.getElementById('moreContainer');
        if (!container) return;

        // Add section header
        const headerDiv = document.createElement('div');
        headerDiv.className = 'col-12 mt-4 mb-2';
        headerDiv.innerHTML = `
            <h4 class="text-light">
                <span style="color: var(--accent);">🌍 Trending Now</span>
                <span class="badge bg-warning text-dark ms-2">Powered by Deezer API</span>
            </h4>
        `;
        container.appendChild(headerDiv);

        tracks.forEach(function(track) {
            const col = document.createElement('div');
            col.className = 'col';
            
            const previewAudio = track.preview || '';
            const artistInfo = track.artist ? `<small class="text-muted d-block">by ${track.artist}</small>` : '';
            
            col.innerHTML =
                '<div class="card h-100 bg-dark border-secondary text-light api-track-card" data-title="'+track.title+'">'
                + '<div class="position-relative">'
                + '<img src="'+track.img+'" class="card-img-top" '+(previewAudio ? 'data-audio="'+previewAudio+'"' : '')+' alt="'+track.title+'" loading="lazy">'
                + '<span class="badge bg-info position-absolute top-0 end-0 m-2">API</span>'
                + '</div>'
                + '<div class="card-body d-flex flex-column">'
                + '<p class="card-text mb-2">'+track.title+'</p>'
                + artistInfo
                + '<div class="rating mb-3" data-rating="0">'
                + '<span class="star" data-value="1">★</span>'
                + '<span class="star" data-value="2">★</span>'
                + '<span class="star" data-value="3">★</span>'
                + '<span class="star" data-value="4">★</span>'
                + '<span class="star" data-value="5">★</span>'
                + '</div>'
                + '<button class="btn btn-warning mt-auto add-fav" data-id="'+track.id+'" data-title="'+track.title+'" data-img="'+track.img+'">Add to Favourites</button>'
                + '</div></div>';
            
            container.appendChild(col);
        });

        // Attach handlers to API content
        attachFavoriteHandlers(container);
        attachAudioHandlers(container);
        attachStarRatingHandlers(container);
    }

    /**
     * Initialize API integration
     */
    function initializeAPIIntegration() {
        // Load external tracks after a short delay to not block initial page load
        setTimeout(function() {
            loadExternalTracks();
        }, 1000);
    }
    //#endregion

    
    applyI18n();
    attachStarRatingHandlers(document);
    attachAudioHandlers(document);
    attachFavoriteHandlers(document);
    
    // Initialize API integration
    initializeAPIIntegration();

});