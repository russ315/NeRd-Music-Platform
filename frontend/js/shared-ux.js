$(document).ready(function() {
    //#region Shared UX Engagement Elements
    
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
        
        // Add to body
        $('body').append(progressBarHtml);
        
        // Scroll progress calculation and animation
        $(window).on('scroll', function() {
            const scrollTop = $(window).scrollTop();
            const docHeight = $(document).height();
            const winHeight = $(window).height();
            const scrollPercent = (scrollTop / (docHeight - winHeight)) * 100;
            
            // Update progress bar
            $('.scroll-progress-fill').css('width', scrollPercent + '%');
            
            // Update text with percentage
            $('.scroll-progress-text').text(`Scroll Progress: ${Math.round(scrollPercent)}%`);
            
            // Add glow effect when scrolling
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
        // Counter animation function
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
                
                // Format number with commas
                const formattedNumber = Math.floor(current).toLocaleString();
                $element.text(formattedNumber);
            }, 16);
        }
        
        // Intersection Observer for counter animation
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
        
        // Observe all counter elements
        $('.animated-counter').each(function() {
            counterObserver.observe(this);
        });
        
        console.log('Animated Counters initialized');
    }
    
    // Task 6: Loading Spinner on Submit
    function initializeLoadingSpinners() {
        // Handle form submissions
        $('form').on('submit', function(e) {
            e.preventDefault();
            
            const $form = $(this);
            const $submitBtn = $form.find('button[type="submit"], input[type="submit"]');
            
            if ($submitBtn.length && !$submitBtn.hasClass('btn-loading')) {
                showLoadingSpinner($submitBtn);
                
                // Simulate server call
                setTimeout(() => {
                    hideLoadingSpinner($submitBtn);
                    // Show success notification
                    showNotification('Form Submitted!', 'Your form has been submitted successfully', 'success', 3000);
                    console.log('Form submitted successfully');
                }, 3000); // 3 second delay
            }
        });
        
        // Handle individual submit buttons
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
                }, 2000); // 2 second delay
            }
        });
        
        console.log('Loading Spinners initialized');
    }
    
    function showLoadingSpinner($button) {
        const originalText = $button.text();
        const originalHtml = $button.html();
        
        // Store original content
        $button.data('original-text', originalText);
        $button.data('original-html', originalHtml);
        
        // Add loading state
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
        
        // Remove loading state
        $button.removeClass('btn-loading')
               .prop('disabled', false)
               .html(originalHtml);
    }
    
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
        
        // Show notification function
        window.showNotification = function(title, message, type = 'success', duration = 3000) {
            const $container = $('#notificationContainer');
            const $toast = $container.find('.notification-toast');
            const $icon = $toast.find('.notification-icon');
            const $title = $toast.find('.notification-title');
            const $message = $toast.find('.notification-message');
            
            // Set content
            $title.text(title);
            $message.text(message);
            
            // Set icon and type
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
            
            // Show notification
            $container.addClass('show');
            
            // Auto hide after duration
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
        // Add copy buttons to elements with data-copy attribute
        $('[data-copy]').each(function() {
            const $element = $(this);
            const copyText = $element.data('copy') || $element.text();
            
            // Create copy button
            const $copyBtn = $(`
                <button class="copy-btn" data-copy-text="${copyText}">
                    <span class="copy-icon">📋</span>
                    <span class="copy-text">Copy</span>
                </button>
            `);
            
            // Add tooltip
            $copyBtn.attr('title', 'Click to copy');
            
            // Insert copy button
            if ($element.is('input, textarea')) {
                $element.after($copyBtn);
            } else {
                $element.append($copyBtn);
            }
        });
        
        // Handle copy button clicks
        $(document).on('click', '.copy-btn', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const $btn = $(this);
            const textToCopy = $btn.data('copy-text');
            const $icon = $btn.find('.copy-icon');
            const $text = $btn.find('.copy-text');
            
            // Copy to clipboard
            navigator.clipboard.writeText(textToCopy).then(() => {
                // Success feedback
                $icon.text('✓');
                $text.text('Copied!');
                $btn.addClass('copied');
                
                // Show notification
                showNotification('Copied!', 'Text copied to clipboard', 'success', 2000);
                
                // Reset after 2 seconds
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
        
        // Handle copy events
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
            
            // Skip if already has data-src (already processed)
            if ($img.data('lazy-processed')) return;
            
            // Set placeholder
            $img.attr('data-src', originalSrc);
            $img.attr('src', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+');
            $img.addClass('lazy-image');
            $img.data('lazy-processed', true);
        });
        
        // Lazy load function
        function lazyLoadImage($img) {
            const src = $img.data('src');
            if (src) {
                $img.attr('src', src);
                $img.removeClass('lazy-image');
                $img.addClass('lazy-loaded');
                
                // Fade in effect
                $img.css('opacity', '0').animate({opacity: 1}, 500);
                
                // Show notification for first few images
                if ($img.closest('.card').length) {
                    showNotification('Image Loaded', 'Content loaded successfully', 'info', 1500);
                }
            }
        }
        
        // Check if image is in viewport
        function isInViewport($img) {
            const elementTop = $img.offset().top;
            const elementBottom = elementTop + $img.outerHeight();
            const viewportTop = $(window).scrollTop();
            const viewportBottom = viewportTop + $(window).height();
            
            return elementBottom > viewportTop && elementTop < viewportBottom;
        }
        
        // Load images in viewport
        function loadVisibleImages() {
            $('.lazy-image').each(function() {
                const $img = $(this);
                if (isInViewport($img)) {
                    lazyLoadImage($img);
                }
            });
        }
        
        // Initial load
        loadVisibleImages();
        
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
    
    // Initialize all shared UX engagement elements
    function initializeSharedUX() {
        console.log('Initializing Shared UX Engagement Elements...');
        
        initializeScrollProgressBar();
        initializeAnimatedCounters();
        initializeLoadingSpinners();
        initializeNotificationSystem();
        initializeCopyToClipboard();
        initializeLazyLoading();
        
        console.log('Shared UX Engagement Elements initialized successfully!');
    }
    
    // Initialize the shared UX engagement system
    initializeSharedUX();
    
    //#endregion
});
