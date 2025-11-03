$(document).ready(function() {



    function initializeScrollProgressBar() {
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


    function initializeAnimatedCounters() {
        function animateCounter($element, target, duration = 2000) {
            const start = 0;
            const increment = target / (duration / 16);
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


    function initializeLoadingSpinners() {
        $('form').on('submit', function(e) {
            e.preventDefault();

            const $form = $(this);
            const $submitBtn = $form.find('button[type="submit"], input[type="submit"]');

            if ($submitBtn.length && !$submitBtn.hasClass('btn-loading')) {
                showLoadingSpinner($submitBtn);

                setTimeout(() => {
                    hideLoadingSpinner($submitBtn);
                    showNotification('Form Submitted!', 'Your form has been submitted successfully', 'success', 3000);
                    console.log('Form submitted successfully');
                }, 3000);
            }
        });

        $('.btn-submit').on('click', function(e) {
            e.preventDefault();

            const $btn = $(this);

            if (!$btn.hasClass('btn-loading')) {
                showLoadingSpinner($btn);


                setTimeout(() => {
                    hideLoadingSpinner($btn);
                    showNotification('Action Completed!', 'Your action has been completed successfully', 'success', 2500);
                    console.log('Action completed successfully');
                }, 2000);
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


    function initializeNotificationSystem() {
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

        function hideNotification() {
            $('#notificationContainer').removeClass('show');
        }

        $(document).on('click', '.notification-close', hideNotification);

        $(document).on('click', '#notificationContainer', function(e) {
            if (e.target === this) {
                hideNotification();
            }
        });

        console.log('Notification System initialized');
    }


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


    function initializeLazyLoading() {
        $('img').each(function() {
            const $img = $(this);


            if ($img.attr('id') === 'playerAlbumArt' || $img.hasClass('player-album-art')) {
                return;
            }

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

        loadVisibleImages();

        $(window).on('scroll', function() {
            loadVisibleImages();
        });

        $(window).on('resize', function() {
            loadVisibleImages();
        });

        console.log('Lazy Loading initialized');
    }

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

    initializeSharedUX();


});
