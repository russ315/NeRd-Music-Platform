document.addEventListener('DOMContentLoaded', function() {
    // Load profile data from localStorage
    loadProfileData();
    
    // Load statistics
    loadStatistics();
    
    // Event listeners for buttons
    document.getElementById('editProfileBtn').addEventListener('click', openEditProfileModal);
    document.getElementById('settingsBtn').addEventListener('click', toggleSettingsSection);
    document.getElementById('editAvatarBtn').addEventListener('click', openAvatarModal);
    
    // Modal close buttons
    document.getElementById('closeEditModal').addEventListener('click', closeEditProfileModal);
    document.getElementById('closeAvatarModal').addEventListener('click', closeAvatarModal);
    document.getElementById('cancelEditBtn').addEventListener('click', closeEditProfileModal);
    document.getElementById('cancelAvatarBtn').addEventListener('click', closeAvatarModal);
    
    // Close modals when clicking outside
    document.getElementById('editProfileModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeEditProfileModal();
        }
    });
    
    document.getElementById('avatarModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeAvatarModal();
        }
    });
    
    // Form submission
    document.getElementById('editProfileForm').addEventListener('submit', saveProfileData);
    
    // Avatar color picker
    var colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(function(option) {
        option.addEventListener('click', function() {
            selectAvatarColor(this.getAttribute('data-color'));
        });
    });
    
    // Settings toggles
    var settingsToggles = document.querySelectorAll('.toggle-switch input');
    settingsToggles.forEach(function(toggle) {
        toggle.addEventListener('change', function() {
            saveSettings(this.id, this.checked);
        });
    });
    
    // Delete account button
    document.getElementById('deleteAccountBtn').addEventListener('click', confirmDeleteAccount);

    // Load settings from localStorage
    loadSettings();
});

function loadProfileData() {
    var profileData = getProfileFromStorage();
    
    if (profileData.name) {
        document.getElementById('profileName').textContent = profileData.name;
        document.getElementById('editName').value = profileData.name;
        updateAvatarInitials(profileData.name);
    }
    
    if (profileData.email) {
        document.getElementById('profileEmail').textContent = profileData.email;
        document.getElementById('editEmail').value = profileData.email;
    }
    
    if (profileData.bio) {
        document.getElementById('editBio').value = profileData.bio;
    }
    
    if (profileData.avatarColor) {
        var avatar = document.getElementById('profileAvatar');
        avatar.style.background = profileData.avatarColor;
    }
}

function getProfileFromStorage() {
    try {
        var data = localStorage.getItem('NeRuaD_profile');
        var userData = localStorage.getItem('NeRuaD_user');
        var oldData = userData ? JSON.parse(userData) : null;
        
        return data ? JSON.parse(data) : {
            name: oldData?.username || 'Default User',
            email: oldData?.email || '',
            bio: '',
            avatarColor: 'linear-gradient(135deg, #E8FF8A, #97fcad)'
        };
    } catch(e) {
        console.error('Error loading profile:', e);
        return {
            name: 'Default User',
            email: '',
            bio: '',
            avatarColor: 'linear-gradient(135deg, #E8FF8A, #97fcad)'
        };
    }
}

function saveProfileToStorage(data) {
    localStorage.setItem('NeRuaD_profile', JSON.stringify(data));
}

function updateAvatarInitials(name) {
    var initials = name.split(' ').map(function(word) {
        return word.charAt(0).toUpperCase();
    }).slice(0, 2).join('');
    
    document.querySelector('.avatar-initials').textContent = initials;
}

function loadStatistics() {
    if (window.FavoritesManager && window.FavoritesManager.isUserLoggedIn()) {
        var favCount = window.FavoritesManager.getUserFavoritesCount();
        document.getElementById('totalTracks').textContent = favCount;
    } else {
        document.getElementById('totalTracks').textContent = '0';
    }
    
    var playlistsCount = getPlaylists().length;
    animateCounter('totalPlaylists', playlistsCount);
    animateCounter('listeningTime', Math.ceil(Math.random()*100), 'h');
    
    calculateAverageRating();
}

function animateCounter(elementId, target, suffix) {
    suffix = suffix || '';
    var element = document.getElementById(elementId);
    if (!element) return;
    if (!target || target <= 0) {
        element.textContent = '0' + suffix;
        return;
    }
    var current = 0;
    var increment = target / 50;
    var timer = setInterval(function() {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current) + suffix;
    }, 20);
}

function calculateAverageRating() {
    try {
        var ratings = JSON.parse(localStorage.getItem('NeRuaD_ratings') || '{}');
        var values = Object.values(ratings);
        
        if (values.length === 0) {
            document.getElementById('averageRating').textContent = '0.0';
            return;
        }
        
        var sum = values.reduce(function(a, b) { return a + b; }, 0);
        var avg = (sum / values.length).toFixed(1);
        document.getElementById('averageRating').textContent = avg;
    } catch(e) {
        document.getElementById('averageRating').textContent = '0.0';
    }
}

