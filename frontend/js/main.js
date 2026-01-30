
document.addEventListener('DOMContentLoaded', () => {
    const accordionItems = document.querySelectorAll('.accordion-item');
    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        header.addEventListener('click', () => {
            const content = item.querySelector('.accordion-content');
            const isActive = item.classList.contains('active');

            accordionItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                otherItem.querySelector('.accordion-content').style.maxHeight = null;
            });

            if (!isActive) {
                item.classList.add('active');
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });

    const openPopupButton = document.getElementById('open-popup-btn');
    const closePopupButton = document.getElementById('close-popup-btn');
    const popupOverlay = document.getElementById('popup-overlay');

    if (openPopupButton) {
        openPopupButton.addEventListener('click', () => {
            popupOverlay.style.display = 'flex';
        });
    }

    if (closePopupButton) {
        closePopupButton.addEventListener('click', () => {
            popupOverlay.style.display = 'none';
        });
    }

    if (popupOverlay) {
        popupOverlay.addEventListener('click', (event) => {
            if (event.target === popupOverlay) {
                popupOverlay.style.display = 'none';
            }
        });
    }

    const themeToggle = document.getElementById('themeToggle');

    function getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'dark';
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('NeRuaD_theme', theme);

        if (themeToggle) {
            themeToggle.textContent = theme === 'light' ? '🌞' : '🌙';
            themeToggle.title = theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme';
        }
    }

    const storedTheme = localStorage.getItem('NeRuaD_theme') || 'dark';
    setTheme(storedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = getCurrentTheme();
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        });
    }

    const dateTimeContainer = document.getElementById('datetime-container');
    function updateDateTime() {
        const now = new Date();
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };
        if(dateTimeContainer) {
            dateTimeContainer.textContent = now.toLocaleString('en-US', options);
        }
    }

    if (dateTimeContainer) {
        setInterval(updateDateTime, 1000);
        updateDateTime();
    }
});