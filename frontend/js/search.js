$(document).ready(function() {
    //#region jQuery Search System
    
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
    
    // Task 1: Real-time Search and Live Filter
    function initializeRealTimeSearch() {
        const $searchInput = $('#searchInput');
        const $musicCards = $('.card[data-title]');
        
        const debouncedSearch = debounce(function(searchTerm) {
            performRealTimeFilter(searchTerm, $musicCards);
        }, searchConfig.debounceDelay);
        
        $searchInput.on('keyup', function() {
            const searchTerm = $(this).val().toLowerCase().trim();
            
            if (searchTerm.length >= searchConfig.minSearchLength) {
                debouncedSearch(searchTerm);
            } else if (searchTerm.length === 0) {
                $musicCards.show().removeClass('search-filtered');
                clearSearchHighlighting();
                $('#no-results-message').remove();
            }
        });
        
        $('#searchBtn').on('click', function() {
            const searchTerm = $searchInput.val().toLowerCase().trim();
            if (searchTerm.length >= searchConfig.minSearchLength) {
                performRealTimeFilter(searchTerm, $musicCards);
            }
        });
        
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
        
        clearSearchHighlighting();
        
        $musicCards.each(function() {
            const $card = $(this);
            const title = $card.attr('data-title').toLowerCase();
            const cardText = $card.text().toLowerCase();
            
            if (title.includes(searchTerm) || cardText.includes(searchTerm)) {
                $card.show().addClass('search-filtered');
                hasResults = true;
            } else {
                $card.hide().removeClass('search-filtered');
            }
        });
        
        showNoResultsMessage(hasResults, searchTerm);
        
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
            const suggestionText = $(this).text();
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
    
    function initializeAdvancedSearch() {
        $('.genre-filter').on('click', function() {
            const genre = $(this).data('genre');
            performRealTimeFilter(genre.toLowerCase(), $('.card[data-title]'));
            $('#searchInput').val(genre);
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
    
    initializeSearchSystem();
    
    //#endregion
    
    //#region UX Engagement Elements with jQuery
    
    // Task 4: Colorful and Stylized Scroll Progress Bar
    function initializeScrollProgressBar() {
        // Create progress bar HTML
        const progressBarHtml = `
            <div id="scrollProgressBar" class="scroll-progress-container">
                <div class="scroll-progress-bar">
                    <div class="scroll-progress-fill"></div>
                    <div class="scroll-progress-text">Scroll Progress</div>
                </div>
            </div>
        `;
        
        $('body').append(progressBarHtml);
        
        $(window).on('scroll', function() {
            const scrollTop = $(window).scrollTop();
            const docHeight = $(document).height();
            const winHeight = $(window).height();
            const scrollPercent = (scrollTop / (docHeight - winHeight)) * 100;
            
            $('.scroll-progress-fill').css('width', scrollPercent + '%');
            
            $('.scroll-progress-text').text(`Scroll Progress: ${Math.round(scrollPercent)}%`);
            
            if (scrollPercent > 0) {
                $('.scroll-progress-bar').addClass('scrolling');
            } else {
                $('.scroll-progress-bar').removeClass('scrolling');
            }
        });
        
        console.log('Scroll Progress Bar initialized');
    }
    
    // Task 5: Animated Number Counter
    function initializeAnimatedCounters() {
        function animateCounter($element, target, duration = 2000) {
            const start = 0;
            const increment = target / (duration / 16); // 60fps
            let current = start;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                
                const formattedNumber = Math.floor(current).toLocaleString();
                $element.text(formattedNumber);
            }, 16);
        }
        
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                    const $counter = $(entry.target);
                    const targetValue = parseInt($counter.data('target'));
                    
                    if (targetValue) {
                        $counter.addClass('counted');
                        animateCounter($counter, targetValue);
                    }
                }
            });
        }, observerOptions);
        
        $('.animated-counter').each(function() {
            counterObserver.observe(this);
        });
        
        console.log('Animated Counters initialized');
    }
    
    // Task 6: Loading Spinner on Submit
    function initializeLoadingSpinners() {
        

        $('form').on('submit', function(e) {
            e.preventDefault();
            
            const $form = $(this);
            const $submitBtn = $form.find('button[type="submit"], input[type="submit"]');
            
            if ($submitBtn.length && !$submitBtn.hasClass('btn-loading')) {
                showLoadingSpinner($submitBtn);
                
                // Simulate server call
                setTimeout(() => {
                    hideLoadingSpinner($submitBtn);
                
                    $("#test-input").val('');
                    showNotification('Form Submitted!', 'Your form has been submitted successfully', 'success', 3000);
                    console.log('Form submitted successfully');
                }, 3000); // 3 second delay
                
            }
        });
        
        $('.btn-submit').on('click', function(e) {
            e.preventDefault();
            
            const $btn = $(this);
            
            if (!$btn.hasClass('btn-loading')) {
                showLoadingSpinner($btn);
                
                // Simulate server call
                setTimeout(() => {
                    hideLoadingSpinner($btn);
                    showNotification('Action Completed!', 'Your action has been completed successfully', 'success', 2500);
                    console.log('Action completed successfully');
                    $("#test-input").val('');

                }, 2000); // 2 second delay
            }
        });
        
        console.log('Loading Spinners initialized');
    }
    
    function showLoadingSpinner($button) {
        const originalText = $button.text();
        const originalHtml = $button.html();
        
        $button.data('original-text', originalText);
        $button.data('original-html', originalHtml);
        
        $button.addClass('btn-loading')
               .prop('disabled', true)
               .html(`
                   <span class="btn-text">${originalText}</span>
                   <div class="spinner"></div>
                   <span class="loading-text">Please wait...</span>
               `);
    }
    
    function hideLoadingSpinner($button) {
        const originalHtml = $button.data('original-html');
        
        $button.removeClass('btn-loading')
               .prop('disabled', false)
               .html(originalHtml);
    }
    
    function initializeUXEngagement() {
        console.log('Initializing UX Engagement Elements...');
        
        initializeScrollProgressBar();
        initializeAnimatedCounters();
        initializeLoadingSpinners();
        
        console.log('UX Engagement Elements initialized successfully!');
    }
    
    initializeUXEngagement();
    
    //#endregion
    
    //#region jQuery Web App Functionality Improvements
    
    // Task 7: Notification System
    function initializeNotificationSystem() {
        // Create notification container
        const notificationHtml = `
            <div id="notificationContainer" class="notification-container">
                <div class="notification-toast">
                    <div class="notification-icon">✓</div>
                    <div class="notification-content">
                        <div class="notification-title">Success!</div>
                        <div class="notification-message">Action completed successfully</div>
                    </div>
                    <button class="notification-close">&times;</button>
                </div>
            </div>
        `;
        
        $('body').append(notificationHtml);
        
        window.showNotification = function(title, message, type = 'success', duration = 3000) {
            const $container = $('#notificationContainer');
            const $toast = $container.find('.notification-toast');
            const $icon = $toast.find('.notification-icon');
            const $title = $toast.find('.notification-title');
            const $message = $toast.find('.notification-message');
            
            $title.text(title);
            $message.text(message);
            
            $toast.removeClass('success error warning info').addClass(type);
            switch(type) {
                case 'success':
                    $icon.text('✓');
                    break;
                case 'error':
                    $icon.text('✗');
                    break;
                case 'warning':
                    $icon.text('⚠');
                    break;
                case 'info':
                    $icon.text('ℹ');
                    break;
            }
            
            $container.addClass('show');
            
            setTimeout(() => {
                hideNotification();
            }, duration);
        };
        
        // Hide notification function
        function hideNotification() {
            $('#notificationContainer').removeClass('show');
        }
        
        // Close button handler
        $(document).on('click', '.notification-close', hideNotification);
        
        // Click outside to close
        $(document).on('click', '#notificationContainer', function(e) {
            if (e.target === this) {
                hideNotification();
            }
        });
        
        console.log('Notification System initialized');
    }
    
    // Task 8: Copy to Clipboard Button
    function initializeCopyToClipboard() {
        $('[data-copy]').each(function() {
            const $element = $(this);
            const copyText = $element.data('copy') || $element.text();
            
            const $copyBtn = $(`
                <button class="copy-btn" data-copy-text="${copyText}">
                    <span class="copy-icon">📋</span>
                    <span class="copy-text">Copy</span>
                </button>
            `);
            
            $copyBtn.attr('title', 'Click to copy');
            
            if ($element.is('input, textarea')) {
                $element.after($copyBtn);
            } else {
                $element.append($copyBtn);
            }
        });
        
        $(document).on('click', '.copy-btn', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const $btn = $(this);
            const textToCopy = $btn.data('copy-text');
            const $icon = $btn.find('.copy-icon');
            const $text = $btn.find('.copy-text');
            
            navigator.clipboard.writeText(textToCopy).then(() => {
                $icon.text('✓');
                $text.text('Copied!');
                $btn.addClass('copied');
                
                showNotification('Copied!', 'Text copied to clipboard', 'success', 2000);
                
                setTimeout(() => {
                    $icon.text('📋');
                    $text.text('Copy');
                    $btn.removeClass('copied');
                }, 2000);
                
            }).catch(err => {
                console.error('Failed to copy: ', err);
                showNotification('Error', 'Failed to copy to clipboard', 'error', 3000);
            });
        });
        
        $(document).on('copy', function(e) {
            showNotification('Copied!', 'Content copied to clipboard', 'info', 2000);
        });
        
        console.log('Copy to Clipboard initialized');
    }
    
    // Task 9: Image Lazy Loading
    function initializeLazyLoading() {
        // Add lazy loading to all images
        $('img').each(function() {
            const $img = $(this);
            const originalSrc = $img.attr('src');
            
            if ($img.data('lazy-processed')) return;
            
            $img.attr('data-src', originalSrc);
            $img.attr('src', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+');
            $img.addClass('lazy-image');
            $img.data('lazy-processed', true);
        });
        
        function lazyLoadImage($img) {
            const src = $img.data('src');
            if (src) {
                $img.attr('src', src);
                $img.removeClass('lazy-image');
                $img.addClass('lazy-loaded');
                
                $img.css('opacity', '0').animate({opacity: 1}, 500);
                
                if ($img.closest('.card').length) {
                    showNotification('Image Loaded', 'Content loaded successfully', 'info', 1500);
                }
            }
        }
        
        function isInViewport($img) {
            const elementTop = $img.offset().top;
            const elementBottom = elementTop + $img.outerHeight();
            const viewportTop = $(window).scrollTop();
            const viewportBottom = viewportTop + $(window).height();
            
            return elementBottom > viewportTop && elementTop < viewportBottom;
        }
        
        function loadVisibleImages() {
            $('.lazy-image').each(function() {
                const $img = $(this);
                if (isInViewport($img)) {
                    lazyLoadImage($img);
                }
            });
        }
        
        // loadVisibleImages();
        
        // Load on scroll
        $(window).on('scroll', function() {
            loadVisibleImages();
        });
        
        // Load on resize
        $(window).on('resize', function() {
            loadVisibleImages();
        });
        
        console.log('Lazy Loading initialized');
    }
    
    function initializeFunctionalityImprovements() {
        console.log('Initializing Web App Functionality Improvements...');
        
        initializeNotificationSystem();
        initializeCopyToClipboard();
        initializeLazyLoading();
        
        console.log('Web App Functionality Improvements initialized successfully!');
    }
    
    initializeFunctionalityImprovements();
    
    //#endregion
});
