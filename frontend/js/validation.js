
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.form-container form');
    if (!form) return;

    const username = document.getElementById('username');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirm-password');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateInputs()) {
            if(username){
                alert('Registration successful!');
                window.location.href = '../../index.html';
            }
            else{
                alert('Login successful!');
                window.location.href = '../../index.html';
            }

            console.log('Form is valid and ready to be submitted.');
            form.reset();
        }
    });

    const setError = (element, message) => {
        const inputControl = element.closest('.input-control');
        const errorDisplay = inputControl.querySelector('.error');

        errorDisplay.innerText = message;
        inputControl.classList.add('error');
        inputControl.classList.remove('success');
    };

    const setSuccess = (element) => {
        const inputControl = element.closest('.input-control');
        const errorDisplay = inputControl.querySelector('.error');

        errorDisplay.innerText = '';
        inputControl.classList.add('success');
        inputControl.classList.remove('error');
    };

    const isValidEmail = (email) => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };

    const validateInputs = () => {
        let isValid = true;
        const usernameValue = username?.value.trim();
        const emailValue = email?.value.trim();
        const passwordValue = password?.value.trim();
        const confirmPasswordValue = confirmPassword?.value.trim();

        if (usernameValue === '') {
            setError(username, 'Username is required');
            isValid = false;
        } else if (usernameValue != undefined)
        {
            setSuccess(username);
        }

        if (emailValue === '') {
            setError(email, 'Email is required');
            isValid = false;
        } else if (!isValidEmail(emailValue)) {
            setError(email, 'Provide a valid email address');
            isValid = false;
        } else if (emailValue) {
            setSuccess(email);
        }

        if (passwordValue === '') {
            setError(password, 'Password is required');
            isValid = false;
        } else if (passwordValue.length < 8) {
            setError(password, 'Password must be at least 8 characters long');
            isValid = false;
        } else if (passwordValue) {
            setSuccess(password);
        }

        if (confirmPasswordValue === '') {
            setError(confirmPassword, 'Please confirm your password');
            isValid = false;
        } else if (confirmPasswordValue !== passwordValue && confirmPasswordValue != undefined) {
            setError(confirmPassword, "Passwords don't match");
            isValid = false;
        } else if (confirmPasswordValue != undefined) {
            setSuccess(confirmPassword);
        }

        return isValid;
    };
});