function openEditProfileModal() {
    document.getElementById('editProfileModal').classList.add('active');
}

function closeEditProfileModal() {
    document.getElementById('editProfileModal').classList.remove('active');
}

function openAvatarModal() {
    document.getElementById('avatarModal').classList.add('active');
}

function closeAvatarModal() {
    document.getElementById('avatarModal').classList.remove('active');
}

function toggleSettingsSection() {
    var settingsSection = document.getElementById('settingsSection');
    if (settingsSection.style.display === 'none' || settingsSection.style.display === '') {
        settingsSection.style.display = 'block';
        // Scroll to settings
        settingsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        settingsSection.style.display = 'none';
    }
}

function saveProfileData(e) {
    e.preventDefault();
    
    var name = document.getElementById('editName').value.trim();
    var email = document.getElementById('editEmail').value.trim();
    var bio = document.getElementById('editBio').value.trim();
    
    if (!name || !email) {
        showNotification('Error', 'Name and email are required', 'error');
        return;
    }
    
    // Email validation
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Error', 'Please enter a valid email address', 'error');
        return;
    }
    
    var profileData = getProfileFromStorage();
    profileData.name = name;
    profileData.email = email;
    profileData.bio = bio;
    
    saveProfileToStorage(profileData);
    loadProfileData();
    closeEditProfileModal();
    
    showNotification('Success', 'Profile updated successfully!', 'success');
}

function selectAvatarColor(color) {
    // Remove selected class from all options
    var options = document.querySelectorAll('.color-option');
    options.forEach(function(opt) {
        opt.classList.remove('selected');
    });
    
    // Add selected class to clicked option
    event.target.classList.add('selected');
    
    // Update avatar background
    var avatar = document.getElementById('profileAvatar');
    avatar.style.background = color;
    
    // Save to localStorage
    var profileData = getProfileFromStorage();
    profileData.avatarColor = color;
    saveProfileToStorage(profileData);
    
    // Close modal after short delay
    setTimeout(function() {
        closeAvatarModal();
        showNotification('Success', 'Avatar color updated!', 'success');
    }, 500);
}

function loadSettings() {
    try {
        var settings = JSON.parse(localStorage.getItem('NeRuaD_settings') || '{}');
        
        if (settings.emailNotifications !== undefined) {
            document.getElementById('emailNotifications').checked = settings.emailNotifications;
        }
        if (settings.autoPlay !== undefined) {
            document.getElementById('autoPlay').checked = settings.autoPlay;
        }
        if (settings.explicitContent !== undefined) {
            document.getElementById('explicitContent').checked = settings.explicitContent;
        }
        if (settings.privateProfile !== undefined) {
            document.getElementById('privateProfile').checked = settings.privateProfile;
        }
    } catch(e) {
        console.error('Error loading settings:', e);
    }
}

function saveSettings(settingId, value) {
    try {
        var settings = JSON.parse(localStorage.getItem('NeRuaD_settings') || '{}');
        settings[settingId] = value;
        localStorage.setItem('NeRuaD_settings', JSON.stringify(settings));
        
        showNotification('Success', 'Setting updated', 'success');
    } catch(e) {
        console.error('Error saving settings:', e);
        showNotification('Error', 'Failed to save settings', 'error');
    }
}

function confirmDeleteAccount() {
    var confirmed = confirm('Are you sure you want to delete your account? This action cannot be undone.');
    
    if (confirmed) {
        var doubleConfirm = confirm('This will permanently delete all your data. Are you absolutely sure?');
        
        if (doubleConfirm) {
            // Clear all user data
            localStorage.removeItem('NeRuaD_profile');
            localStorage.removeItem('NeRuaD_favourites');
            localStorage.removeItem('NeRuaD_ratings');
            localStorage.removeItem('NeRuaD_settings');
            
            showNotification('Account Deleted', 'Your account has been deleted', 'info');
            
            // Redirect to home page after delay
            setTimeout(function() {
                window.location.href = '../../index.html';
            }, 2000);
        }
    }
}

function getPlaylists() {
    try {
        return JSON.parse(localStorage.getItem('NeRuaD_playlists') || '[]');
    } catch (e) {
        return [];
    }
}

function savePlaylists(playlists) {
    localStorage.setItem('NeRuaD_playlists', JSON.stringify(playlists));
}


function showNotification(title, message, type) {
    // Check if showNotification is available from shared-ux.js
    if (window.showNotification) {
        window.showNotification(title, message, type, 3000);
    } else {
        // Fallback notification
        var banner = document.createElement('div');
        banner.className = 'notification-banner ' + type;
        banner.innerHTML = '<strong>' + title + '</strong><p style="margin: 5px 0 0 0;">' + message + '</p>';
        document.body.appendChild(banner);
        
        setTimeout(function() {
            banner.style.opacity = '0';
            setTimeout(function() {
                banner.remove();
            }, 300);
        }, 3000);
    }
}
