document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    if (!form) return;

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const usernameInput = document.getElementById('username');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = emailInput ? emailInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value.trim() : '';
        const username = usernameInput ? usernameInput.value.trim() : '';

        if (!email || !password || (usernameInput && !username)) {
            if (window.showNotification) {
                showNotification('Error', 'Please заполните все поля', 'error', 2000);
            } else {
                alert('Please заполните все поля');
            }
            return;
        }

        try {
            const isRegister = Boolean(usernameInput);
            const payload = isRegister ? { username, email, password } : { email, password };
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
