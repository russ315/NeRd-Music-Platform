document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    if (!form) return;

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const usernameInput = document.getElementById('username');

    // Validation functions
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        return password.length >= 6 && /^(?=.*[a-zA-Z])(?=.*[0-9])/.test(password);
    };

    const validateUsername = (username) => {
        return username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9]+$/.test(username);
    };

    const showError = (message) => {
        if (window.showNotification) {
            showNotification('Error', message, 'error', 2000);
        } else {
            alert(message);
        }
    };

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = emailInput ? emailInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value.trim() : '';
        const username = usernameInput ? usernameInput.value.trim() : '';

        // Basic required field validation
        if (!email || !password || (usernameInput && !username)) {
            showError('Please fill in all required fields');
            return;
        }

        // Email validation
        if (!validateEmail(email)) {
            showError('Please enter a valid email address');
            emailInput?.focus();
            return;
        }

        // Password validation
        if (!validatePassword(password)) {
            showError('Password must be at least 6 characters long and contain at least one letter and one number');
            passwordInput?.focus();
            return;
        }

        // Username validation (only for registration)
        if (usernameInput && !validateUsername(username)) {
            showError('Username must be 3-20 characters long and contain only letters and numbers');
            usernameInput?.focus();
            return;
        }

        try {
            const isRegister = Boolean(usernameInput);
            const payload = isRegister ? { username, email, password } : { email, password };
            console.log(payload);
            const data = await ApiClient.request(isRegister ? '/auth/register' : '/auth/login', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            localStorage.setItem('NeRuaD_token', data.token);
            localStorage.setItem('NeRuaD_auth', 'true');
            localStorage.setItem('NeRuaD_user', JSON.stringify(data.user));

            if (window.showNotification) {
                showNotification('Success', isRegister ? 'Account created' : 'Logged in', 'success', 2000);
            }

            setTimeout(function() {
                window.location.href = '../../index.html';
            }, 300);
        } catch (error) {
            if (window.showNotification) {
                showNotification('Error', error.message, 'error', 2500);
            } else {
                alert(error.message);
            }
        }
    });
});
