$(document).ready(function() {
    //#region jQuery Search System
    
    // Search data and configuration
    const searchConfig = {
        minSearchLength: 2,
        maxSuggestions: 8,
        debounceDelay: 300,
        highlightClass: 'search-highlight'
    };
    
    // Music data for autocomplete suggestions
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
    
    // FAQ data for search highlighting
    const faqData = [
        { question: 'How do I create a playlist?', answer: 'To create a playlist, navigate to the My Playlists section and click the New Playlist button.' },
        { question: 'Can I use this platform offline?', answer: 'Offline listening is a premium feature. Subscribers can download their favorite tracks.' },
        { question: 'How is my data protected?', answer: 'We take your privacy seriously. All user data is encrypted and stored securely.' }
    ];
    
    // Debounce function for performance
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
    
    // Task 1: Real-time Search and Live Filter
    function initializeRealTimeSearch() {
        const $searchInput = $('#searchInput');
        const $musicCards = $('.card[data-title]');
        
        // Debounced search function
        const debouncedSearch = debounce(function(searchTerm) {
            performRealTimeFilter(searchTerm, $musicCards);
        }, searchConfig.debounceDelay);
        
        // Real-time filtering on keyup
        $searchInput.on('keyup', function() {
            const searchTerm = $(this).val().toLowerCase().trim();
            
            if (searchTerm.length >= searchConfig.minSearchLength) {
                debouncedSearch(searchTerm);
            } else if (searchTerm.length === 0) {
                // Show all cards when search is cleared
                $musicCards.show().removeClass('search-filtered');
                clearSearchHighlighting();
                $('#no-results-message').remove();
            }
        });
        
        // Handle search button click
        $('#searchBtn').on('click', function() {
            const searchTerm = $searchInput.val().toLowerCase().trim();
            if (searchTerm.length >= searchConfig.minSearchLength) {
                performRealTimeFilter(searchTerm, $musicCards);
            }
        });
        
        // Handle Enter key
        $searchInput.on('keypress', function(e) {
            if (e.which === 13) {
                e.preventDefault();
                const searchTerm = $(this).val().toLowerCase().trim();
                if (searchTerm.length >= searchConfig.minSearchLength) {
                    performRealTimeFilter(searchTerm, $musicCards);
                }
            }
        });
    }
    
    function performRealTimeFilter(searchTerm, $musicCards) {
        let hasResults = false;
        
        // First, clear any existing highlights to prevent HTML corruption
        clearSearchHighlighting();
        
        $musicCards.each(function() {
            const $card = $(this);
            const title = $card.attr('data-title').toLowerCase();
            const cardText = $card.text().toLowerCase();
            
            // Check if search term matches title or any text in the card
            if (title.includes(searchTerm) || cardText.includes(searchTerm)) {
                $card.show().addClass('search-filtered');
                hasResults = true;
            } else {
                $card.hide().removeClass('search-filtered');
            }
        });
        
        // Show "no results" message if needed
        showNoResultsMessage(hasResults, searchTerm);
        
        // Highlight search terms in visible cards (only after filtering is complete)
        if (hasResults) {
            setTimeout(() => {
                highlightSearchTerms(searchTerm);
            }, 100);
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
    
    // Task 2: Autocomplete Search Suggestions
    function initializeAutocomplete() {
        const $searchInput = $('#searchInput');
        const $suggestions = $('#searchSuggestions');
        
        // Debounced autocomplete function
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
        
        // Hide suggestions when clicking outside
        $(document).on('click', function(e) {
            if (!$(e.target).closest('.search-container').length) {
                $suggestions.hide();
            }
        });
        
        // Handle suggestion selection
        $suggestions.on('click', '.suggestion-item', function() {
            const suggestionText = $(this).text();
            $searchInput.val(suggestionText);
            $suggestions.hide();
            
            // Trigger search with selected suggestion
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
    
    // Task 3: Search Highlighting
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
        // Clear previous highlights
        clearSearchHighlighting();
        
        if (searchTerm.length < searchConfig.minSearchLength) return;
        
        // Highlight in visible music cards - only highlight the title text, not the entire card
        $('.card[data-title].search-filtered .card-text').each(function() {
            const $element = $(this);
            highlightTextInElement($element, searchTerm);
        });
        
        // Highlight in FAQ content
        $('.accordion-content p').each(function() {
            const $element = $(this);
            highlightTextInElement($element, searchTerm);
        });
        
        // Highlight in accordion headers
        $('.accordion-header').each(function() {
            const $element = $(this);
            highlightTextInElement($element, searchTerm);
        });
    }
    
    function highlightTextInElement($element, searchTerm) {
        // Only highlight if the element doesn't already contain highlighted text
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
        // Remove all highlight spans and restore original text
        $(`.${searchConfig.highlightClass}`).each(function() {
            $(this).replaceWith($(this).text());
        });
        
        // Ensure all cards are properly displayed
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
    
    // Advanced search features
    function initializeAdvancedSearch() {
        // Search by genre
        $('.genre-filter').on('click', function() {
            const genre = $(this).data('genre');
            performRealTimeFilter(genre.toLowerCase(), $('.card[data-title]'));
            $('#searchInput').val(genre);
        });
        
        // Search history
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
        
        // Show search history on focus
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
    
    // Initialize all search features
    function initializeSearchSystem() {
        console.log('Initializing jQuery Search System...');
        
        // Check if required elements exist
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
    
    // Initialize the search system
    initializeSearchSystem();
    
    //#endregion
});
