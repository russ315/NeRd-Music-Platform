$(document).ready(function() {


    const searchConfig = {
        minSearchLength: 2,
        maxSuggestions: 8,
        debounceDelay: 300,
        highlightClass: 'search-highlight'
    };

    const musicData = [
        { title: 'Daily Mix 1', genre: 'Pop', artist: 'Various Artists' },
        { title: 'Daily Mix 2', genre: 'Rock', artist: 'Various Artists' },
        { title: 'Daily Mix 3', genre: 'Electronic', artist: 'Various Artists' },
        { title: 'Chill Vibes', genre: 'Chill', artist: 'Ambient Collective' },
        { title: 'Rock Anthems', genre: 'Rock', artist: 'Rock Legends' },
        { title: 'Electronic Dreams', genre: 'Electronic', artist: 'Synth Masters' },
        { title: 'Jazz Lounge', genre: 'Jazz', artist: 'Jazz Ensemble' },
        { title: 'Hip Hop Flow', genre: 'Hip Hop', artist: 'Urban Beats' },
        { title: 'Classical Symphony', genre: 'Classical', artist: 'Orchestra' },
        { title: 'Indie Vibes', genre: 'Indie', artist: 'Indie Collective' },
        { title: 'Lo-Fi Beats', genre: 'Lo-Fi', artist: 'Chill Beats' }
    ];

    const faqData = [
        { question: 'How do I create a playlist?', answer: 'To create a playlist, navigate to the My Playlists section and click the New Playlist button.' },
        { question: 'Can I use this platform offline?', answer: 'Offline listening is a premium feature. Subscribers can download their favorite tracks.' },
        { question: 'How is my data protected?', answer: 'We take your privacy seriously. All user data is encrypted and stored securely.' }
    ];

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


    function initializeRealTimeSearch() {
        const $searchInput = $('#searchInput');

        const debouncedSearch = debounce(function(searchTerm) {
            const $musicCards = $('.card[data-title]');
            performRealTimeFilter(searchTerm, $musicCards);
        }, searchConfig.debounceDelay);

        $searchInput.on('keyup', function() {
            const searchTerm = $(this).val().toLowerCase().trim();

            if (searchTerm.length >= searchConfig.minSearchLength) {
                debouncedSearch(searchTerm);
            } else if (searchTerm.length === 0) {
                showCarousel();
                hideSearchResults();
                const $musicCards = $('.card[data-title]');
                $musicCards.show().removeClass('search-filtered');
                clearSearchHighlighting();
                $('#no-results-message').remove();
            } else {
                showCarousel();
                hideSearchResults();
                clearSearchHighlighting();
                $('#no-results-message').remove();
            }
        });

        $('#searchBtn').on('click', function() {
            const searchTerm = $searchInput.val().toLowerCase().trim();
            if (searchTerm.length >= searchConfig.minSearchLength) {
                const $musicCards = $('.card[data-title]');
                performRealTimeFilter(searchTerm, $musicCards);
            }
        });

        $searchInput.on('keypress', function(e) {
            if (e.which === 13) {
                e.preventDefault();
                const searchTerm = $(this).val().toLowerCase().trim();
                if (searchTerm.length >= searchConfig.minSearchLength) {
                    const $musicCards = $('.card[data-title]');
                    performRealTimeFilter(searchTerm, $musicCards);
                }
            }
        });
    }

    function performRealTimeFilter(searchTerm, $musicCards) {
        let hasResults = false;
        const matchingCards = [];

        clearSearchHighlighting();

        // First check local cards
        if ($musicCards && $musicCards.length > 0) {
            console.log('Found ' + $musicCards.length + ' local cards, searching for: "' + searchTerm + '"');
            
            const seenTitles = new Set();
            $musicCards.each(function() {
                const $card = $(this);
                const titleAttr = $card.attr('data-title');

                if (!titleAttr) {
                    return;
                }

                if (seenTitles.has(titleAttr)) {
                    return;
                }

                const title = titleAttr.toLowerCase();
                const cardText = $card.text().toLowerCase();
                const artist = $card.attr('data-artist') || '';

                if (title.includes(searchTerm) || 
                    cardText.includes(searchTerm) || 
                    artist.toLowerCase().includes(searchTerm)) {
                    console.log('Local match found: ' + titleAttr);
                    matchingCards.push($card);
                    seenTitles.add(titleAttr);
                    hasResults = true;
                }
            });
        }

        // Then check API tracks if they exist
        if (window.APITracks && window.APITracks.length > 0) {
            console.log('Found ' + window.APITracks.length + ' API tracks to search');
            
            const seenApiTitles = new Set();
            window.APITracks.forEach(track => {
                if (!track) return;
                
                const title = track.title ? track.title.toLowerCase() : '';
                const artist = track.artist ? track.artist.name.toLowerCase() : '';
                const album = track.album ? track.album.title.toLowerCase() : '';
                
                if (title.includes(searchTerm) || 
                    artist.includes(searchTerm) || 
                    album.includes(searchTerm)) {
                    
                    if (!seenApiTitles.has(track.id)) {
                        console.log('API match found: ' + track.title);
                        const $card = createApiTrackCard(track);
                        if ($card) {
                            matchingCards.push($card);
                            seenApiTitles.add(track.id);
                            hasResults = true;
                        }
                    }
                }
            });
        }

        console.log('Total unique matches: ' + matchingCards.length);

        if (searchTerm.length === 0) {
            showCarousel();
            hideSearchResults();
            $('#no-results-message').remove();
        } else if (hasResults && searchTerm.length >= searchConfig.minSearchLength) {
            displaySearchResults(matchingCards, searchTerm);
            hideCarousel();
            $('#no-results-message').remove();
        } else if (searchTerm.length >= searchConfig.minSearchLength) {
            hideCarousel();
            hideSearchResults();
            showNoResultsMessage(hasResults, searchTerm);
        }

        if (hasResults) {
            setTimeout(() => {
                highlightSearchTerms(searchTerm);
            }, 100);
        }
    }

    function hideCarousel() {
        $('#carouselContainer').hide();
        const $loadMoreContainer = $('#loadMore').closest('.text-center');
        if ($loadMoreContainer.length) {
            $loadMoreContainer.hide();
        }
    }

    function showCarousel() {
        $('#carouselContainer').show();
        const $loadMoreContainer = $('#loadMore').closest('.text-center');
        if ($loadMoreContainer.length) {
            $loadMoreContainer.show();
        }
    }

    function displaySearchResults(matchingCards, searchTerm) {
        const $resultsContainer = $('#searchResultsContainer');
        const $results = $('#searchResults');

        $results.empty();

        if (!matchingCards || matchingCards.length === 0) {
            console.log('No matching cards to display');
            return;
        }

        console.log('Displaying ' + matchingCards.length + ' search results');

        matchingCards.forEach(function($originalCard) {
            if (!$originalCard || $originalCard.length === 0) {
                console.log('Invalid card, skipping');
                return;
            }

            const $clonedCard = $originalCard.clone(false);

            if ($clonedCard.length === 0) {
                console.log('Failed to clone card');
                return;
            }

            $clonedCard.find('.rating').each(function() {
                const ratingContainer = this;
                $(ratingContainer).find('.star').off();
            });

            $clonedCard.find('.add-fav').off('click');

            const $col = $('<div class="col"></div>');
            $col.append($clonedCard);
            $results.append($col);
        });

        if ($results.children().length === 0) {
            console.log('No cards were added to results');
            return;
        }

        $resultsContainer.show();

        setTimeout(() => {
            attachSearchResultHandlers($results);
            highlightSearchTerms(searchTerm);
        }, 50);
    }

    function hideSearchResults() {
        $('#searchResultsContainer').hide();
        $('#searchResults').empty();
    }

    function attachSearchResultHandlers($scope) {
        const $addButtons = $scope.find('.add-fav');
        $addButtons.off('click').on('click', function() {
            const $btn = $(this);
            const id = $btn.attr('data-id');
            const title = $btn.attr('data-title');
            const img = $btn.attr('data-img');

            if (typeof addToFav === 'function') {
                addToFav({ id: id, title: title, img: img });
            } else {
                let favs = [];
                try {
                    favs = JSON.parse(localStorage.getItem('nerd_favourites') || '[]');
                } catch(e) {}

                const exists = favs.some(x => x.id === id);
                if (!exists) {
                    favs.push({ id: id, title: title, img: img });
                    localStorage.setItem('nerd_favourites', JSON.stringify(favs));
                }
            }

            $btn.text('Added').prop('disabled', true);
        });

        if (typeof attachAudioHandlers === 'function') {
            attachAudioHandlers($scope[0]);
        }

        if (typeof attachStarRatingHandlers === 'function') {
            attachStarRatingHandlers($scope[0]);
        }
    }

    function showNoResultsMessage(hasResults, searchTerm) {
        let $noResults = $('#no-results-message');

        if (!hasResults && searchTerm.length >= searchConfig.minSearchLength) {
            if ($noResults.length === 0) {
                $noResults = $('<div id="no-results-message" class="no-results-message">' +
                    '<h4>No results found for "' + searchTerm + '"</h4>' +
                    '<p>Try searching with different keywords or check your spelling.</p>' +
                    '</div>');
                $('.music-icons').append($noResults);
            }
        } else {
            $noResults.remove();
        }
    }


    function initializeAutocomplete() {
        const $searchInput = $('#searchInput');
        const $suggestions = $('#searchSuggestions');

        const debouncedAutocomplete = debounce(function(searchTerm) {
            showAutocompleteSuggestions(searchTerm, $suggestions);
        }, searchConfig.debounceDelay);

        $searchInput.on('keyup', function() {
            const searchTerm = $(this).val().toLowerCase().trim();

            if (searchTerm.length >= searchConfig.minSearchLength) {
                debouncedAutocomplete(searchTerm);
            } else {
                $suggestions.hide().empty();
            }
        });

        $(document).on('click', function(e) {
            if (!$(e.target).closest('.search-container').length) {
                $suggestions.hide();
            }
        });

        $suggestions.on('click', '.suggestion-item', function() {
            const $item = $(this);
            const suggestionText = $item.data('title') || $item.text();
            $searchInput.val(suggestionText);
            $suggestions.hide();

            performRealTimeFilter(suggestionText.toLowerCase(), $('.card[data-title]'));
        });
    }

    function showAutocompleteSuggestions(searchTerm, $suggestions) {
        const suggestions = musicData.filter(item =>
            item.title.toLowerCase().includes(searchTerm) ||
            item.genre.toLowerCase().includes(searchTerm) ||
            item.artist.toLowerCase().includes(searchTerm)
        ).slice(0, searchConfig.maxSuggestions);

        if (suggestions.length > 0) {
            let suggestionsHtml = '';
            suggestions.forEach(item => {
                const highlightedTitle = highlightText(item.title, searchTerm);
                const highlightedGenre = highlightText(item.genre, searchTerm);
                suggestionsHtml += `
                    <div class="suggestion-item" data-title="${item.title}">
                        <div class="suggestion-title">${highlightedTitle}</div>
                        <div class="suggestion-meta">${highlightedGenre} • ${item.artist}</div>
                    </div>
                `;
            });

            $suggestions.html(suggestionsHtml).show();
        } else {
            $suggestions.hide().empty();
        }
    }


    function initializeSearchHighlighting() {
        const $searchInput = $('#searchInput');

        $searchInput.on('keyup', function() {
            const searchTerm = $(this).val().toLowerCase().trim();

            if (searchTerm.length >= searchConfig.minSearchLength) {
                highlightSearchTerms(searchTerm);
            } else {
                clearSearchHighlighting();
            }
        });
    }

    function highlightSearchTerms(searchTerm) {
        clearSearchHighlighting();

        if (searchTerm.length < searchConfig.minSearchLength) return;


        $('#searchResults .card-text').each(function() {
            const $element = $(this);
            highlightTextInElement($element, searchTerm);
        });


        $('.card[data-title].search-filtered .card-text').each(function() {
            const $element = $(this);
            highlightTextInElement($element, searchTerm);
        });


        $('.accordion-content p').each(function() {
            const $element = $(this);
            highlightTextInElement($element, searchTerm);
        });


        $('.accordion-header').each(function() {
            const $element = $(this);
            highlightTextInElement($element, searchTerm);
        });
    }

    function highlightTextInElement($element, searchTerm) {
        if ($element.find(`.${searchConfig.highlightClass}`).length > 0) {
            return;
        }

        const text = $element.text();
        const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');

        if (regex.test(text)) {
            const highlightedText = text.replace(regex, `<span class="${searchConfig.highlightClass}">$1</span>`);
            $element.html(highlightedText);
        }
    }

    function highlightText(text, searchTerm) {
        const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
        return text.replace(regex, `<span class="${searchConfig.highlightClass}">$1</span>`);
    }

    function clearSearchHighlighting() {
        $(`.${searchConfig.highlightClass}`).each(function() {
            $(this).replaceWith($(this).text());
        });


        $('.card[data-title]').each(function() {
            const $card = $(this);
            if ($card.hasClass('search-filtered')) {
                $card.show();
            }
        });
    }

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function initializeAdvancedSearch() {
        $('.genre-filter').on('click', function() {
            const genre = $(this).data('genre');
            $('#searchInput').val(genre);
            performRealTimeFilter(genre.toLowerCase(), $('.card[data-title]'));
        });

        const searchHistory = JSON.parse(localStorage.getItem('nerd_search_history') || '[]');

        $('#searchInput').on('keypress', function(e) {
            if (e.which === 13) {
                const searchTerm = $(this).val().trim();
                if (searchTerm && !searchHistory.includes(searchTerm)) {
                    searchHistory.unshift(searchTerm);
                    if (searchHistory.length > 10) {
                        searchHistory.pop();
                    }
                    localStorage.setItem('nerd_search_history', JSON.stringify(searchHistory));
                }
            }
        });

        $('#searchInput').on('focus', function() {
            if (searchHistory.length > 0) {
                showSearchHistory(searchHistory);
            }
        });
    }

    function showSearchHistory(history) {
        const $suggestions = $('#searchSuggestions');
        let historyHtml = '<div class="suggestion-section"><div class="suggestion-header">Recent Searches</div>';

        history.slice(0, 5).forEach(term => {
            historyHtml += `<div class="suggestion-item history-item" data-title="${term}">${term}</div>`;
        });

        historyHtml += '</div>';
        $suggestions.html(historyHtml).show();
    }

    function initializeSearchSystem() {
        console.log('Initializing jQuery Search System...');

        const $searchInput = $('#searchInput');
        const $musicCards = $('.card[data-title]');

        if ($searchInput.length === 0) {
            console.error('Search input not found!');
            return;
        }

        if ($musicCards.length === 0) {
            console.error('No music cards found!');
            return;
        }

        console.log(`Found ${$musicCards.length} music cards`);

        initializeRealTimeSearch();
        initializeAutocomplete();
        initializeSearchHighlighting();
});
}

