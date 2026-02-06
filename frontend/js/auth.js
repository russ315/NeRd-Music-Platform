(function() {
    'use strict';
    
    function isLoggedIn() {
        return localStorage.getItem('NeRuaD_auth') === 'true';
    }
    
    function getUserData() {
        try {
            const userData = localStorage.getItem('NeRuaD_user');
            return userData ? JSON.parse(userData) : null;
        } catch(e) {
            return null;
        }
    }
    
    function logout() {
        const confirmed = confirm('Are you sure you want to logout?');
        if (confirmed) {
            localStorage.removeItem('NeRuaD_auth');
            localStorage.removeItem('NeRuaD_user');
            localStorage.removeItem('NeRuaD_token');
            
            if (window.showNotification) {
                showNotification('Logged Out', 'You have been logged out successfully', 'info', 2000);
            }
            
            setTimeout(function() {
                window.location.href = window.location.pathname.includes('/frontend/') 
                    ? '../../index.html' 
                    : 'index.html';
            }, 500);
        }
    }
    
    function updateNavigation() {
        const loggedIn = isLoggedIn();
        const userData = getUserData();
        
        const authButtonsContainer = document.querySelector('.btn-group');
        
        if (!authButtonsContainer) return;
        
        if (loggedIn) {
            const username = userData?.username || userData?.email?.split('@')[0] || 'User';
            
            authButtonsContainer.innerHTML = `
                <a class="btn btn-outline-secondary text-light" href="${window.location.pathname.includes('/frontend/') ? '' : 'frontend/html/'}profile.html">
                    👤 ${username}
                </a>
                <button class="btn btn-warning" id="logoutBtn">
                    🚪 Logout
                </button>
            `;
            
            // Add logout event listener
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', logout);
            }
        } else {
            // User is not logged in - show Login and Sign Up
            const pathPrefix = window.location.pathname.includes('/frontend/') ? '' : 'frontend/html/';
            
            authButtonsContainer.innerHTML = `
                <a class="btn btn-outline-secondary text-light" href="${pathPrefix}login.html" data-i18n="login">Login</a>
                <a class="btn btn-warning" href="${pathPrefix}register.html" data-i18n="signup">Sign Up</a>
            `;
        }
    }
    
    // Protect profile page - redirect if not logged in
    function protectProfilePage() {
        const currentPath = window.location.pathname;
        
        if (currentPath.includes('profile.html') && !isLoggedIn()) {
            alert('Please login to access your profile');
            window.location.href = 'login.html';
        }
    }
    
    // Initialize auth on page load
    function init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                updateNavigation();
                protectProfilePage();
            });
        } else {
            updateNavigation();
            protectProfilePage();
        }
    }
    
    // Make logout function globally available
    window.NeRuaDLogout = logout;
    window.NeRuaDIsLoggedIn = isLoggedIn;
    window.NeRuaDGetUserData = getUserData;
    
    // Initialize
    init();
})();
