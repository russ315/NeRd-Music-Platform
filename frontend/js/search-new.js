$(document).ready(function() {
    const searchConfig = {
        minSearchLength: 2,
        maxSuggestions: 8,
        debounceDelay: 300,
        highlightClass: 'search-highlight'
    };

    // Initialize search system when document is ready
    initializeSearchSystem();

    function initializeSearchSystem() {
        console.log('Initializing search system...');
        
        // Initialize search input handling
        const $searchInput = $('#searchInput');
        
        // Debounce search to avoid too many requests
        const debouncedSearch = debounce(function(searchTerm) {
            performSearch(searchTerm);
        }, searchConfig.debounceDelay);

        // Handle search input
        $searchInput.on('keyup', function() {
            const searchTerm = $(this).val().toLowerCase().trim();
            
            if (searchTerm.length >= searchConfig.minSearchLength) {
                debouncedSearch(searchTerm);
            } else if (searchTerm.length === 0) {
                // Clear search results
                clearSearchResults();
            }
        });

        // Handle search button click
        $('#searchBtn').on('click', function() {
            const searchTerm = $searchInput.val().toLowerCase().trim();
            if (searchTerm.length >= searchConfig.minSearchLength) {
                performSearch(searchTerm);
            }
        });

        // Handle Enter key in search input
        $searchInput.on('keypress', function(e) {
            if (e.which === 13) { // Enter key
                e.preventDefault();
                const searchTerm = $(this).val().toLowerCase().trim();
                if (searchTerm.length >= searchConfig.minSearchLength) {
                    performSearch(searchTerm);
                }
            }
        });
    }

    function performSearch(searchTerm) {
        console.log('Performing search for:', searchTerm);
        
        // Clear previous results
        clearSearchResults();
        
        // Search local tracks
        searchLocalTracks(searchTerm);
        
        // Search API tracks if available
        if (window.APITracks && window.APITracks.length > 0) {
            searchApiTracks(searchTerm);
        } else {
            console.log('No API tracks available for search');
        }
    }

    function searchLocalTracks(searchTerm) {
        const $musicCards = $('.card[data-title]');
        let hasResults = false;
        
        if ($musicCards.length === 0) {
            console.log('No local tracks found to search');
            return;
        }
        
        console.log(`Searching ${$musicCards.length} local tracks...`);
        
        $musicCards.each(function() {
            const $card = $(this);
            const title = ($card.attr('data-title') || '').toLowerCase();
            const artist = ($card.attr('data-artist') || '').toLowerCase();
            const cardText = $card.text().toLowerCase();
            
            if (title.includes(searchTerm) || 
                artist.includes(searchTerm) || 
                cardText.includes(searchTerm)) {
                
                // Show matching cards
                $card.show().addClass('search-match');
                hasResults = true;
            } else {
                // Hide non-matching cards
                $card.hide().removeClass('search-match');
            }
        });
        
        console.log('Local search complete. Matches found:', hasResults);
    }

    function searchApiTracks(searchTerm) {
        if (!window.APITracks || !Array.isArray(window.APITracks)) {
            console.log('No API tracks available');
            return;
        }
        
        console.log(`Searching ${window.APITracks.length} API tracks...`);
        
        const matchingTracks = window.APITracks.filter(track => {
            if (!track) return false;
            
            const title = (track.title || '').toLowerCase();
            const artist = (track.artist?.name || '').toLowerCase();
            const album = (track.album?.title || '').toLowerCase();
            
            return title.includes(searchTerm) || 
                   artist.includes(searchTerm) || 
                   album.includes(searchTerm);
        });
        
        console.log(`Found ${matchingTracks.length} matching API tracks`);
        
        // Display matching API tracks
        displayApiTracks(matchingTracks);
    }

    function displayApiTracks(tracks) {
        if (!tracks || tracks.length === 0) {
            console.log('No API tracks to display');
            return;
        }
        
        console.log(`Displaying ${tracks.length} API tracks`);
        
        const $resultsContainer = $('#apiSearchResults');
        
        // Create results container if it doesn't exist
        if ($resultsContainer.length === 0) {
            $('main').append('<div id="apiSearchResults" class="row mt-4"></div>');
        } else {
            $resultsContainer.empty();
        }
        
        // Add each matching track
        tracks.forEach(track => {
            const $trackCard = createTrackCard(track);
            $('#apiSearchResults').append($trackCard);
        });
    }

    function createTrackCard(track) {
        if (!track) return $();
        
        const artistName = track.artist?.name || 'Unknown Artist';
        const albumTitle = track.album?.title || 'Unknown Album';
        const coverUrl = track.album?.cover_medium || 'frontend/src/img/default-cover.png';
        const previewUrl = track.preview || '';
        const trackTitle = track.title_short || track.title || 'Unknown Track';
        
        const $card = $(`
            <div class="col-md-3 mb-4">
                <div class="card api-track-card" data-id="${track.id}" data-title="${trackTitle}" data-artist="${artistName}">
                    <img src="${coverUrl}" 
                         class="card-img-top" 
                         alt="${trackTitle}"
                         data-audio="${previewUrl}">
                    <div class="card-body">
                        <h5 class="card-title">${trackTitle}</h5>
                        <p class="card-text">${artistName}</p>
                        <p class="card-text"><small class="text-muted">${albumTitle}</small></p>
                        <button class="btn btn-sm btn-warning add-fav" 
                                data-id="${track.id}" 
                                data-title="${trackTitle}" 
                                data-img="${coverUrl}">
                            Add to Favorites
                        </button>
                    </div>
                </div>
            </div>
        `);
        
        // Initialize event handlers
        initializeCardEventHandlers($card.find('.api-track-card'));
        
        return $card;
    }

    function initializeCardEventHandlers($card) {
        // Handle audio playback
        $card.find('.card-img-top').on('click', function() {
            const src = $(this).data('audio');
            if (!src) return;
            
            if (window.currentAudio && window.currentAudio.src.includes(src)) {
                if (window.currentAudio.paused) {
                    window.currentAudio.play();
                    $card.addClass('playing');
                } else {
                    window.currentAudio.pause();
                    $card.removeClass('playing');
                }
                return;
            }
            
            if (window.currentAudio) {
                window.currentAudio.pause();
                window.currentAudio.currentTime = 0;
                $('.card.playing').removeClass('playing');
            }
            
            window.currentAudio = new Audio(src);
            const storedVolume = localStorage.getItem('nerd_volume');
            window.currentAudio.volume = storedVolume ? parseFloat(storedVolume) / 100 : 0.7;
            
            window.currentAudio.play();
            $card.addClass('playing');
            
            window.currentAudio.onended = function() {
                $card.removeClass('playing');
                if (window.playNextTrack) {
                    window.playNextTrack();
                }
            };
            
            if (window.updatePlayerTrackInfo) {
                window.updatePlayerTrackInfo($card[0]);
            }
        });
        
        // Handle favorite button
        $card.find('.add-fav').on('click', function(e) {
            e.stopPropagation();
            const $btn = $(this);
            const id = $btn.data('id');
            const title = $btn.data('title');
            const img = $btn.data('img');
            
            if (typeof window.addToFav === 'function') {
                const success = window.addToFav({ id, title, img });
                if (success) {
                    $btn.text('✓ In Favorites').addClass('btn-success').removeClass('btn-warning');
                }
            }
        });
    }

    function clearSearchResults() {
        // Show all local tracks
        $('.card[data-title]').show().removeClass('search-match');
        
        // Clear API search results
        $('#apiSearchResults').remove();
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Listen for API tracks loaded event
    $(document).on('apiTracksLoaded', function(event, tracks) {
        console.log('API tracks loaded for search:', tracks ? tracks.length : 0);
        window.APITracks = tracks || [];
    });

    console.log('Search system initialized');
});