function highlightSearchTerms(searchTerm) {
clearSearchHighlighting();

if (searchTerm.length < searchConfig.minSearchLength) return;

$('#searchResults .card-text').each(function() {
    const $element = $(this);
    highlightTextInElement($element, searchTerm);
});

$('.card[data-title].search-filtered .card-text').each(function() {
    const $element = $(this);
    highlightTextInElement($element, searchTerm);
});

$('.accordion-content p').each(function() {
    const $element = $(this);
    highlightTextInElement($element, searchTerm);
});

$('.accordion-header').each(function() {
    const $element = $(this);
    highlightTextInElement($element, searchTerm);
});
}

function highlightTextInElement($element, searchTerm) {
if ($element.find(`.${searchConfig.highlightClass}`).length > 0) {
    return;
}

const text = $element.text();
const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');

if (regex.test(text)) {
    const highlightedText = text.replace(regex, `<span class="${searchConfig.highlightClass}">$1</span>`);
    $element.html(highlightedText);
}
}

function highlightText(text, searchTerm) {
const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
return text.replace(regex, `<span class="${searchConfig.highlightClass}">$1</span>`);
}

function clearSearchHighlighting() {
$(`.${searchConfig.highlightClass}`).each(function() {
    $(this).replaceWith($(this).text());
});

$('.card[data-title]').each(function() {
    const $card = $(this);
    if ($card.hasClass('search-filtered')) {
        $card.show();
    }
});
}

