
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

    const changeBgButton = document.getElementById('change-bg-btn');
    const bgTargetsSelector = '.content, .welcome-box, .music-icons, footer, body';
    function applyBg(color) {
        document.querySelectorAll(bgTargetsSelector).forEach(el => { el.style.backgroundColor = color; });
    }
    const colors = ['#181818', '#2a3d45', '#5e2a47', '#1f4d3d', '#3c3c3c'];
    let currentColorIndex = 0;
    const stored = localStorage.getItem('nerd_bg');
    if (stored) {
        const idx = colors.indexOf(stored);
        currentColorIndex = idx >= 0 ? idx : 0;
        applyBg(colors[currentColorIndex]);
    }
    if (changeBgButton) {
        changeBgButton.addEventListener('click', () => {
            currentColorIndex = (currentColorIndex + 1) % colors.length;
            const color = colors[currentColorIndex];
            applyBg(color);
            localStorage.setItem('nerd_bg', color);
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