function escapeRegExp(string) {
return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function initializeAdvancedSearch() {
$('.genre-filter').on('click', function() {
    const genre = $(this).data('genre');
    $('#searchInput').val(genre);
    performRealTimeFilter(genre.toLowerCase(), $('.card[data-title]'));
});

const searchHistory = JSON.parse(localStorage.getItem('nerd_search_history') || '[]');

$('#searchInput').on('keypress', function(e) {
    if (e.which === 13) {
        const searchTerm = $(this).val().trim();
        if (searchTerm && !searchHistory.includes(searchTerm)) {
            searchHistory.unshift(searchTerm);
            if (searchHistory.length > 10) {
                searchHistory.pop();
            }
            localStorage.setItem('nerd_search_history', JSON.stringify(searchHistory));
        }
    }
});

$('#searchInput').on('focus', function() {
    if (searchHistory.length > 0) {
        showSearchHistory(searchHistory);
    }
});
}

function showSearchHistory(history) {
const $suggestions = $('#searchSuggestions');
let historyHtml = '<div class="suggestion-section"><div class="suggestion-header">Recent Searches</div>';

history.slice(0, 5).forEach(term => {
    historyHtml += `<div class="suggestion-item history-item" data-title="${term}">${term}</div>`;
});

historyHtml += '</div>';
$suggestions.html(historyHtml).show();
}

function initializeSearchSystem() {
console.log('Initializing jQuery Search System...');

const $searchInput = $('#searchInput');
const $musicCards = $('.card[data-title]');

if ($searchInput.length === 0) {
    console.error('Search input not found!');
    return;
}

if ($musicCards.length === 0) {
    console.error('No music cards found!');
    return;
}

console.log(`Found ${$musicCards.length} music cards`);

initializeRealTimeSearch();
initializeAutocomplete();
initializeSearchHighlighting();
initializeAdvancedSearch();

console.log('jQuery Search System initialized successfully!');
}

function createApiTrackCard(track) {
if (!track) return null;

const artistName = track.artist?.name || 'Unknown Artist';
const albumTitle = track.album?.title || 'Unknown Album';
const coverUrl = track.album?.cover_medium || 'frontend/src/img/default-cover.png';
const previewUrl = track.preview || '';

const $card = $(`
    <div class="card api-track-card" data-id="${track.id}" data-title="${track.title}" data-artist="${artistName}">
        <img src="${coverUrl}" 
             class="card-img-top" 
             alt="${track.title}"
             data-audio="${previewUrl}">
        <div class="card-body">
            <h5 class="card-title">${track.title_short || track.title || 'Unknown Track'}</h5>
            <p class="card-text">${artistName}</p>
            <p class="card-text"><small class="text-muted">${albumTitle}</small></p>
            <button class="btn btn-sm btn-warning add-fav" 
                    data-id="${track.id}" 
                    data-title="${track.title}" 
                    data-img="${coverUrl}">
                Add to Favorites
            </button>
        </div>
    </div>
`);

// Initialize event handlers for the new card
initializeCardEventHandlers($card);

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

// Store API tracks when they are loaded
$(document).on('apiTracksLoaded', function(event, tracks) {
window.APITracks = tracks || [];
console.log('API tracks loaded for search:', window.APITracks.length);
});

// Initialize the search system
initializeSearchSystem();

// Set up a mutation observer to handle dynamically loaded content
const observer = new MutationObserver(function(mutations) {
mutations.forEach(function(mutation) {
    if (mutation.addedNodes.length) {
        // Re-initialize search for any new content
        const $searchInput = $('#searchInput');
        if ($searchInput.length && $searchInput.val().trim().length >= searchConfig.minSearchLength) {
            const searchTerm = $searchInput.val().toLowerCase().trim();
            const $musicCards = $('.card[data-title]');
            performRealTimeFilter(searchTerm, $musicCards);
        }
    }
});
});

// Start observing the document with the configured parameters
observer.observe(document.body, { childList: true, subtree: true });

console.log('Search system initialized with API track support');
